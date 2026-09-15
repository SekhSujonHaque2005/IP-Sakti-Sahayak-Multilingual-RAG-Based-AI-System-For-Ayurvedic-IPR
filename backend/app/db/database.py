import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pathlib import Path

# Create data directory if it doesn't exist
DATA_DIR = Path("d:/DravyaNidhi/vaidyasetu/backend/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# We will use SQLite for local development, which perfectly simulates the PostgreSQL architecture.
# In production, this can be swapped to "postgresql://user:pass@localhost/db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/vaidyasetu.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
