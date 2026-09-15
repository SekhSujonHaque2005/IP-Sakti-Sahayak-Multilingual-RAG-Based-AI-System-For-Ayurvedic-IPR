import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.api.deps import get_current_user

# Ensure we can import ml_engine which sits outside the 'app' directory
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))

from app.schemas.payload import QueryRequest
from ml_engine.pipeline import handle_query_stream
from app.core.rate_limit import limiter

router = APIRouter()

@router.post("/")
@limiter.limit("50/hour")
def ask_question_stream(
    request: Request, 
    payload: QueryRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Takes a natural language query, runs it through the ML engine pipeline, 
    and streams the synthesized answer token-by-token (SSE) back to the frontend.
    """
    try:
        return StreamingResponse(
            handle_query_stream(
                query=payload.query, 
                conversation_id=payload.session_id, 
                user_id=current_user.id,
                db=db
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        # If anything blows up deep in the ML engine, surface it as a 500 error
        raise HTTPException(status_code=500, detail=str(e))
