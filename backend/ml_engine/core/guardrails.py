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

DISCLAIMERS = {
    "en": MANDATORY_DISCLAIMER,
    "hi": (
        "⚠️ अस्वीकरण: यह केवल विधिक एवं विनियामक जानकारी है, प्रत्यक्ष कानूनी सलाह नहीं। "
        "व्यावसायिक निर्णयों हेतु किसी योग्य बौद्धिक संपदा विशेषज्ञ, पंजीकृत पेटेंट एजेंट अथवा आयुष कानूनी प्रकोष्ठ से परामर्श लें।"
    ),
    "sa": (
        "⚠️ अस्वीकरणम्: इदं केवलं विधिक-विनियामक-सूचना, न तु विधिक-परामर्शः। "
        "प्रमाणित-विधिज्ञैः सह परामर्शः करणीयः।"
    ),
    "ta": (
        "⚠️ மறுப்பு: இது சட்ட மற்றும் ஒழுங்குமுறை தகவல் மட்டுமே, சட்ட ஆலோசனை அல்ல.",
    ),
    "te": (
        "⚠️ నిరాకరణ: ఇది చట్టపరమైన మరియు నియంత్రణ సమాచారం మాత్రమే, చట్టపరమైన సలహా కాదు.",
    ),
    "bn": (
        "⚠️ দাবিত্যাগ: এটি শুধুমাত্র আইনি ও নিয়ন্ত্রক তথ্য, কোনো আইনি পরামর্শ নয়।",
    ),
}

def get_disclaimer(language: str = "en") -> str:
    return DISCLAIMERS.get(language, DISCLAIMERS["en"])

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
