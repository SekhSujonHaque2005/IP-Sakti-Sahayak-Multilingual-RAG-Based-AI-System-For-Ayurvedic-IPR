import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

VERIFICATION_SYSTEM_PROMPT = """
You are a strict fact-checker. You will be given exactly one CLAIM and
one SOURCE PASSAGE. Decide whether the SOURCE PASSAGE actually supports
the CLAIM as written -- not just related to the same topic, but truly
supports it.

Respond with ONLY valid JSON in this exact shape:
{"verdict": "supported" | "not_supported" | "unsure", "reason": "..."}
"""


def _find_source_chunk(source_id: str, chunk_lookup: dict) -> dict:
    """
    Find a chunk by source_id with resilient matching.
    Tries: exact match → partial match → None.
    """
    if not source_id or not chunk_lookup:
        return None

    # 1. Exact match
    if source_id in chunk_lookup:
        return chunk_lookup[source_id]

    # 2. Case-insensitive exact match
    source_lower = source_id.lower()
    for key, chunk in chunk_lookup.items():
        if key.lower() == source_lower:
            return chunk

    # 3. Partial match (source_id contained in key or vice versa)
    for key, chunk in chunk_lookup.items():
        if source_lower in key.lower() or key.lower() in source_lower:
            return chunk

    return None


def verify_claim(claim_text: str, source_chunk: dict, llm_client) -> dict:
    prompt = f"""CLAIM:
{claim_text}

SOURCE PASSAGE ({source_chunk['document']}, {source_chunk['clause_label']}):
{source_chunk['text']}
"""
    try:
        response = llm_client.complete(
            system=VERIFICATION_SYSTEM_PROMPT,
            user=prompt,
        )
        from ml_engine.core.utils import clean_and_parse_json
        return clean_and_parse_json(response)
    except Exception as e:
        print(f"[VERIFICATION ERROR] {e}")
        return {"verdict": "unsure", "reason": f"Verification failed: {e}"}


def verify_all_claims(claims: list, chunk_lookup: dict, llm_client) -> list:
    """
    Synchronous fallback: verifies claims one by one.
    """
    verified = []
    for claim in claims:
        source_chunk = _find_source_chunk(claim.get("source_id", ""), chunk_lookup)
        if source_chunk is None:
            print(f"[VERIFICATION SKIP] source_id '{claim.get('source_id')}' not found in chunk_lookup")
            continue
        result = verify_claim(claim["text"], source_chunk, llm_client)
        if result["verdict"] == "supported":
            verified.append({**claim, "verdict": result["verdict"], "reason": result.get("reason", "")})
    return verified


def _verify_single(args):
    """Worker function for parallel verification."""
    claim, source_chunk, llm_client = args
    result = verify_claim(claim["text"], source_chunk, llm_client)
    if result["verdict"] == "supported":
        return {**claim, "verdict": result["verdict"], "reason": result.get("reason", "")}
    return None


def verify_all_claims_parallel(claims: list, chunk_lookup: dict, llm_client, max_workers: int = 3) -> list:
    """
    Parallel verification: runs all claim checks concurrently using a thread pool.
    Uses resilient source_id matching to avoid dropping claims silently.
    """
    tasks = []
    for claim in claims:
        source_chunk = _find_source_chunk(claim.get("source_id", ""), chunk_lookup)
        if source_chunk is None:
            print(f"[VERIFICATION SKIP] source_id '{claim.get('source_id')}' not found in lookup. Keys: {list(chunk_lookup.keys())[:5]}")
            continue
        tasks.append((claim, source_chunk, llm_client))

    if not tasks:
        print(f"[VERIFICATION WARNING] No claims matched any source chunks. Skipping verification.")
        return []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_verify_single, tasks))

    verified = [r for r in results if r is not None]
    print(f"[VERIFICATION RESULT] {len(verified)}/{len(tasks)} claims verified as supported.")
    return verified


async def verify_all_claims_async(claims: list, chunk_lookup: dict, llm_client) -> list:
    """
    Async verification: for use inside an async FastAPI endpoint.
    Wraps the parallel version in asyncio.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, verify_all_claims_parallel, claims, chunk_lookup, llm_client
    )
