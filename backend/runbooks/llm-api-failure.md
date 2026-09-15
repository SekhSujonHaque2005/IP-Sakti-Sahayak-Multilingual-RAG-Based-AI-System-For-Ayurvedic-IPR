# Incident: External LLM API Failure

## Purpose
Recovery guide for when the primary Gemini LLM API and the HuggingFace fallback API fail, causing the ML engine's generation and verification steps to crash or return empty responses.

## Impact
The ML engine will fail to generate answers, verify citations, or compute confidence scores. The core product becomes completely unavailable to users.

## Symptoms
- `llm_client.py` logs `google.api_core.exceptions.ResourceExhausted` or `PermissionDenied` errors.
- `llm_client.py` logs `requests.exceptions.HTTPError` from the HuggingFace inference API.
- The 11-step reasoning chain aborts during the Generation (Step 9) or Verification (Step 10) phases.
- Empty or `null` responses returned to the user.

## Severity
P0

## Immediate Actions
Verify if the issue is a temporary network glitch or a permanent key revocation.

## Diagnosis
1. Check the `.env` file in the `backend/` root directory to ensure `GEMINI_API_KEY` and `HF_API_TOKEN` are present and correctly formatted.
2. Log into the Google Cloud Console (for Gemini) and check the API quota/billing status.
3. Log into the HuggingFace Dashboard (for Qwen2.5-72B-Instruct) and check if the access token has been revoked or rate-limited.

## Recovery
1. If the API key is expired or revoked, generate a new key in the respective provider's dashboard.
2. Update the `.env` file with the new keys:
   - `GEMINI_API_KEY`
   - `HF_API_TOKEN`
3. Restart the backend application to pick up the new environment variables.

## Validation
Run the test suite to verify the LLM can generate text:
```powershell
$env:PYTHONIOENCODING="utf-8"; d:\DravyaNidhi\vaidyasetu\backend\venv\Scripts\python.exe d:\DravyaNidhi\vaidyasetu\backend\tests\test_engine.py
```
Ensure that the Guardrails and Synthesis tests pass successfully.

## Rollback
No verified rollback mechanism found. Revert the `.env` file to the previous keys if the new ones are malformed.

## Escalation
Escalate to the infrastructure team if the provider is experiencing a global outage and keys cannot be provisioned.

## Do Not
- Do not commit actual API keys to the repository.
- Do not disable the guardrails or verification steps to bypass the LLM dependency.

## Root Cause Follow-Up
Implement alerting for when API quotas reach 80% to prevent unexpected exhaustions.
