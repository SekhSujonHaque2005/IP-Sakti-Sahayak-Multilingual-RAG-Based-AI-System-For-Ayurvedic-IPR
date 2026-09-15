# Incident: Web Search Cascade Failure

## Purpose
Recovery guide for when the multi-level cascading web search architecture fails entirely, meaning all 4 search tiers (Tavily, Bing Scraper, Exa, and DuckDuckGo Scraper) have hit rate limits or failed.

## Impact
If the ML engine has low confidence in its internal vector search results, it attempts to fall back to the web. If all 4 web search tiers fail, the engine will fail to gather external context and will abstain from answering the query.

## Architecture
The system attempts web searches in the following order:
1. **Tier 1 (Tavily)**: Built for AI, 1,000 free searches/month.
2. **Tier 2 (Bing Scraper)**: Unlimited, native Python `BeautifulSoup` scraper, but might trigger IP bans if aggressively overused.
3. **Tier 3 (Exa)**: Built for AI, 1,000 free searches/month.
4. **Tier 4 (DuckDuckGo Scraper)**: Unlimited, native Python library, triggers IP bans if overused.

## Symptoms
- The backend logs `All web search tiers failed.`
- Low-confidence queries that previously succeeded using web search now result in the engine abstaining.

## Severity
P2

## Diagnosis
Search the backend logs for exceptions originating from `ml_engine.search.web_search`. You will likely see a trace of failures indicating exactly which tier broke:
- `Tier 1 (Tavily) failed: 403 Forbidden`
- `Tier 2 (Bing Scraper) failed: 429 Too Many Requests`
- `Tier 3 (Exa) failed: 429 Too Many Requests`
- `Tier 4 (DuckDuckGo) failed: RatelimitException`

Check the `.env` file to ensure the API keys are correctly configured and not set to placeholder values.

## Recovery
1. **Tier 1 & Tier 3 Failures**: If the official APIs are failing, log into the respective dashboards (tavily.com, exa.ai) to check if your free credits are exhausted. If they are, you must wait for the next billing cycle or upgrade to a paid tier.
2. **Tier 2 & Tier 4 Failure**: Bing and DuckDuckGo IP bans usually lift automatically after a few hours or a day.
3. **Emergency Fix**: You can easily add a new free API to `.env` (for example, swap out your empty Tavily key for a fresh Tavily key on a different email address) and restart the server. The cascade will immediately pick it up.

## Validation
Execute the test suite and ensure the Web Search test passes. The console output will explicitly tell you which tier succeeded:
```powershell
$env:PYTHONIOENCODING="utf-8"; d:\DravyaNidhi\vaidyasetu\backend\venv\Scripts\python.exe d:\DravyaNidhi\vaidyasetu\backend\tests\test_engine.py
```
Look for: `Web search succeeded via Tier X`

## Rollback
No verified rollback mechanism found.

## Do Not
- Do not attempt to bypass the block by removing the `should_trigger_web_search` confidence check, as this will just result in more failed API calls.
