from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import verify_token

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency to extract the HttpOnly JWT access token from the request cookies,
    verify it, and return the User object.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")
        
    payload = verify_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")
        
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User no longer exists.")
        
    return user
