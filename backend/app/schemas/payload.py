from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    jurisdiction: Optional[str] = "IN"  # "IN" for India, "INTL" for International

class SourceDoc(BaseModel):
    title: str
    snippet: str
    url: str
    source_type: str

class QueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[SourceDoc] = []

class FeedbackRequest(BaseModel):
    session_id: str
    query: str
    answer: str
    chunks_used: List[str] = []
    rating: str  # "positive" or "negative"
    correction: Optional[str] = None

class ClassifierAnswers(BaseModel):
    in_classical_text: bool = False
    intended_as_food: bool = False
    cosmetic_only: bool = False
    has_clinical_evidence: bool = False
    is_standardised_extract: bool = False
    contains_schedule_e_ingredients: bool = False

from pydantic import BaseModel, EmailStr, Field, field_validator
import re

def validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one number")
    if not re.search(r"[@$!%*?&]", v):
        raise ValueError("Password must contain at least one special character")
    return v

class UserSignup(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_strength(v)

class GoogleAuth(BaseModel):
    id_token: str

class ClassifierResponse(BaseModel):
    category: str
    description: str
    regulatory_pathway: str
