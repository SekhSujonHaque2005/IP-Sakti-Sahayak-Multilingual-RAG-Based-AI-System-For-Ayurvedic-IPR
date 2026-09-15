import asyncio
from ml_engine.core.llm_client import LLMClient
from ml_engine.synthesis.verification import verify_all_claims_parallel

def main():
    llm = LLMClient()
    claims = [
        {"text": "The sky is blue.", "source_id": "v_0"},
        {"text": "Water is wet.", "source_id": "v_1"}
    ]
    chunks = [
        {"chunk_id": "v_0", "document": "Doc1", "clause_label": "C1", "text": "The sky is indeed very blue today."},
        {"chunk_id": "v_1", "document": "Doc2", "clause_label": "C2", "text": "Water has a property of being wet."}
    ]
    chunk_lookup = {c["chunk_id"]: c for c in chunks}
    result = verify_all_claims_parallel(claims, chunk_lookup, llm)
    print("Verification result:", result)

if __name__ == "__main__":
    main()
