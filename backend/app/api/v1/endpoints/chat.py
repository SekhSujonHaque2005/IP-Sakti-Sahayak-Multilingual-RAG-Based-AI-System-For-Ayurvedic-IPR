from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Conversation, Message
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns a list of all conversations for the logged-in user, sorted by newest first.
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at
        } for c in conversations
    ]

@router.get("/conversations/{conversation_id}")
def get_conversation_history(conversation_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns the full message history (or active branch) for a specific conversation.
    """
    # 1. Verify Ownership
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found or unauthorized.")
        
    # 2. Fetch Messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    
    return {
        "id": conversation.id,
        "title": conversation.title,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "thinking_content": m.thinking_content,
                "parent_id": m.parent_id,
                "created_at": m.created_at
            } for m in messages
        ]
    }
