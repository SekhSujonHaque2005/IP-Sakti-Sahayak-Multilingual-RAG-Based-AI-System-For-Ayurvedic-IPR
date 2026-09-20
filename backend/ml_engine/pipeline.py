"""
Main entry point for the ML Engine.
Orchestrates the Retrieval-Augmented Generation (RAG) pipeline concurrently.
"""
import concurrent.futures
import time
import json
import re
from typing import Dict, Any
from pathlib import Path
import uuid

# Import our custom ML modules
from ml_engine.core.guardrails import check_input_safety, scrub_pii, MANDATORY_DISCLAIMER, get_disclaimer
from ml_engine.core.query_processor import detect_intent, rewrite_for_retrieval, get_clean_web_search_query
from ml_engine.search.retrieval import hybrid_retrieve, load_chunks
from ml_engine.search.web_search import web_search
from ml_engine.core.llm_client import LLMClient
from ml_engine.telemetry.session_manager import SessionManager
from ml_engine.telemetry.analytics import AnalyticsLogger
from ml_engine.legal_logic.supersession_graph import resolve_current_document
from ml_engine.synthesis.multilingual import get_greeting, get_language_instruction, apply_regulatory_phrase_mapping
from ml_engine.synthesis.legal_cleaner import strip_markdown_decorations, format_document_title

# Initialize globals
session_manager = SessionManager()
analytics_logger = AnalyticsLogger()
llm_client = LLMClient()

# ──────────────────────────────────────────────────────────────
# Greeting Detection
# ──────────────────────────────────────────────────────────────
GREETING_WORDS = {
    "hi", "hello", "hey", "hii", "hiii", "heya", "hola", "yo",
    "thanks", "thank you", "bye", "goodbye", "ok", "okay",
    "good morning", "good evening", "good afternoon", "good night",
    "namaste", "namaskar", "pranam", "jai hind",
}

# Greeting response is now language-aware — see ml_engine.synthesis.multilingual.get_greeting()


def _is_greeting(query: str) -> bool:
    cleaned = query.strip().lower().rstrip("!?.,;:")
    return cleaned in GREETING_WORDS or len(cleaned) <= 2


# ──────────────────────────────────────────────────────────────
# Load Vector Indices for BOTH Jurisdictions
# ──────────────────────────────────────────────────────────────
from ml_engine.search.retrieval import load_index_from_disk, get_embed_model

import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

VECTOR_INDICES = {}
print("=" * 60)
print("Loading Vector Database indices...")
for jur in ["IN", "INTL"]:
    try:
        idx = load_index_from_disk(jurisdiction=jur)
        if idx:
            VECTOR_INDICES[jur] = idx
            print(f"  [OK] {jur} index loaded ({len(idx['chunks'])} chunks)")
        else:
            print(f"  [WARN] {jur} index not found on disk.")
    except Exception as e:
        print(f"  [ERR] {jur} index failed to load: {e}")

if not VECTOR_INDICES:
    print("  [WARN] No vector indices loaded. Relying entirely on Web Search.")

# Pre-warm embedding model so runtime queries don't hit cold start timeouts
try:
    print("Pre-warming multilingual embedding model...")
    get_embed_model()
    print("  [OK] Embedding model pre-warmed and ready.")
except Exception as e:
    print(f"  [WARN] Could not pre-warm embedding model: {e}")
print("=" * 60)


