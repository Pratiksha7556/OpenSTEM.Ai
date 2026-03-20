"""
main.py — SimAI FastAPI app with auth
Copy to: backend/app/main.py
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SimAI — Physics Chemistry Maths", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Create DB tables on startup ───────────────────────────────
@app.on_event("startup")
def startup():
    try:
        from app.database import create_tables
        create_tables()
        print("✅ Database tables ready (simai.db)")
    except Exception as e:
        print(f"⚠️  DB setup warning: {e}")

# ── Include routers ───────────────────────────────────────────
try:
    from app.routes.analyze import router as analyze_router
    app.include_router(analyze_router, prefix="/api")
    print("✅ Analyze routes loaded")
except Exception as e:
    print(f"❌ Analyze routes error: {e}")
    import traceback; traceback.print_exc()

try:
    from app.routes.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/auth")
    print("✅ Auth routes loaded")
except Exception as e:
    print(f"❌ Auth routes error: {e}")
    import traceback; traceback.print_exc()

# ── Root endpoints ────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "SimAI API v3.0 ✅", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}