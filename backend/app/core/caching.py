from functools import lru_cache
from typing import List, Dict

# ==========================================
# 1. Simulated Redis Cache (Recent Messages)
# ==========================================
# In production, this would be a Redis connection (e.g., redis-py).
# For local dev, we use an in-memory dictionary acting as an LRU Cache.

_RECENT_CHATS_CACHE: Dict[str, List[dict]] = {}

def cache_recent_messages(conversation_id: str, messages: List[dict]):
    """Stores the latest 100 messages in the Redis (Simulated) cache for instant sidebar loading."""
    _RECENT_CHATS_CACHE[conversation_id] = messages

def get_cached_recent_messages(conversation_id: str) -> List[dict]:
    """Retrieves the latest messages instantly from cache (0 latency)."""
    return _RECENT_CHATS_CACHE.get(conversation_id, [])

def invalidate_chat_cache(conversation_id: str):
    """Clears the cache when a conversation is updated or branched."""
    if conversation_id in _RECENT_CHATS_CACHE:
        del _RECENT_CHATS_CACHE[conversation_id]

# ==========================================
# 2. Semantic Caching
# ==========================================
# Stores exact or near-exact queries to prevent wasting LLM credits on duplicate questions.

_SEMANTIC_CACHE: Dict[str, str] = {}

def get_semantic_cache(query: str) -> str:
    """Returns the cached LLM answer if this exact query was asked recently."""
    # Note: In production, we would use FAISS/Redis Vector Search here to find *similar* queries.
    # For now, we use exact matching (lowered and stripped).
    normalized_query = query.strip().lower()
    return _SEMANTIC_CACHE.get(normalized_query)

def set_semantic_cache(query: str, answer: str):
    """Caches the LLM's final answer for future identical queries."""
    normalized_query = query.strip().lower()
    _SEMANTIC_CACHE[normalized_query] = answer
