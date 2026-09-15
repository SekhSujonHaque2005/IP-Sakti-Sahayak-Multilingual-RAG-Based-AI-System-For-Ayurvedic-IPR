import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from ml_engine.telemetry.session_manager import SessionManager

router = APIRouter()
session_manager = SessionManager()

@router.get("/")
def list_sessions(user_id: str = None):
    """
    Returns a list of all active sessions, optionally filtered by user_id.
    """
    try:
        sessions = session_manager.list_sessions(user_id=user_id)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}")
def get_session(session_id: str):
    """
    Returns the complete history and context for a specific session.
    """
    try:
        session = session_manager.get_session(session_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
