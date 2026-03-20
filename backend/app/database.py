"""
database.py
Copy to: backend/app/database.py

Uses SQLite (no external DB needed).
DB file is created automatically at: backend/simai.db
"""
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# SQLite database — stored in backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'simai.db')}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}   # needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Tables ────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    last_login      = Column(DateTime, nullable=True)
    # Gamification
    streak          = Column(Integer, default=0)
    total_problems  = Column(Integer, default=0)
    xp              = Column(Integer, default=0)


class ProblemHistory(Base):
    __tablename__ = "problem_history"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False, index=True)
    subject    = Column(String(50), nullable=False)
    domain     = Column(String(100), nullable=True)
    concept    = Column(String(200), nullable=True)
    problem    = Column(Text, nullable=False)
    answer     = Column(Text, nullable=True)
    sim_type   = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def create_tables():
    """Create all tables. Called at startup."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency — yields DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
