def apply_reputation_reranking(fused_ranks: list, chunks: list, chunk_reputations: dict, boost_weight: float = 0.1) -> list:
    if not chunk_reputations:
        return fused_ranks
    scored = []
    for rank_position, chunk_idx in enumerate(fused_ranks):
        chunk = chunks[chunk_idx] if chunk_idx < len(chunks) else None
        if chunk is None:
            continue
        chunk_id = chunk.get("chunk_id", "")
        base_score = 1.0 / (60 + rank_position + 1)
        rep = chunk_reputations.get(chunk_id, {})
        reputation_score = rep.get("score", 0.5)
        boosted_score = base_score + (boost_weight * reputation_score)
        scored.append((chunk_idx, boosted_score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [idx for idx, _ in scored]

def build_document_boost_map(chunk_reputations: dict) -> dict:
    doc_scores = {}
    for chunk_id, rep in chunk_reputations.items():
        doc_name = chunk_id.split("::")[0] if "::" in chunk_id else chunk_id
        if doc_name not in doc_scores:
            doc_scores[doc_name] = {"total_score": 0, "count": 0}
        doc_scores[doc_name]["total_score"] += rep.get("score", 0.5)
        doc_scores[doc_name]["count"] += 1
    doc_boost = {}
    for doc, data in doc_scores.items():
        avg = data["total_score"] / max(data["count"], 1)
        doc_boost[doc] = avg
    return doc_boost
