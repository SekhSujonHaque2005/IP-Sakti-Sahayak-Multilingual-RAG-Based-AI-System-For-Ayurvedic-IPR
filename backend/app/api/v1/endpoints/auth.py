from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.payload import UserSignup, UserLogin, ForgotPassword, ResetPassword, GoogleAuth
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, create_password_reset_token, verify_token
from app.core.email import send_welcome_email, send_password_reset_email
from app.core.rate_limit import limiter
import google.auth.transport.requests
from google.oauth2 import id_token
from app.core.config import settings

router = APIRouter()

def set_auth_cookies(response: Response, user_id: str):
    access_token = create_access_token(subject=user_id)
    refresh_token = create_refresh_token(subject=user_id)
    
    # HttpOnly cookies prevent XSS attacks
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        secure=True, 
        samesite="strict",
        max_age=900 # 15 minutes
    )
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure=True, 
        samesite="strict",
        max_age=604800 # 7 days
    )

@router.post("/signup")
def signup(payload: UserSignup, background_tasks: BackgroundTasks, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(payload.password)
    new_user = User(email=payload.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send Welcome Email Asynchronously
    background_tasks.add_task(send_welcome_email, new_user.email)
    
    # Log them in instantly
    set_auth_cookies(response, new_user.id)
    return {"message": "Account created successfully"}

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    set_auth_cookies(response, user.id)
    return {"message": "Login successful"}

@router.post("/google")
def google_auth(payload: GoogleAuth, background_tasks: BackgroundTasks, response: Response, db: Session = Depends(get_db)):
    try:
        # Verify Google Token securely using Google's public keys
        request = google.auth.transport.requests.Request()
        id_info = id_token.verify_oauth2_token(payload.id_token, request, settings.GOOGLE_CLIENT_ID)
        email = id_info.get("email")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Provision new account for Google User
            user = User(email=email, hashed_password="") # Empty hash for OAuth users
            db.add(user)
            db.commit()
            db.refresh(user)
            background_tasks.add_task(send_welcome_email, user.email)
            
        set_auth_cookies(response, user.id)
        return {"message": "Google Login successful"}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google Token")

@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        reset_token = create_password_reset_token(email=user.email)
        background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    # Always return success to prevent email enumeration attacks
    return {"message": "If that email exists, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(payload: ResetPassword, db: Session = Depends(get_db)):
    payload_data = verify_token(payload.token, expected_type="reset")
    if not payload_data:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    email = payload_data.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
