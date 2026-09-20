def compute_confidence(retrieved_chunks: list, verified_claims: list,
                       supersession_check_fn, total_claims: int = None) -> dict:
    """
    Compute a confidence score from three signals:
    1. Verification rate — what fraction of claims survived verification
    2. Currency — are the cited documents current (not superseded)?
    3. Agreement — do the top results come from related sources?
    """
    if not retrieved_chunks or not verified_claims:
        return {"score": 0.0, "level": "low", "reason": "No verified claims available."}

    # Signal 1: fraction of generated claims that survived verification
    denominator = total_claims if total_claims else len(retrieved_chunks)
    verification_rate = len(verified_claims) / max(1, denominator)

    # Signal 2: currency -- what fraction of cited documents are current?
    current_flags = []
    for c in retrieved_chunks:
        try:
            resolution = supersession_check_fn(c["document"])
            current_flags.append(resolution["current_document"] == c["document"])
        except Exception:
            current_flags.append(True)  # Assume current if check fails
    currency_rate = sum(current_flags) / max(1, len(current_flags))

    # Signal 3: retrieval agreement -- did top chunks come from related sources?
    top_docs = [c["document"] for c in retrieved_chunks[:3]]
    agreement_rate = len(set(top_docs)) / max(1, len(top_docs))
    agreement_score = 1 - agreement_rate

    score = (0.6 * verification_rate) + (0.3 * currency_rate) + (0.1 * agreement_score)
    if verification_rate >= 0.8:
        score = max(score, 0.85)

    if score >= 0.7:
        level = "high"
    elif score >= 0.4:
        level = "medium"
    else:
        level = "low"
    return {"score": round(score, 2), "level": level}


LOW_CONFIDENCE_MESSAGES = {
    "en": (
        "I don't have a reliable, statutory sourced answer to this question. "
        "This may need a qualified IP/regulatory professional — "
        "consider consulting AIIA's IP facilitation cell or a registered patent agent."
    ),
    "hi": (
        "मेरे पास इस प्रश्न के लिए विश्वसनीय सांविधिक साक्ष्य उपलब्ध नहीं हैं। "
        "इसके लिए किसी योग्य विधिक या पेटेंट विशेषज्ञ से परामर्श आवश्यक हो सकता है — "
        "कृपया AIIA के IP सेल या पंजीकृत पेटेंट एजेंट से संपर्क करने पर विचार करें।"
    ),
    "sa": (
        "अस्य प्रश्नस्य कृते विश्वसनीया सांविधिकी सूचना न प्राप्ता। "
        "विधिक-विशेषज्ञस्य परामर्शः आवश्यकः भवितुम् अर्हति।"
    ),
    "ta": (
        "இந்தக் கேள்விக்கு நம்பகமான சட்ட ஆதாரம் கிடைக்கவில்லை. "
        "தகுதியான சட்ட ஆலோசகர் அல்லது காப்புரிமை முகவரை அணுகவும்."
    ),
    "te": (
        "ఈ ప్రశ్నకు నమ్మదగిన చట్టపరమైన ఆధారం అందుబాటులో లేదు. "
        "దయచేసి అర్హత కలిగిన పేటెంట్ ఏజెంట్ లేదా న్యాయ నిపుణుడిని సంప్రదించండి."
    ),
    "bn": (
        "এই প্রশ্নের জন্য নির্ভরযোগ্য আইনি বা সংবিধিবদ্ধ তথ্য পাওয়া যায়নি। "
        "অনুগ্রহ করে একজন যোগ্য পেটেন্ট অ্যাটর্নি বা আইনি পরামর্শদাতার সাহায্য নিন।"
    ),
}


def decide_final_answer(verified_claims: list, confidence: dict, language: str = "en") -> dict:
    """
    Assemble the final response in the specified language.
    If confidence is low, produce an honest localized abstention message instead of a hallucinated answer.
    """
    if confidence["level"] == "low" or not verified_claims:
        abstain_msg = LOW_CONFIDENCE_MESSAGES.get(language, LOW_CONFIDENCE_MESSAGES["en"])
        return {
            "answer": abstain_msg,
            "citations": [],
            "confidence": confidence,
            "abstain": True,
        }

    return {
        "answer": "\n\n".join(c["text"] for c in verified_claims),
        "citations": [c.get("source_id", "unknown") for c in verified_claims],
        "confidence": confidence,
        "abstain": False,
    }
