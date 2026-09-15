from sqladmin import ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User, Conversation, Message
from app.core.security import verify_password
from app.core.config import settings

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email, password = form.get("username"), form.get("password")
        
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user or not user.hashed_password:
                return False
            if not verify_password(password, user.hashed_password):
                return False
                
            # Optionally check if user is a superuser.
            # Since we don't have an is_superuser column yet, we allow all active users or a specific email.
            if not user.is_active:
                return False
                
            # Log the user in by storing token in session
            request.session.update({"token": user.id})
            return True
        finally:
            db.close()

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
            
        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.id == token).first()
            if not user or not user.is_active:
                return False
            return True
        finally:
            db.close()

authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.full_name, User.is_active, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.created_at]
    icon = "fa-solid fa-users"
    name = "User"
    name_plural = "Users"

class ConversationAdmin(ModelView, model=Conversation):
    column_list = [Conversation.id, Conversation.user_id, Conversation.title, Conversation.created_at]
    column_searchable_list = [Conversation.title, Conversation.id]
    column_sortable_list = [Conversation.created_at]
    icon = "fa-solid fa-comments"
    name = "Conversation"
    name_plural = "Conversations"

class MessageAdmin(ModelView, model=Message):
    column_list = [Message.id, Message.conversation_id, Message.role, Message.created_at]
    column_searchable_list = [Message.content, Message.id]
    column_sortable_list = [Message.created_at]
    icon = "fa-solid fa-message"
    name = "Message"
    name_plural = "Messages"
