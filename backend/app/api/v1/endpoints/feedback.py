import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from app.schemas.payload import FeedbackRequest
from ml_engine.telemetry.feedback_loop import FeedbackStore

router = APIRouter()
feedback_store = FeedbackStore()

@router.post("/")
def submit_feedback(payload: FeedbackRequest):
    """
    Logs user feedback (thumbs up / thumbs down) and optional corrections
    to improve the system over time.
    """
    try:
        entry = feedback_store.log_feedback(
            session_id=payload.session_id,
            query=payload.query,
            answer=payload.answer,
            chunks_used=payload.chunks_used,
            rating=payload.rating,
            correction=payload.correction
        )
        return {"status": "success", "logged_entry": entry}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
