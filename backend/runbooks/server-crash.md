# Incident: Server Crash or Out-Of-Memory (OOM)

## Purpose
Recovery guide for when the FastAPI server refuses to start or randomly terminates due to hardware exhaustion.

## Impact
Complete backend downtime. The frontend application will display 500 or 503 HTTP errors across all interactions.

## Symptoms
- The terminal process terminates with `Exit code -1073741510` (Windows) or `Killed` (Linux).
- The server logs halt during the string `Encoding 5460 dense vectors...`
- `Uvicorn error: Address already in use`

## Severity
P1 - Critical

## Diagnosis & Recovery

### 1. Vector Database Compilation (OOM Error)
**Cause:** FAISS indices are compiled entirely in system RAM. If the `chunks.jsonl` file is too large (e.g., millions of chunks), CPU vectorization will spike RAM usage and the OS kernel will kill the process to preserve system stability.
**Fix:**
- Reduce the chunk size or number of files processed in `data/chunks.jsonl`.
- If compiling on a low-RAM environment, modify `ml_engine.pipeline.py` to set `VECTOR_INDEX = None` and bypass the FAISS load temporarily, relying solely on Web Search (Tier 1-4).

### 2. Port Binding Conflicts
**Cause:** Another process (or a zombie uvicorn instance) is already using port `8000`.
**Fix:**
```powershell
# Find the PID using port 8000
netstat -ano | findstr :8000
# Kill it (replace PID)
taskkill /PID <PID> /F
```

### 3. Missing API Keys
**Cause:** `google.generativeai` will throw an unauthorized exception during startup if the GEMINI key is absent.
**Fix:** Verify `.env` file exists and is populated.

## Validation
Restart the server: `python -m app.main`. Ensure the terminal reaches: `INFO: Application startup complete.`
