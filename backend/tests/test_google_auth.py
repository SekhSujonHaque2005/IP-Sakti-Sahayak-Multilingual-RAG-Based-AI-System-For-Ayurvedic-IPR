import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, Base, engine
from app.db.models import User

client = TestClient(app)

def test_google_auth_invalid_token():
    response = client.post("/api/v1/auth/google", json={"id_token": "invalid_bogus_token"})
    assert response.status_code == 401
    assert "Google authentication failed" in response.json()["detail"]

def test_google_auth_valid_mock_token():
    mock_payload = {
        "email": "test.ayurveda.doctor@example.com",
        "name": "Vaidya Test Sharma",
        "sub": "google-oauth2-1234567890",
        "aud": "883031480992-0tonv56j5i2t3aojdbc9iqd2fp7v9qh1.apps.googleusercontent.com",
    }
    
    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=mock_payload):
        response = client.post("/api/v1/auth/google", json={"id_token": "valid_mock_google_id_token"})
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Google Login successful"
        assert data["user"]["email"] == "test.ayurveda.doctor@example.com"
        assert data["user"]["full_name"] == "Vaidya Test Sharma"
        assert "access_token" in data
        assert "refresh_token" in data
        print("✓ test_google_auth_valid_mock_token passed!")

if __name__ == "__main__":
    test_google_auth_invalid_token()
    print("✓ test_google_auth_invalid_token passed!")
    test_google_auth_valid_mock_token()
    print("All Google OAuth tests passed successfully!")
