import sys
from pathlib import Path
import json

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml_engine.search.web_search import search_bing_scraper

print("Testing Bing Scraper (Tier 2)...")
try:
    results = search_bing_scraper("What is the legal age of marriage in India?", 3, False)
    print(json.dumps(results, indent=2))
except Exception as e:
    print(f"Scraper failed: {e}")
