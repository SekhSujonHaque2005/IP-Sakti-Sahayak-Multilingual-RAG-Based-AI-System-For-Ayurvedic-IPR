import json
import time
from ml_engine.core.guardrails import check_input_safety, attach_disclaimer, scrub_pii
from ml_engine.core.query_processor import detect_intent, rewrite_for_retrieval, expand_query, extract_legal_entities
from ml_engine.telemetry.session_manager import SessionManager
from ml_engine.legal_logic.jurisdiction import get_index_for_jurisdiction
from ml_engine.legal_logic.supersession_graph import resolve_current_document
from ml_engine.search.retrieval import hybrid_retrieve
from ml_engine.search.adaptive_retrieval import apply_reputation_reranking
from ml_engine.synthesis.generation import build_generation_prompt, GENERATION_SYSTEM_PROMPT
from ml_engine.synthesis.verification import verify_all_claims_parallel as verify_all_claims
from ml_engine.synthesis.confidence import compute_confidence, decide_final_answer
from ml_engine.telemetry.feedback_loop import FeedbackStore
from ml_engine.telemetry.analytics import AnalyticsLogger
from ml_engine.search.web_search import web_search, format_web_results_for_llm, should_trigger_web_search
from ml_engine.synthesis.multilingual import GENERATION_LANGUAGE_INSTRUCTION

session_mgr = SessionManager()
feedback_store = FeedbackStore()
analytics = AnalyticsLogger()

CHAIN_STEPS = [
    "guardrails_check",
    "intent_detection",
    "query_rewriting",
    "jurisdiction_selection",
    "retrieval",
    "supersession_check",
    "web_search_fallback",
    "generation",
    "verification",
    "confidence_scoring",
    "final_assembly",
]