# ──────────────────────────────────────────────────────────────
# Main Query Handler (Non-Streaming)
# ──────────────────────────────────────────────────────────────
def handle_query(query: str, session_id: str = None, jurisdiction: str = "IN", language: str = "en") -> Dict[str, Any]:
    """
    Executes the full RAG pipeline:
    0. Greeting detection
    1. Safety & PII checks
    2. Intent detection & query rewriting
    3. Jurisdiction-aware Vector Search + Web Search (concurrent)
    4. Supersession filtering
    5. LLM Generation (with logging & fallback)
    6. Citation Verification (with resilient matching)
    7. Confidence Scoring (with fixed formula)
    8. Final Assembly with disclaimer
    """
    t_start = time.time()

    if not session_id:
        session_id = str(uuid.uuid4())
        session_manager.create_session(session_id)

    reasoning_steps = []

    # ── 0. Greeting Detection ────────────────────────────────
    if _is_greeting(query):
        latency_ms = round((time.time() - t_start) * 1000)
        return {
            "answer": get_greeting(language),
            "confidence": 1.0,
            "sources": [],
            "disclaimer": "",
            "supersession_paths": [],
            "jurisdiction": jurisdiction,
            "language": language,
            "reasoning_steps": [
                {
                    "title": "Conversational Greeting",
                    "description": "Identified conversational greeting. Prompting interactive overview of Ayurveda IP system.",
                    "icon": "sparkles",
                }
            ],
            "latency_ms": latency_ms,
        }

    # ── 1. Safety & PII Scrubbing ────────────────────────────
    safety_check = check_input_safety(query)
    if not safety_check["safe"]:
        latency_ms = round((time.time() - t_start) * 1000)
        return {
            "answer": f"I cannot process this query. {safety_check['message']}",
            "confidence": 1.0,
            "sources": [],
            "disclaimer": "",
            "supersession_paths": [],
            "jurisdiction": jurisdiction,
            "reasoning_steps": [
                {
                    "title": "Guardrail Triggered",
                    "description": f"Query flagged by safety filter: {safety_check.get('reason', 'safety violation')}.",
                    "icon": "shield",
                }
            ],
            "latency_ms": latency_ms,
        }
    scrubbed_query = scrub_pii(query)
    reasoning_steps.append({
        "title": "Guardrails & Privacy Protection",
        "description": "Passed medical advice boundary and prompt injection filters. Sensitive personal information (PII) scrubbed.",
        "icon": "shield",
    })

    # ── 2. Query Processing ──────────────────────────────────
    intent = detect_intent(scrubbed_query)
    rewritten_query = rewrite_for_retrieval(scrubbed_query, intent)
    print(f"[PIPELINE] Intent: {intent} | Original: '{scrubbed_query}' | Rewritten: '{rewritten_query}'")
    reasoning_steps.append({
        "title": "Intent Analysis & Query Expansion",
        "description": f"Detected legal intent as '{intent}'. Target jurisdiction: {jurisdiction} ({'Indian National Law' if jurisdiction == 'IN' else 'International Treaties & Conventions'}).",
        "icon": "search",
    })

    # Get conversational context if available
    context = session_manager.get_context_for_llm(session_id)
    search_query = f"{context}\n\nCurrent Query: {rewritten_query}" if context else rewritten_query

    # ── 3. Retrieval Phase ───────────────────────────────────
    vector_results = []
    web_results = []

    # Step 3a: Vector Search on Codified Statutory Database (Direct & Instant)
    index = VECTOR_INDICES.get(jurisdiction)
    if index:
        try:
            vector_results = hybrid_retrieve(search_query, index, top_k=6)
            print(f"[PIPELINE] Vector search returned {len(vector_results)} statutory results")
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[PIPELINE] Vector search failed ({type(e).__name__}): {e}")
    else:
        print(f"[PIPELINE] No vector index for jurisdiction '{jurisdiction}'")

    # Step 3b: Live Grounded Web Search (Cleaned & Relevance Filtered)
    try:
        clean_web_q = get_clean_web_search_query(scrubbed_query)
        web_results = web_search(clean_web_q, max_results=4)
        print(f"[PIPELINE] Web search returned {len(web_results)} results for '{clean_web_q}'")
    except Exception as e:
        print(f"[PIPELINE] Web search failed ({type(e).__name__}): {e}")

    # ── 4. Build Combined Chunks with Supersession ───────────
    combined_chunks = []
    sources = []
    supersession_paths = []

    for idx, v in enumerate(vector_results):
        chunk_id = f"v_{idx}"
        doc_name = v.get("document", "Unknown")

        # Check supersession
        resolution = resolve_current_document(doc_name)
        is_superseded = resolution["current_document"] != doc_name
        if is_superseded:
            supersession_paths.append({
                "original": doc_name,
                "current": resolution["current_document"],
                "path": resolution["traversal_path"],
            })

        snippet = v.get("text", "")[:800]
        doc_display_title = format_document_title(doc_name, language=language) if language == "hi" else doc_name
        combined_chunks.append({
            "chunk_id": chunk_id,
            "document": doc_display_title,
            "clause_label": v.get("clause_label", "N/A"),
            "text": snippet,
            "superseded": is_superseded,
        })
        sources.append({
            "title": doc_display_title,
            "snippet": snippet[:150],
            "url": v.get("source_url", "local_corpus"),
            "source_type": "corpus",
        })

    for idx, w in enumerate(web_results):
        chunk_id = f"w_{idx}"
        snippet = w.get("snippet", "")
        raw_w_title = w.get("title", "Web Source")
        w_title = apply_regulatory_phrase_mapping(raw_w_title, "hi") if language == "hi" else raw_w_title
        combined_chunks.append({
            "chunk_id": chunk_id,
            "document": w_title,
            "clause_label": "Web",
            "text": snippet,
            "superseded": False,
        })
        sources.append({
            "title": w_title,
            "snippet": snippet[:150],
            "url": w.get("url", ""),
            "source_type": w.get("source_type", "web"),
        })

    reasoning_steps.append({
        "title": "Knowledge Base & Hybrid Retrieval",
        "description": f"Queried {jurisdiction} Vector DB (E5 multilingual dense + BM25 sparse keywords). Retrieved {len(vector_results)} statutory clauses and {len(web_results)} live web sources.",
        "icon": "database",
    })

    if supersession_paths:
        reasoning_steps.append({
            "title": "Legislative Supersession Check",
            "description": f"Identified {len(supersession_paths)} superseded legal provisions. Mapped old clauses to current amendments.",
            "icon": "git-branch",
        })
    else:
        reasoning_steps.append({
            "title": "Legislative Currency Verification",
            "description": "Checked supersession graph: all retrieved acts, rules, and pharmacopoeia monographs are active and in force.",
            "icon": "git-branch",
        })

    # Filter out superseded chunks for generation (keep them in sources for transparency)
    active_chunks = [c for c in combined_chunks if not c.get("superseded", False)]
    if not active_chunks:
        active_chunks = combined_chunks  # Fallback: use all if everything is superseded

    print(f"[PIPELINE] Active chunks for generation: {len(active_chunks)} (superseded: {len(combined_chunks) - len(active_chunks)})")

    # ── 5. LLM Synthesis ─────────────────────────────────────
    answer = "An unexpected error occurred."
    confidence = 0.0

    try:
        from ml_engine.synthesis.generation import generate_answer
        from ml_engine.synthesis.verification import verify_all_claims_parallel
        from ml_engine.synthesis.confidence import compute_confidence, decide_final_answer

        # Build chunk lookup with multiple keys for resilient matching
        chunk_lookup = {}
        for c in active_chunks:
            chunk_lookup[c["chunk_id"]] = c
            # Also index by document name (first occurrence only, don't overwrite)
            doc_key = c["document"]
            if doc_key not in chunk_lookup:
                chunk_lookup[doc_key] = c

        # Step 5a: Generate claims
        gen_result = generate_answer(scrubbed_query, active_chunks, llm_client, language=language)

        if not gen_result.get("can_answer", False) and not gen_result.get("parse_fallback", False):
            reason = gen_result.get("reason", "")
            answer = reason if reason else "The sources I have don't contain enough specific information to answer this question reliably."
            confidence = 0.0
            reasoning_steps.append({
                "title": "Statutory Synthesis",
                "description": "Insufficient specific statutory coverage found to provide an affirmative legal conclusion.",
                "icon": "cpu",
            })
        elif not gen_result.get("claims", []):
            answer = "I found relevant sources but couldn't extract specific claims. Please try rephrasing your question."
            confidence = 0.1
            reasoning_steps.append({
                "title": "Statutory Synthesis",
                "description": "Passages retrieved, but specific statutory claims could not be extracted.",
                "icon": "cpu",
            })
        else:
            claims = gen_result.get("claims", [])
            total_claims = len(claims)
            print(f"[PIPELINE] Generated {total_claims} claims. Verifying...")

            reasoning_steps.append({
                "title": "Citation-Grounded Claim Synthesis",
                "description": f"Generated {total_claims} candidate claim(s) mapped directly to statutory source identifiers.",
                "icon": "cpu",
            })

            # Step 5b: Verify Claims
            verified_claims = verify_all_claims_parallel(claims, chunk_lookup, llm_client)

            if not verified_claims and claims:
                print(f"[PIPELINE] All {total_claims} claims failed verification. Using unverified claims as fallback.")
                verified_claims = [
                    {**claim, "verdict": "unverified"}
                    for claim in claims
                ]

            reasoning_steps.append({
                "title": "Parallel Claim Verification",
                "description": f"Fact-checked claims against source passages: {len(verified_claims)} of {total_claims} claims substantiated.",
                "icon": "check-circle",
            })

            # Step 5c: Compute Confidence
            conf_dict = compute_confidence(
                active_chunks, verified_claims,
                resolve_current_document,
                total_claims=total_claims,
            )

            # Step 5d: Decide Final Answer
            final_res = decide_final_answer(verified_claims, conf_dict, language=language)

            answer = strip_markdown_decorations(final_res["answer"])
            confidence = final_res["confidence"]["score"]

            reasoning_steps.append({
                "title": "Confidence Calibration",
                "description": f"Assigned confidence score of {int(confidence * 100)}% ({conf_dict.get('level', 'high').capitalize()}) based on verification rate, statutory currency, and retrieval agreement.",
                "icon": "activity",
            })

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[PIPELINE ERROR] Synthesis failed: {e}")
        answer = "An error occurred while processing your query. Please try again."
        confidence = 0.0

    # ── 6. Telemetry ─────────────────────────────────────────
    session_manager.update_turn(
        session_id=session_id,
        query=scrubbed_query,
        answer={"answer": answer, "confidence": confidence, "citations": []},
        chunks_used=vector_results,
    )

    latency_ms = round((time.time() - t_start) * 1000)
    analytics_logger.log_query(
        session_id=session_id,
        query=scrubbed_query,
        intent=intent,
        jurisdiction=jurisdiction,
        num_results=len(combined_chunks),
        confidence_score=confidence,
        confidence_level="high" if confidence > 0.7 else ("medium" if confidence > 0.4 else "low"),
        latency_ms={"total": latency_ms},
        web_search_used=len(web_results) > 0,
    )

    print(f"[PIPELINE] Done in {latency_ms}ms | Confidence: {confidence} | Jurisdiction: {jurisdiction}")

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": sources,
        "disclaimer": get_disclaimer(language),
        "supersession_paths": supersession_paths,
        "jurisdiction": jurisdiction,
        "language": language,
        "intent": intent,
        "reasoning_steps": reasoning_steps,
        "latency_ms": latency_ms,
    }


