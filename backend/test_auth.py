"""
test_auth.py — Run this to find the exact auth error
Usage: cd backend && venv\Scripts\activate && python test_auth.py
"""
import sys

print("=" * 50)
print("SimAI Auth Diagnostic")
print("=" * 50)

# 1. Check packages
print("\n1. Checking installed packages...")
packages = {
    "passlib":    "from passlib.context import CryptContext",
    "bcrypt":     "import bcrypt",
    "jose":       "from jose import jwt",
    "sqlalchemy": "from sqlalchemy import create_engine",
    "fastapi":    "from fastapi import FastAPI",
}
missing = []
for name, imp in packages.items():
    try:
        exec(imp)
        print(f"  ✅ {name}")
    except ImportError as e:
        print(f"  ❌ {name}: {e}")
        missing.append(name)

if missing:
    print(f"\n  ⚠ MISSING: {missing}")
    print("  Run: pip install passlib[bcrypt] python-jose[cryptography] sqlalchemy")
    sys.exit(1)

# 2. Test database
print("\n2. Testing database...")
try:
    from app.database import create_tables, SessionLocal, User
    create_tables()
    db = SessionLocal()
    count = db.query(User).count()
    print(f"  ✅ Database OK — {count} users")
    db.close()
except Exception as e:
    print(f"  ❌ Database error: {e}")
    import traceback; traceback.print_exc()
    sys.exit(1)

# 3. Test auth_service
print("\n3. Testing auth service...")
try:
    from app.services.auth_service import (
        hash_password, verify_password,
        create_access_token, decode_token,
        is_strong_password, safe_user_dict,
    )
    # Hash test
    h = hash_password("TestPass123")
    assert verify_password("TestPass123", h), "verify failed"
    print("  ✅ Password hashing works")

    # Token test
    token = create_access_token({"sub": "999"})
    payload = decode_token(token)
    assert payload["sub"] == "999", "token decode failed"
    print("  ✅ JWT tokens work")

except Exception as e:
    print(f"  ❌ Auth service error: {e}")
    import traceback; traceback.print_exc()
    sys.exit(1)

# 4. Test signup flow
print("\n4. Testing signup flow...")
try:
    from app.services.auth_service import create_user, get_user_by_email
    from app.database import SessionLocal
    import random

    db   = SessionLocal()
    test_email = f"test_{random.randint(1000,9999)}@simai.test"

    user = create_user(db, "Test User", test_email, "TestPass123")
    print(f"  ✅ User created: id={user.id}, email={user.email}")

    found = get_user_by_email(db, test_email)
    assert found and found.id == user.id
    print("  ✅ User lookup works")

    # Cleanup
    db.delete(user); db.commit()
    db.close()
    print("  ✅ Cleanup done")

except Exception as e:
    print(f"  ❌ Signup flow error: {e}")
    import traceback; traceback.print_exc()
    sys.exit(1)

# 5. Test live endpoint
print("\n5. Testing live /api/auth/signup endpoint...")
import urllib.request, json, random

test_data = {
    "name":     "Test Student",
    "email":    f"live_test_{random.randint(1000,9999)}@test.com",
    "password": "TestPass123"
}

try:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/signup",
        data=json.dumps(test_data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        resp = json.loads(r.read())
    print(f"  ✅ Signup works! User: {resp['user']['name']}, Token: {resp['token'][:20]}...")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  ❌ HTTP {e.code}: {body}")
except Exception as e:
    print(f"  ❌ {e}")

print("\n" + "=" * 50)
print("Diagnostic complete.")
print("=" * 50)
