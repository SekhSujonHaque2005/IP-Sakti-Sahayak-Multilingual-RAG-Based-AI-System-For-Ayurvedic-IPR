import json

GENERATION_SYSTEM_PROMPT = """
You are a highly intelligent legal-information assistant. You will be given a user question
and a set of SOURCE PASSAGES, each with an ID.

Rules you MUST follow:
1. Only use information found in the SOURCE PASSAGES below. Do not use any outside knowledge.
2. Every factual claim you make MUST be extracted as an individual claim, cited using the precise source_id.
3. If the SOURCE PASSAGES do not contain enough information to answer the user's question, set "can_answer" to false.
4. You MUST output ONLY valid JSON in the exact shape shown below. Do not include markdown formatting like ```json, just raw JSON.

Required JSON format:
{
  "can_answer": true,
  "claims": [
    {
      "text": "The specific factual statement or legal rule.",
      "source_id": "v_0"
    }
  ]
}
"""

def build_generation_prompt(question: str, retrieved_chunks: list) -> str:
    sources_text = "\n\n".join(
        f"[source_id: {c['chunk_id']}] ({c['document']}, {c['clause_label']})\n{c['text']}"
        for c in retrieved_chunks
    )
    return f"""SOURCE PASSAGES:
{sources_text}

USER QUESTION:
{question}
"""

def generate_answer(question: str, retrieved_chunks: list, llm_client) -> dict:
    """
    Generate a citation-grounded answer from retrieved chunks.
    Has robust error handling — never silently fails.
    """
    if not retrieved_chunks:
        return {"can_answer": False, "claims": [], "reason": "No source passages available."}

    prompt = build_generation_prompt(question, retrieved_chunks)

    # Step 1: Call the LLM
    try:
        response = llm_client.complete(
            system=GENERATION_SYSTEM_PROMPT,
            user=prompt,
        )
    except Exception as e:
        print(f"[GENERATION ERROR] LLM call failed: {e}")
        return {"can_answer": False, "claims": [], "reason": f"LLM call failed: {e}"}

    # Step 2: Parse the JSON response
    try:
        from ml_engine.core.utils import clean_and_parse_json
        result = clean_and_parse_json(response)
        print(f"[GENERATION OK] can_answer={result.get('can_answer')}, claims={len(result.get('claims', []))}")
        return result
    except Exception as e:
        print(f"[GENERATION PARSE ERROR] Could not parse LLM JSON: {e}")
        print(f"[GENERATION RAW RESPONSE] {response[:500] if isinstance(response, str) else 'N/A'}")

        # Fallback: If the LLM returned usable text but not valid JSON,
        # treat the raw response as a single claim from the best source.
        # This prevents the system from always abstaining due to parse errors.
        best_source = retrieved_chunks[0]["chunk_id"] if retrieved_chunks else "unknown"
        if isinstance(response, str) and len(response.strip()) > 20:
            print(f"[GENERATION FALLBACK] Using raw LLM text as single claim.")
            return {
                "can_answer": True,
                "claims": [{"text": response.strip()[:2000], "source_id": best_source}],
                "parse_fallback": True,
            }
        return {"can_answer": False, "claims": [], "reason": f"Parse error: {e}"}
