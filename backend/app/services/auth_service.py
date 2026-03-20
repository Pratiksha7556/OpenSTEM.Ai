"""
auth_service.py
Copy to: backend/app/services/auth_service.py

Uses Python built-in hashlib — NO bcrypt/passlib dependency issues.
"""
from datetime import datetime, timedelta
from typing import Optional
import os, hashlib, secrets, hmac

from sqlalchemy.orm import Session
from app.database import User

SECRET_KEY = os.getenv("SECRET_KEY", "simai-secret-key-2024-change-in-prod")
TOKEN_DAYS = 7

# ── JWT ───────────────────────────────────────────────────────
try:
    from jose import jwt as jose_jwt
    _HAS_JOSE = True
except ImportError:
    _HAS_JOSE = False


def create_access_token(data: dict) -> str:
    if not _HAS_JOSE:
        raise RuntimeError("Run: pip install python-jose[cryptography]")
    payload = {**data, "exp": datetime.utcnow() + timedelta(days=TOKEN_DAYS)}
    return jose_jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> Optional[dict]:
    if not _HAS_JOSE:
        return None
    try:
        return jose_jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        return None


# ── Password (Python built-in PBKDF2 — no bcrypt needed) ──────
def hash_password(password: str) -> str:
    """Returns  salt$hash  using PBKDF2-SHA256."""
    salt    = secrets.token_hex(32)
    pw_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 260000
    ).hex()
    return f"{salt}${pw_hash}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        salt, _ = stored.split("$", 1)
        expected = hashlib.pbkdf2_hmac(
            "sha256", plain.encode(), salt.encode(), 260000
        ).hex()
        return hmac.compare_digest(f"{salt}${expected}", stored)
    except Exception:
        return False


def is_strong_password(password: str) -> tuple:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Must contain at least one number"
    return True, "OK"


# ── User CRUD ─────────────────────────────────────────────────
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, name: str, email: str, password: str) -> User:
    user = User(
        name            = name.strip(),
        email           = email.lower().strip(),
        hashed_password = hash_password(password),
        created_at      = datetime.utcnow(),
        streak=0, total_problems=0, xp=0, is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    user.last_login = datetime.utcnow()
    db.commit()
    return user


def safe_user_dict(user: User) -> dict:
    return {
        "id":             user.id,
        "name":           user.name,
        "email":          user.email,
        "streak":         user.streak         or 0,
        "total_problems": user.total_problems or 0,
        "xp":             user.xp             or 0,
        "created_at":     user.created_at.isoformat() if user.created_at else None,
        "last_login":     user.last_login.isoformat()  if user.last_login  else None,
    }