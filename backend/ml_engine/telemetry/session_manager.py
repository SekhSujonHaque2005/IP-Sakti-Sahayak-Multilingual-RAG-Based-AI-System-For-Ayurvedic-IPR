import json
import os
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

class SessionManager:
    def __init__(self, storage_dir: str = None):
        self.storage_dir = Path(storage_dir) if storage_dir else DATA_DIR / "sessions"
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _session_path(self, session_id: str) -> Path:
        return self.storage_dir / f"{session_id}.json"

    def create_session(self, session_id: str, user_id: str = "anonymous") -> dict:
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "regulatory_state": {
                "jurisdiction": None,
                "category": None,
                "ingredients": [],
                "source": None,
                "process": None,
                "biological_resource_flag": None,
                "traditional_knowledge_overlap": None,
                "abs_required": None,
            },
            "turns": [],
        }
        self._save(session_id, session)
        return session

    def get_session(self, session_id: str) -> dict:
        path = self._session_path(session_id)
        if not path.exists():
            return self.create_session(session_id)
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def update_turn(self, session_id: str, query: str, answer: dict, chunks_used: list) -> dict:
        session = self.get_session(session_id)
        turn = {
            "turn_index": len(session["turns"]),
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "answer": answer.get("answer", ""),
            "citations": answer.get("citations", []),
            "confidence": answer.get("confidence", {}),
            "chunks_used": [c.get("chunk_id", "") for c in chunks_used],
        }
        session["turns"].append(turn)
        session["updated_at"] = datetime.now().isoformat()
        self._save(session_id, session)
        return session

    def update_regulatory_state(self, session_id: str, updates: dict) -> dict:
        session = self.get_session(session_id)
        for key, value in updates.items():
            if key in session["regulatory_state"]:
                session["regulatory_state"][key] = value
        session["updated_at"] = datetime.now().isoformat()
        self._save(session_id, session)
        return session

    def get_context_for_llm(self, session_id: str, max_turns: int = 5) -> str:
        session = self.get_session(session_id)
        if not session["turns"]:
            return ""
        recent = session["turns"][-max_turns:]
        context_parts = ["PREVIOUS CONVERSATION CONTEXT:"]
        reg_state = session["regulatory_state"]
        if reg_state.get("jurisdiction"):
            context_parts.append(f"Jurisdiction: {reg_state['jurisdiction']}")
        if reg_state.get("category"):
            context_parts.append(f"Product Category: {reg_state['category']}")
        for turn in recent:
            context_parts.append(f"\nUser: {turn['query']}")
            context_parts.append(f"Assistant: {turn['answer'][:300]}...")
        return "\n".join(context_parts)

    def list_sessions(self, user_id: str = None) -> list:
        sessions = []
        for path in self.storage_dir.glob("*.json"):
            with open(path, "r", encoding="utf-8") as f:
                session = json.load(f)
                if user_id is None or session.get("user_id") == user_id:
                    sessions.append({
                        "session_id": session["session_id"],
                        "created_at": session["created_at"],
                        "updated_at": session["updated_at"],
                        "turn_count": len(session["turns"]),
                        "preview": session["turns"][0]["query"] if session["turns"] else "New Session",
                    })
        return sorted(sessions, key=lambda s: s["updated_at"], reverse=True)

    def _save(self, session_id: str, data: dict):
        with open(self._session_path(session_id), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
