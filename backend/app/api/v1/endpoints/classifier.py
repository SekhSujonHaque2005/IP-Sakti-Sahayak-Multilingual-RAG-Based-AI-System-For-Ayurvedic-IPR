import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from app.schemas.payload import ClassifierAnswers as APIAnswers, ClassifierResponse

# Import the actual logic and its dataclass
from ml_engine.legal_logic.formulation_classifier import classify_formulation, ClassifierAnswers

router = APIRouter()

@router.post("/formulation", response_model=ClassifierResponse)
def classify_product_formulation(answers: APIAnswers):
    """
    Takes a set of boolean answers about an Ayurvedic product and
    determines its strict legal category and regulatory pathway.
    """
    try:
        # Convert Pydantic model to the internal dataclass format
        internal_answers = ClassifierAnswers(
            in_classical_text=answers.in_classical_text,
            intended_as_food=answers.intended_as_food,
            cosmetic_only=answers.cosmetic_only,
            has_clinical_evidence=answers.has_clinical_evidence,
            is_standardised_extract=answers.is_standardised_extract,
            contains_schedule_e_ingredients=answers.contains_schedule_e_ingredients
        )
        
        result = classify_formulation(internal_answers)
        
        return ClassifierResponse(
            category=result.get("category", "unknown"),
            description=result.get("description", "Classification could not determine a description."),
            regulatory_pathway=result.get("pathway", "No pathway information available.")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

