import os
import sys
from pathlib import Path

# Ensure we can import from ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml_engine.search.web_search import search_tavily, search_exa, search_duckduckgo

def test_api(name, func):
    print(f"\n======================================")
    print(f"Testing {name} API...")
    print(f"======================================")
    try:
        results = func("India Patents Act 1970", max_results=2, restrict_to_trusted=False)
        if not results:
            print(f"❌ {name} returned empty results (Is the API key empty or invalid?)")
        else:
            print(f"✅ {name} SUCCESS! Returned {len(results)} results:")
            for i, r in enumerate(results):
                print(f"  {i+1}. {r['title']} ({r['url']})")
                print(f"     Snippet: {r['snippet'][:100]}...")
    except Exception as e:
        print(f"❌ {name} FAILED with Exception: {e}")

if __name__ == "__main__":
    print("Running explicit tests for all 3 Web Search Tiers...")
    test_api("Tier 1 (Tavily)", search_tavily)
    test_api("Tier 2 (Exa)", search_exa)
    test_api("Tier 3 (DuckDuckGo)", search_duckduckgo)
    print("\nTests complete.")