def run_chain(query: str, session_id: str, jurisdiction: str,
              all_indices: dict, llm_client, top_k: int = 5) -> dict:
    trace = {"steps": [], "latency_ms": {}}
    t_start = time.time()

    # Step 1: Guardrails
    t0 = time.time()
    safety = check_input_safety(query)
    trace["latency_ms"]["guardrails"] = round((time.time() - t0) * 1000)
    if not safety["safe"]:
        trace["steps"].append({"step": "guardrails_check", "result": "blocked", "reason": safety["reason"]})
        return {
            "answer": safety["message"],
            "citations": [],
            "confidence": {"score": 0, "level": "blocked"},
            "trace": trace,
            "disclaimer": "",
        }
    trace["steps"].append({"step": "guardrails_check", "result": "passed"})
    query = scrub_pii(query)

    # Step 2: Intent Detection
    t0 = time.time()
    intent = detect_intent(query)
    entities = extract_legal_entities(query)
    trace["latency_ms"]["intent_detection"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "intent_detection", "intent": intent, "entities": entities})

    # Step 3: Query Rewriting
    t0 = time.time()
    search_query = rewrite_for_retrieval(query, intent)
    trace["latency_ms"]["query_rewriting"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "query_rewriting", "original": query, "rewritten": search_query})

    # Step 4: Jurisdiction Selection
    if entities["jurisdictions"]:
        jurisdiction = entities["jurisdictions"][0]
    try:
        index_bundle = get_index_for_jurisdiction(jurisdiction, all_indices)
    except ValueError:
        index_bundle = all_indices.get("IN", list(all_indices.values())[0])
    trace["steps"].append({"step": "jurisdiction_selection", "selected": jurisdiction})

    # Step 5: Hybrid Retrieval
    t0 = time.time()
    retrieved_chunks = hybrid_retrieve(search_query, index_bundle, top_k=top_k)
    trace["latency_ms"]["retrieval"] = round((time.time() - t0) * 1000)
    chunk_reputations = feedback_store.compute_chunk_reputations()
    if chunk_reputations:
        fused_indices = list(range(len(retrieved_chunks)))
        reranked = apply_reputation_reranking(fused_indices, retrieved_chunks, chunk_reputations)
        retrieved_chunks = [retrieved_chunks[i] for i in reranked if i < len(retrieved_chunks)]
    trace["steps"].append({"step": "retrieval", "num_results": len(retrieved_chunks)})

    # Step 6: Supersession Check
    t0 = time.time()
    for chunk in retrieved_chunks:
        resolution = resolve_current_document(chunk["document"])
        chunk["_supersession"] = resolution
        if resolution["current_document"] != chunk["document"]:
            chunk["_superseded"] = True
        else:
            chunk["_superseded"] = False
    trace["latency_ms"]["supersession"] = round((time.time() - t0) * 1000)
    active_chunks = [c for c in retrieved_chunks if not c.get("_superseded", False)]
    if not active_chunks:
        active_chunks = retrieved_chunks
    trace["steps"].append({"step": "supersession_check", "active_chunks": len(active_chunks), "superseded_dropped": len(retrieved_chunks) - len(active_chunks)})

    # Step 7: Web Search Fallback
    t0 = time.time()
    web_results = []
    web_context = ""
    if should_trigger_web_search(0.5, len(active_chunks)):
        web_results = web_search(query, max_results=3)
        web_context = format_web_results_for_llm(web_results)
    trace["latency_ms"]["web_search"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "web_search_fallback", "triggered": bool(web_results), "num_web_results": len(web_results)})

    # Step 8: Generation
    t0 = time.time()
    session_context = session_mgr.get_context_for_llm(session_id)
    generation_prompt = build_generation_prompt(query, active_chunks)
    if session_context:
        generation_prompt = f"{session_context}\n\n{generation_prompt}"
    if web_context:
        generation_prompt = f"{generation_prompt}\n\n{web_context}"
    system_prompt = GENERATION_SYSTEM_PROMPT + "\n" + GENERATION_LANGUAGE_INSTRUCTION
    try:
        raw_response = llm_client.complete(system=system_prompt, user=generation_prompt)
        generated = json.loads(raw_response)
    except (json.JSONDecodeError, Exception) as e:
        generated = {"can_answer": True, "claims": [{"text": raw_response if isinstance(raw_response, str) else str(e), "source_id": "llm_direct"}], "reason_if_cannot_answer": ""}
    trace["latency_ms"]["generation"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "generation", "can_answer": generated.get("can_answer", False), "num_claims": len(generated.get("claims", []))})

    # Step 9: Verification
    t0 = time.time()
    claims = generated.get("claims", [])
    chunk_lookup = {c["chunk_id"]: c for c in active_chunks}
    if claims and generated.get("can_answer", False):
        verified_claims = verify_all_claims(claims, chunk_lookup, llm_client)
    else:
        verified_claims = []
    trace["latency_ms"]["verification"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "verification", "input_claims": len(claims), "verified_claims": len(verified_claims)})

    # Step 10: Confidence Scoring
    t0 = time.time()
    confidence = compute_confidence(active_chunks, verified_claims, resolve_current_document)
    final = decide_final_answer(verified_claims, confidence)
    trace["latency_ms"]["confidence"] = round((time.time() - t0) * 1000)
    trace["steps"].append({"step": "confidence_scoring", "score": confidence["score"], "level": confidence["level"]})

    # Step 11: Final Assembly
    final = attach_disclaimer(final)
    final["trace"] = trace
    final["intent"] = intent
    final["jurisdiction"] = jurisdiction
    final["web_sources"] = [{"title": r["title"], "url": r["url"], "source_type": r["source_type"]} for r in web_results]
    trace["latency_ms"]["total"] = round((time.time() - t_start) * 1000)

    # Log to session and analytics
    session_mgr.update_turn(session_id, query, final, active_chunks)
    analytics.log_query(
        session_id=session_id, query=query, intent=intent,
        jurisdiction=jurisdiction, num_results=len(active_chunks),
        confidence_score=confidence["score"], confidence_level=confidence["level"],
        latency_ms=trace["latency_ms"], web_search_used=bool(web_results),
    )

    return final
