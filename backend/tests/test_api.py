from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine
import pytest

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Base.metadata.drop_all(bind=engine) # Keep data for inspection during dev

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200

def test_signup():
    payload = {
        "email": "test@vaidyasetu.com",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code in [200, 400] # 400 if already exists

def test_login():
    payload = {
        "email": "test@vaidyasetu.com",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert response.cookies.get("access_token") is not None
