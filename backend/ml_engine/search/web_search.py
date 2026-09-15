import os
import requests
from dotenv import load_dotenv
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
from ddgs import DDGS

TRUSTED_LEGAL_DOMAINS = [
    "indiacode.nic.in",
    "ipindia.gov.in",
    "nbaindia.org",
    "fssai.gov.in",
    "ayush.gov.in",
    "wipo.int",
    "cbd.int",
    "legislative.gov.in",
    "egazette.gov.in",
]

def search_tavily(query: str, max_results: int, restrict_to_trusted: bool) -> list:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key or "your_" in api_key:
        return []
    
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results
    }
    if restrict_to_trusted:
        payload["include_domains"] = TRUSTED_LEGAL_DOMAINS[:5]

    response = requests.post("https://api.tavily.com/search", json=payload, timeout=5)
    response.raise_for_status()
    data = response.json()
    
    results = []
    for r in data.get("results", []):
        source_type = "trusted" if any(d in r.get("url", "") for d in TRUSTED_LEGAL_DOMAINS) else "web"
        results.append({
            "title": r.get("title", ""),
            "snippet": r.get("content", ""),
            "url": r.get("url", ""),
            "source_type": source_type,
        })
    return results

def search_exa(query: str, max_results: int, restrict_to_trusted: bool) -> list:
    api_key = os.getenv("EXA_API_KEY")
    if not api_key or "your_" in api_key:
        return []

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "query": query,
        "numResults": max_results,
        "useAutoprompt": True,
        "contents": {"text": True}
    }
    if restrict_to_trusted:
        payload["includeDomains"] = TRUSTED_LEGAL_DOMAINS[:5]

    try:
        response = requests.post("https://api.exa.ai/search", headers=headers, json=payload, timeout=8)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for r in data.get("results", []):
            source_type = "trusted" if any(d in r.get("url", "") for d in TRUSTED_LEGAL_DOMAINS) else "web"
            results.append({
                "title": r.get("title", ""),
                "snippet": r.get("text", "No snippet available.") if r.get("text") else r.get("title", ""),
                "url": r.get("url", ""),
                "source_type": source_type,
            })
        return results
    except Exception as e:
        print(f"Exa search internal error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Exa API Response: {e.response.text}")
        raise e


def search_bing_scraper(query: str, max_results: int, restrict_to_trusted: bool) -> list:
    search_query = query
    if restrict_to_trusted:
        site_filter = " OR ".join(f"site:{d}" for d in TRUSTED_LEGAL_DOMAINS[:5])
        search_query = f"({query}) ({site_filter})"
        
    encoded_query = quote_plus(search_query)
    search_url = f"https://www.bing.com/search?q={encoded_query}&count={max_results * 2}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    }
    
    response = requests.get(search_url, headers=headers, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    results = []
    for li in soup.find_all('li', class_='b_algo'):
        if len(results) >= max_results:
            break
            
        anchor = li.find('a')
        if not anchor or not anchor.get('href'):
            continue
            
        url = anchor['href']
        title_element = li.find('h2')
        if not title_element:
            continue
        title = title_element.text
        
        snippet_div = li.find('div', class_='b_caption')
        if snippet_div:
            p_tag = snippet_div.find('p')
            snippet = p_tag.text if p_tag else snippet_div.text
        else:
            snippet = ""
            
        source_type = "trusted" if any(d in url for d in TRUSTED_LEGAL_DOMAINS) else "web"
        results.append({
            "title": title,
            "snippet": snippet[:300] + "..." if len(snippet) > 300 else snippet,
            "url": url,
            "source_type": source_type,
        })
    return results

def search_duckduckgo(query: str, max_results: int, restrict_to_trusted: bool) -> list:
    results = []
    with DDGS() as ddgs:
        search_query = query
        if restrict_to_trusted:
            site_filter = " OR ".join(f"site:{d}" for d in TRUSTED_LEGAL_DOMAINS[:5])
            search_query = f"({query}) ({site_filter})"
        raw_results = list(ddgs.text(search_query, max_results=max_results))
        for r in raw_results:
            source_type = "trusted" if any(d in r.get("href", "") for d in TRUSTED_LEGAL_DOMAINS) else "web"
            results.append({
                "title": r.get("title", ""),
                "snippet": r.get("body", ""),
                "url": r.get("href", ""),
                "source_type": source_type,
            })
    return results

def web_search(query: str, max_results: int = 5, restrict_to_trusted: bool = False) -> list:
    """Cascading Web Search: Tavily -> Bing Scraper -> Exa -> DuckDuckGo"""
    
    # Tier 1: Tavily
    try:
        results = search_tavily(query, max_results, restrict_to_trusted)
        if results:
            print("Web search succeeded via Tier 1: Tavily API")
            return results
    except Exception as e:
        print(f"Tier 1 (Tavily) failed or unconfigured: {e}")

    # Tier 2: Bing Scraper (Replaced Google due to 429 IP Blocks)
    try:
        results = search_bing_scraper(query, max_results, restrict_to_trusted)
        if results:
            print("Web search succeeded via Tier 2: Native Bing Scraper")
            return results
    except Exception as e:
        print(f"Tier 2 (Bing Scraper) failed: {e}")

    # Tier 3: Exa
    try:
        results = search_exa(query, max_results, restrict_to_trusted)
        if results:
            print("Web search succeeded via Tier 3: Exa Search API")
            return results
    except Exception as e:
        print(f"Tier 3 (Exa) failed or unconfigured: {e}")

    # Tier 4: DuckDuckGo (Scraper Fallback)
    try:
        results = search_duckduckgo(query, max_results, restrict_to_trusted)
        if results:
            print("Web search succeeded via Tier 4: DuckDuckGo Scraper")
            return results
    except Exception as e:
        print(f"Tier 4 (DuckDuckGo) failed: {e}")

    print("All web search tiers failed.")
    return []

def format_web_results_for_llm(web_results: list) -> str:
    if not web_results:
        return ""
    parts = ["WEB SEARCH RESULTS (use with caution — verify against primary legal sources):"]
    for i, r in enumerate(web_results):
        trust_tag = "🟢 TRUSTED" if r["source_type"] == "trusted" else "🟡 WEB"
        parts.append(f"\n[Web Source {i+1}] [{trust_tag}] {r['title']}\nURL: {r['url']}\n{r['snippet']}")
    return "\n".join(parts)

def should_trigger_web_search(confidence_score: float, num_local_results: int) -> bool:
    if num_local_results == 0:
        return True
    if confidence_score < 0.4:
        return True
    return False
