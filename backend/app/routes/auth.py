"""auth.py — Copy to: backend/app/routes/auth.py"""
import traceback
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db, ProblemHistory, User
from app.services.auth_service import (
    create_user, authenticate_user, create_access_token,
    decode_token, get_user_by_email, get_user_by_id,
    safe_user_dict, is_strong_password,
)

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


# ── Request models ────────────────────────────────────────────
class SignupRequest(BaseModel):
    name:     str
    email:    str
    password: str

    @field_validator("name")
    @classmethod
    def name_ok(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v

    @field_validator("email")
    @classmethod
    def email_ok(cls, v):
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v


class LoginRequest(BaseModel):
    email:    str
    password: str


class SaveProblemRequest(BaseModel):
    subject:  str
    domain:   str = ""
    concept:  str = ""
    problem:  str
    answer:   str = ""
    sim_type: str = ""


# ── Auth dependency ───────────────────────────────────────────
def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db:    Session                       = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(401, "Not authenticated — please log in")
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(401, "Token expired or invalid — please log in again")
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(401, "Invalid token")
    user = get_user_by_id(db, int(uid))
    if not user or not user.is_active:
        raise HTTPException(401, "User not found")
    return user


# ── Routes ────────────────────────────────────────────────────
@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    try:
        # Validate password strength
        ok, msg = is_strong_password(data.password)
        if not ok:
            raise HTTPException(status_code=422, detail=msg)

        # Check duplicate email
        if get_user_by_email(db, data.email):
            raise HTTPException(status_code=409, detail="Email already registered")

        user  = create_user(db, data.name, data.email, data.password)
        token = create_access_token({"sub": str(user.id)})
        return {
            "success": True,
            "message": f"Welcome to SimAI, {user.name}! 🎉",
            "token":   token,
            "user":    safe_user_dict(user),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ SIGNUP ERROR:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, data.email.strip().lower(), data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        token = create_access_token({"sub": str(user.id)})
        return {
            "success": True,
            "message": f"Welcome back, {user.name}!",
            "token":   token,
            "user":    safe_user_dict(user),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ LOGIN ERROR:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {"success": True, "user": safe_user_dict(user)}


@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out"}


@router.post("/history")
def save_problem(
    data: SaveProblemRequest,
    user: User    = Depends(get_current_user),
    db:   Session = Depends(get_db),
):
    try:
        entry = ProblemHistory(
            user_id    = user.id,
            subject    = data.subject,
            domain     = data.domain,
            concept    = data.concept,
            problem    = data.problem[:500],
            answer     = data.answer[:200],
            sim_type   = data.sim_type,
            created_at = datetime.utcnow(),
        )
        db.add(entry)
        user.total_problems = (user.total_problems or 0) + 1
        user.xp             = (user.xp             or 0) + 10
        db.commit()
        return {"success": True, "total_problems": user.total_problems, "xp": user.xp}
    except Exception as e:
        print(f"\n❌ SAVE HISTORY ERROR:\n{traceback.format_exc()}")
        raise HTTPException(500, f"Could not save: {str(e)}")


@router.get("/history")
def get_history(
    limit:   int = 20,
    subject: str = "",
    user:    User    = Depends(get_current_user),
    db:      Session = Depends(get_db),
):
    q = db.query(ProblemHistory).filter(ProblemHistory.user_id == user.id)
    if subject:
        q = q.filter(ProblemHistory.subject == subject)
    rows = q.order_by(ProblemHistory.created_at.desc()).limit(limit).all()
    return {
        "success": True,
        "history": [
            {
                "id":         h.id,
                "subject":    h.subject,
                "domain":     h.domain,
                "concept":    h.concept,
                "problem":    h.problem,
                "answer":     h.answer,
                "sim_type":   h.sim_type,
                "created_at": h.created_at.isoformat() if h.created_at else None,
            }
            for h in rows
        ],
        "total": q.count(),
    }


@router.delete("/account")
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.is_active = False
    db.commit()
    return {"success": True, "message": "Account deleted"}


@router.put("/profile")
def update_profile(name: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not name or len(name.strip()) < 2:
        raise HTTPException(400, "Name too short")
    user.name = name.strip()
    db.commit()
    return {"success": True, "user": safe_user_dict(user)}