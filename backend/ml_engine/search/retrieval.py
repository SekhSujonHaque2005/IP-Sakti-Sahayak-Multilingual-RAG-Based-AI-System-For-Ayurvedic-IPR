import json
import pickle
import numpy as np
import faiss
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from pathlib import Path

EMBED_MODEL = None
INDEX_DIR = Path(__file__).resolve().parent.parent / "data" / "indices"

def get_embed_model():
    global EMBED_MODEL
    if EMBED_MODEL is None:
        print("Loading Embedding Model...")
        EMBED_MODEL = SentenceTransformer("intfloat/multilingual-e5-base")
    return EMBED_MODEL

def load_chunks(path: str):
    print(f"Loading chunks from {path}...")
    chunks = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                chunks.append(json.loads(line))
    return chunks

def save_index_to_disk(index_bundle: dict, jurisdiction: str):
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    faiss_path = INDEX_DIR / f"faiss_{jurisdiction}.index"
    bm25_path = INDEX_DIR / f"bm25_{jurisdiction}.pkl"
    chunks_path = INDEX_DIR / f"chunks_{jurisdiction}.json"
    faiss.write_index(index_bundle["dense_index"], str(faiss_path))
    with open(bm25_path, "wb") as f:
        pickle.dump(index_bundle["sparse_index"], f)
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(index_bundle["chunks"], f, ensure_ascii=False)
    print(f"Index saved to disk for jurisdiction: {jurisdiction}")

def load_index_from_disk(jurisdiction: str) -> dict:
    faiss_path = INDEX_DIR / f"faiss_{jurisdiction}.index"
    bm25_path = INDEX_DIR / f"bm25_{jurisdiction}.pkl"
    chunks_path = INDEX_DIR / f"chunks_{jurisdiction}.json"
    if not all(p.exists() for p in [faiss_path, bm25_path, chunks_path]):
        return None
    print(f"Loading cached index from disk for jurisdiction: {jurisdiction}")
    dense_index = faiss.read_index(str(faiss_path))
    with open(bm25_path, "rb") as f:
        sparse_index = pickle.load(f)
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)
    return {
        "chunks": chunks,
        "dense_index": dense_index,
        "sparse_index": sparse_index,
    }

def build_indices(chunks, jurisdiction: str, force_rebuild: bool = False):
    """Build indices with disk caching. Loads from disk if available."""
    if not force_rebuild:
        cached = load_index_from_disk(jurisdiction)
        if cached is not None:
            print(f"Using cached index for {jurisdiction} ({len(cached['chunks'])} chunks)")
            return cached
    print(f"Building indices for jurisdiction: {jurisdiction}")
    filtered = [c for c in chunks if c.get("jurisdiction") == jurisdiction]
    texts = [c["text"] for c in filtered]
    model = get_embed_model()
    print(f"Encoding {len(texts)} dense vectors...")
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)
    dim = embeddings.shape[1]
    dense_index = faiss.IndexFlatIP(dim)
    dense_index.add(np.array(embeddings).astype("float32"))
    print("Building BM25 sparse index...")
    tokenized = [t.lower().split() for t in texts]
    sparse_index = BM25Okapi(tokenized)
    bundle = {
        "chunks": filtered,
        "dense_index": dense_index,
        "sparse_index": sparse_index,
    }
    save_index_to_disk(bundle, jurisdiction)
    return bundle

def reciprocal_rank_fusion(dense_ranks, sparse_ranks, k=60):
    """
    Combine two ranked lists of chunk indices into one fused ranking.
    RRF score for an item = sum over each list of 1 / (k + rank_in_that_list)
    Items that rank well in either list score higher overall.
    """
    scores = {}
    for rank, idx in enumerate(dense_ranks):
        scores[idx] = scores.get(idx, 0) + 1.0 / (k + rank + 1)
    for rank, idx in enumerate(sparse_ranks):
        scores[idx] = scores.get(idx, 0) + 1.0 / (k + rank + 1)
    fused = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [idx for idx, _ in fused]

def hybrid_retrieve(query: str, index_bundle: dict, top_k: int = 5):
    chunks = index_bundle["chunks"]
    model = get_embed_model()
    query_vec = model.encode([query], normalize_embeddings=True)
    _, dense_result = index_bundle["dense_index"].search(
        np.array(query_vec).astype("float32"), top_k * 3
    )
    dense_ranks = dense_result[0].tolist()
    tokenized_query = query.lower().split()
    bm25_scores = index_bundle["sparse_index"].get_scores(tokenized_query)
    sparse_ranks = list(np.argsort(bm25_scores)[::-1][: top_k * 3])
    fused_ranks = reciprocal_rank_fusion(dense_ranks, sparse_ranks)
    top_chunks = [chunks[i] for i in fused_ranks[:top_k]]
    return top_chunks

if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    CHUNKS_PATH = PROJECT_ROOT / "data" / "chunks.jsonl"
    chunks = load_chunks(str(CHUNKS_PATH))
    india_index = build_indices(chunks, jurisdiction="IN")
    print("\n--- Testing Retrieval ---")
    query = "can I patent a herbal formulation"
    print(f"Query: {query}")
    results = hybrid_retrieve(query, india_index)
    for i, r in enumerate(results):
        print(f"\nResult {i+1}:")
        print(f"Document: {r['document']}")
        print(f"Clause: {r['clause_label']}")
        print(f"Preview: {r['text'][:150]}...")
