import re

BLOCKED_INTENTS = [
    "medical_advice", "dosage", "diagnosis",
    "treatment_recommendation", "self_medication"
]

MEDICAL_PATTERNS = [
    r'\b(dose|dosage|how\s+much\s+to\s+take|mg|milligram)\b',
    r'\b(cure|treat|heal|remedy\s+for|medicine\s+for)\b',
    r'\b(diagnos|symptom|disease|illness|infection)\b',
    r'\b(should\s+i\s+take|can\s+i\s+eat|is\s+it\s+safe\s+to\s+consume)\b',
    r'\b(side\s+effect|contraindication|allergic|reaction)\b',
]

PROMPT_INJECTION_PATTERNS = [
    r'ignore\s+(all\s+)?previous\s+instructions',
    r'you\s+are\s+now\s+a',
    r'forget\s+(everything|all|your\s+instructions)',
    r'system\s*prompt',
    r'override\s+(your|the)\s+(rules|instructions)',
    r'pretend\s+you\s+are',
    r'act\s+as\s+if',
]

MANDATORY_DISCLAIMER = (
    "⚠️ Disclaimer: This is legal/regulatory information only, not legal advice. "
    "For actionable decisions, consult a qualified IP professional, a registered "
    "patent agent, or AIIA's IP facilitation cell."
)

PII_PATTERNS = [
    (r'\b[A-Z]{5}\d{4}[A-Z]\b', '[PAN_REDACTED]'),           # PAN
    (r'\b\d{4}\s?\d{4}\s?\d{4}\b', '[AADHAAR_REDACTED]'),     # Aadhaar
    (r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL_REDACTED]'),        # Email
    (r'\b\d{10}\b', '[PHONE_REDACTED]'),                       # Phone
]

def check_input_safety(query: str) -> dict:
    query_lower = query.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, query_lower):
            return {
                "safe": False,
                "reason": "prompt_injection",
                "message": "This query appears to contain an instruction override attempt. Please rephrase your legal/regulatory question."
            }
    for pattern in MEDICAL_PATTERNS:
        if re.search(pattern, query_lower):
            return {
                "safe": False,
                "reason": "medical_advice",
                "message": (
                    "This appears to be a medical/health question. VaidyaSetu provides "
                    "legal and regulatory guidance about Ayurveda IP — not medical advice. "
                    "Please consult a qualified Ayurvedic practitioner for health queries."
                )
            }
    return {"safe": True, "reason": None, "message": None}

def attach_disclaimer(answer: dict) -> dict:
    answer["disclaimer"] = MANDATORY_DISCLAIMER
    return answer

def scrub_pii(text: str) -> str:
    for pattern, replacement in PII_PATTERNS:
        text = re.sub(pattern, replacement, text)
    return text
