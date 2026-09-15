import asyncio
from app.db.database import SessionLocal, Base, engine
from app.db.models import User
from app.core.security import get_password_hash

def create_admin():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        email = "admin@vaidyasetu.com"
        password = "AdminPassword123!"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("Creating new admin user...")
            hashed_password = get_password_hash(password)
            user = User(
                email=email,
                hashed_password=hashed_password,
                full_name="Super Admin",
                is_active=True
            )
            db.add(user)
            db.commit()
            print(f"Admin created successfully!\nEmail: {email}\nPassword: {password}")
        else:
            print(f"Admin already exists!\nEmail: {email}\nPassword: {password}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