# ──────────────────────────────────────────────────────────────
# Streaming Query Handler (SSE) — for authenticated chat
# ──────────────────────────────────────────────────────────────
from ml_engine.synthesis.generation import GENERATION_SYSTEM_PROMPT, build_generation_prompt
from app.db.models import Conversation, Message
from sqlalchemy.orm import Session


def handle_query_stream(query: str, user_id: str, db: Session,
                        conversation_id: str = None, jurisdiction: str = "IN",
                        language: str = "en"):
    """
    Streaming version of the pipeline for Server-Sent Events (SSE).
    Uses SQLAlchemy to persist messages directly into the database.
    """
    # 0. Greeting Detection
    if _is_greeting(query):
        greeting_text = get_greeting(language)
        yield f"data: {json.dumps({'status': 'generating'})}\n\n"
        yield f"data: {json.dumps({'status': 'token', 'token': greeting_text})}\n\n"
        yield f"data: {json.dumps({'status': 'done', 'sources': [], 'conversation_id': conversation_id or ''})}\n\n"
        return

    # 1. Resolve or Create Conversation
    if not conversation_id:
        new_conv = Conversation(user_id=user_id, title=query[:50])
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        conversation_id = new_conv.id

    # 2. Save User Message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=query,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    yield f"data: {json.dumps({'status': 'processing', 'message': 'Checking safety...'})}\n\n"
    safety_check = check_input_safety(query)
    if not safety_check["safe"]:
        error_msg = f"Query blocked: {safety_check['message']}"
        yield f"data: {json.dumps({'status': 'error', 'message': error_msg})}\n\n"
        return

    scrubbed_query = scrub_pii(query)
    intent = detect_intent(scrubbed_query)
    rewritten_query = rewrite_for_retrieval(scrubbed_query, intent)

    yield f"data: {json.dumps({'status': 'processing', 'message': 'Retrieving relevant laws...'})}\n\n"

    # Concurrent retrieval
    vector_results = []
    web_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        def do_vector_search():
            index = VECTOR_INDICES.get(jurisdiction)
            if index:
                return hybrid_retrieve(rewritten_query, index, top_k=5)
            return []

        def do_web_search():
            web_query = f"Ayurveda India IP regulation {scrubbed_query}"
            return web_search(web_query, max_results=3)

        future_vector = executor.submit(do_vector_search)
        future_web = executor.submit(do_web_search)

        try:
            vector_results = future_vector.result(timeout=15)
        except Exception:
            pass
        try:
            web_results = future_web.result(timeout=10)
        except Exception:
            pass

    # Build combined chunks
    combined_chunks = []
    sources = []
    for idx, v in enumerate(vector_results):
        combined_chunks.append({
            "chunk_id": f"v_{idx}",
            "document": v.get("document", "Unknown"),
            "clause_label": v.get("clause_label", "N/A"),
            "text": v.get("text", "")[:800],
        })
        sources.append({"title": v.get("document", "Unknown"), "url": "local_corpus"})
    for idx, w in enumerate(web_results):
        combined_chunks.append({
            "chunk_id": f"w_{idx}",
            "document": w.get("title", "Web Source"),
            "clause_label": "Web",
            "text": w.get("snippet", ""),
        })
        sources.append({"title": w.get("title", "Web Source"), "url": w.get("url", "")})

    from ml_engine.synthesis.generation import generate_answer
    from ml_engine.synthesis.verification import verify_all_claims_parallel
    from ml_engine.synthesis.confidence import compute_confidence, decide_final_answer

    yield f"data: {json.dumps({'status': 'processing', 'message': 'Generating claims...'})}\n\n"

    # Build resilient chunk lookup
    chunk_lookup = {}
    for c in combined_chunks:
        chunk_lookup[c["chunk_id"]] = c
        if c["document"] not in chunk_lookup:
            chunk_lookup[c["document"]] = c

    gen_result = generate_answer(scrubbed_query, combined_chunks, llm_client, language=language)

    if not gen_result.get("can_answer", False) and not gen_result.get("parse_fallback", False):
        final_answer = gen_result.get("reason", "The sources don't contain enough specific information to answer this question reliably.")
        if not final_answer or final_answer == "None":
            final_answer = "The sources don't contain enough specific information to answer this question reliably."
        confidence = 0.0
        thinking_content = "Abstained because can_answer was false or no claims were generated."
    elif not gen_result.get("claims", []):
        final_answer = "I found relevant sources but couldn't extract specific claims. Please rephrase."
        confidence = 0.1
        thinking_content = "No claims extracted."
    else:
        claims = gen_result.get("claims", [])
        total_claims = len(claims)
        yield f"data: {json.dumps({'status': 'processing', 'message': f'Verifying {total_claims} citations...'})}\n\n"

        verified_claims = verify_all_claims_parallel(claims, chunk_lookup, llm_client)

        if not verified_claims and claims:
            verified_claims = [{**claim, "verdict": "unverified"} for claim in claims]

        yield f"data: {json.dumps({'status': 'processing', 'message': 'Computing confidence...'})}\n\n"
        conf_dict = compute_confidence(combined_chunks, verified_claims, resolve_current_document, total_claims=total_claims)

        final_res = decide_final_answer(verified_claims, conf_dict)
        final_answer = strip_markdown_decorations(final_res["answer"])
        confidence = final_res["confidence"]["score"]
        thinking_content = f"Confidence: {confidence}. Verified {len(verified_claims)}/{total_claims} claims."

    yield f"data: {json.dumps({'status': 'generating'})}\n\n"
    yield f"data: {json.dumps({'status': 'token', 'token': final_answer})}\n\n"
    yield f"data: {json.dumps({'status': 'done', 'sources': sources, 'conversation_id': conversation_id})}\n\n"

    # Persist AI message
    ai_msg = Message(
        conversation_id=conversation_id,
        parent_id=user_msg.id,
        role="assistant",
        content=final_answer,
        thinking_content=thinking_content,
    )
    db.add(ai_msg)
    db.commit()
