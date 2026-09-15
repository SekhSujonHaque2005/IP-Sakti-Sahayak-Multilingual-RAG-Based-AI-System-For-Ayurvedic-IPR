from dataclasses import dataclass

@dataclass
class ClassifierAnswers:
    in_classical_text: bool = None
    intended_as_food: bool = None
    cosmetic_only: bool = None
    has_clinical_evidence: bool = None
    is_standardised_extract: bool = None
    contains_schedule_e_ingredients: bool = None

CATEGORY_NOTES = {
    "classical_generic_medicine": {
        "description": "Largely traditional knowledge based on classical texts.",
        "pathway": "Faces the Patents Act Section 3(p) patentability bar. Primarily defended via TKDL prior-art documentation, not patented."
    },
    "ayurveda_aahar": {
        "description": "Ayurvedic food products that do not make medical claims.",
        "pathway": "Governed by FSSAI's Ayurveda Aahara Regulations, 2022 --not a drug."
    },
    "cosmetic": {
        "description": "Products intended solely for beautification or external application without therapeutic claims.",
        "pathway": "Governed under the Drugs and Cosmetics Act's cosmetic provisions, separate from drug licensing requirements."
    },
    "new_drug": {
        "description": "A novel formulation claiming therapeutic benefits, often backed by clinical trials.",
        "pathway": "Genuine patent potential, but requires clinical safety/effectiveness evidence under the Drugs and Cosmetics Rules."
    },
    "phytopharmaceutical": {
        "description": "A purified and standardised plant extract intended for medical use.",
        "pathway": "A distinct regulatory category for standardised plant extracts, with its own approval pathway."
    },
    "proprietary_ayurvedic_medicine": {
        "description": "A novel mixture of traditional ingredients without a direct classical reference.",
        "pathway": "Requires a manufacturing license under Rule 158-B; patent potential depends on the specific novel aspects beyond the classical base."
    },
    "schedule_e_restricted": {
        "description": "A formulation containing Schedule E1 ingredients (poisonous substances) that require strict dosage control and prescription-only dispensing.",
        "pathway": "Subject to additional restrictions under the Drugs and Cosmetics Rules, Schedule E1. Manufacturing and sale require enhanced licensing, mandatory label warnings, and prescription-only dispensing."
    },
}

def classify_formulation(answers: ClassifierAnswers) -> dict:
    """Deterministic decision tree -- no LLM call, fully explainable."""
    if answers.in_classical_text:
        category = "classical_generic_medicine"
    elif answers.intended_as_food:
        category = "ayurveda_aahar"
    elif answers.cosmetic_only:
        category = "cosmetic"
    elif answers.has_clinical_evidence:
        category = "new_drug"
    elif answers.is_standardised_extract:
        category = "phytopharmaceutical"
    elif answers.contains_schedule_e_ingredients:
        category = "schedule_e_restricted"
    else:
        category = "proprietary_ayurvedic_medicine"
        
    return {
        "category": category,
        "description": CATEGORY_NOTES[category]["description"],
        "pathway": CATEGORY_NOTES[category]["pathway"]
    }

if __name__ == "__main__":
    print("Testing Classification Logic...")
    
    answers = ClassifierAnswers(
        in_classical_text=False,
        intended_as_food=False,
        cosmetic_only=False,
        has_clinical_evidence=False,
        is_standardised_extract=True,
        contains_schedule_e_ingredients=False,
    )
    
    result = classify_formulation(answers)
    print(f"Answers provided: {answers}")
    print(f"Classification Result: {result['category']}")
    print(f"Description: {result['description']}")
    print(f"Pathway: {result['pathway']}")
