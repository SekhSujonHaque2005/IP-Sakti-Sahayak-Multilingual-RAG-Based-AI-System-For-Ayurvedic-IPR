import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

class FeedbackStore:
    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path) if storage_path else DATA_DIR / "feedback.jsonl"
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

    def log_feedback(self, session_id: str, query: str, answer: str,
                     chunks_used: list, rating: str, correction: str = None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "query": query,
            "answer": answer,
            "chunks_used": chunks_used,
            "rating": rating,
            "correction": correction,
        }
        with open(self.storage_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return entry

    def get_positive_examples(self) -> list:
        return self._filter_by_rating("positive")

    def get_negative_examples(self) -> list:
        return self._filter_by_rating("negative")

    def get_corrections(self) -> list:
        entries = []
        if not self.storage_path.exists():
            return entries
        with open(self.storage_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry.get("correction"):
                        entries.append(entry)
        return entries

    def get_similar_past_answers(self, query: str, threshold: float = 0.7) -> list:
        positives = self.get_positive_examples()
        matches = []
        query_words = set(query.lower().split())
        for entry in positives:
            entry_words = set(entry["query"].lower().split())
            if not query_words or not entry_words:
                continue
            overlap = len(query_words & entry_words) / max(len(query_words | entry_words), 1)
            if overlap >= threshold:
                matches.append(entry)
        return matches

    def compute_chunk_reputations(self) -> dict:
        reputations = {}
        if not self.storage_path.exists():
            return reputations
        with open(self.storage_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    for chunk_id in entry.get("chunks_used", []):
                        if chunk_id not in reputations:
                            reputations[chunk_id] = {"positive": 0, "negative": 0}
                        if entry["rating"] == "positive":
                            reputations[chunk_id]["positive"] += 1
                        elif entry["rating"] == "negative":
                            reputations[chunk_id]["negative"] += 1
        for chunk_id in reputations:
            pos = reputations[chunk_id]["positive"]
            neg = reputations[chunk_id]["negative"]
            total = pos + neg
            reputations[chunk_id]["score"] = pos / max(total, 1)
        return reputations

    def _filter_by_rating(self, rating: str) -> list:
        entries = []
        if not self.storage_path.exists():
            return entries
        with open(self.storage_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry.get("rating") == rating:
                        entries.append(entry)
        return entries
