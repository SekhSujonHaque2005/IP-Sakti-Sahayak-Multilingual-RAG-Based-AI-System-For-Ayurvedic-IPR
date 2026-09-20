"""
Public (unauthenticated) endpoints for the frontend demo.
These bypass JWT auth so the landing page can call the RAG pipeline and
classifier without requiring login. For production, these should be
rate-limited or removed entirely.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))

from app.schemas.payload import QueryRequest, ClassifierAnswers, ClassifierResponse
from ml_engine.pipeline import handle_query
from ml_engine.legal_logic.formulation_classifier import (
    classify_formulation,
    ClassifierAnswers as InternalClassifierAnswers,
)
from app.core.rate_limit import limiter

router = APIRouter()


# ── Public RAG Query (non-streaming, no auth) ──────────────────────
@router.post("/query")
@limiter.limit("30/hour")
def public_query(request: Request, payload: QueryRequest):
    """
    Public RAG endpoint. Returns the full answer as JSON (no SSE streaming).
    """
    try:
        result = handle_query(
            query=payload.query,
            session_id=payload.session_id or "guest",
            jurisdiction=payload.jurisdiction or "IN",
            language=payload.language or "en",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Public Formulation Classifier (no auth) ────────────────────────
@router.post("/classifier/formulation", response_model=ClassifierResponse)
@limiter.limit("60/hour")
def public_classify(request: Request, answers: ClassifierAnswers):
    """
    Public formulation classifier. Takes boolean answers and returns
    the regulatory category + pathway.
    """
    try:
        internal = InternalClassifierAnswers(
            in_classical_text=answers.in_classical_text,
            intended_as_food=answers.intended_as_food,
            cosmetic_only=answers.cosmetic_only,
            has_clinical_evidence=answers.has_clinical_evidence,
            is_standardised_extract=answers.is_standardised_extract,
            contains_schedule_e_ingredients=answers.contains_schedule_e_ingredients,
        )
        result = classify_formulation(internal)
        return ClassifierResponse(
            category=result.get("category", "unknown"),
            description=result.get("description", ""),
            regulatory_pathway=result.get("pathway", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
