import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

class AnalyticsLogger:
    def __init__(self, log_path: str = None):
        self.log_path = Path(log_path) if log_path else DATA_DIR / "analytics.jsonl"
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def log_query(self, session_id: str, query: str, intent: str,
                  jurisdiction: str, num_results: int, confidence_score: float,
                  confidence_level: str, latency_ms: dict, web_search_used: bool = False):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "query": query,
            "intent": intent,
            "jurisdiction": jurisdiction,
            "num_results": num_results,
            "confidence_score": confidence_score,
            "confidence_level": confidence_level,
            "latency_ms": latency_ms,
            "web_search_used": web_search_used,
        }
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def get_dashboard_stats(self) -> dict:
        if not self.log_path.exists():
            return {"total_queries": 0, "avg_confidence": 0, "top_intents": {}}
        entries = []
        with open(self.log_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
        if not entries:
            return {"total_queries": 0, "avg_confidence": 0, "top_intents": {}}
        total = len(entries)
        avg_conf = sum(e.get("confidence_score", 0) for e in entries) / max(total, 1)
        intent_counts = {}
        jurisdiction_counts = {"IN": 0, "INTL": 0}
        confidence_dist = {"high": 0, "medium": 0, "low": 0}
        for e in entries:
            intent = e.get("intent", "unknown")
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
            jur = e.get("jurisdiction", "IN")
            if jur in jurisdiction_counts:
                jurisdiction_counts[jur] += 1
            level = e.get("confidence_level", "low")
            if level in confidence_dist:
                confidence_dist[level] += 1
        return {
            "total_queries": total,
            "avg_confidence": round(avg_conf, 3),
            "top_intents": dict(sorted(intent_counts.items(), key=lambda x: x[1], reverse=True)),
            "jurisdiction_split": jurisdiction_counts,
            "confidence_distribution": confidence_dist,
        }

    def get_popular_topics(self, n: int = 10) -> list:
        if not self.log_path.exists():
            return []
        queries = []
        with open(self.log_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    queries.append(entry.get("query", ""))
        word_freq = {}
        stopwords = {"the", "a", "an", "is", "in", "of", "to", "for", "and", "or", "can", "i", "my", "what", "how", "do"}
        for q in queries:
            for word in q.lower().split():
                if word not in stopwords and len(word) > 2:
                    word_freq[word] = word_freq.get(word, 0) + 1
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return sorted_words[:n]
