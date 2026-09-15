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
    # BUG FIX: was `len(verified_claims) / max(1, len(verified_claims))` which is always 1.0
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

    score = (0.5 * verification_rate) + (0.3 * currency_rate) + (0.2 * agreement_score)

    if score >= 0.7:
        level = "high"
    elif score >= 0.4:
        level = "medium"
    else:
        level = "low"
    return {"score": round(score, 2), "level": level}


def decide_final_answer(verified_claims: list, confidence: dict) -> dict:
    """
    Assemble the final response. If confidence is low, produce an
    honest abstention message instead of a bad answer.
    """
    if confidence["level"] == "low" or not verified_claims:
        return {
            "answer": (
                "I don't have a reliable, sourced answer to this question. "
                "This may need a qualified IP/regulatory professional — "
                "consider consulting AIIA's IP facilitation cell or a "
                "registered patent agent."
            ),
            "citations": [],
            "confidence": confidence,
        }

    return {
        "answer": " ".join(c["text"] for c in verified_claims),
        "citations": [c.get("source_id", "unknown") for c in verified_claims],
        "confidence": confidence,
    }
