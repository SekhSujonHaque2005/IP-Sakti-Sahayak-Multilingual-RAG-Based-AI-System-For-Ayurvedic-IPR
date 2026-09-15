# Incident: Vector Index Corruption or Missing Cache

## Purpose
Recovery guide for when the local FAISS or BM25 indices become corrupted or deleted, causing the backend to either crash on startup or hang for 15+ minutes while re-encoding 5,400+ document chunks.

## Impact
If indices are missing, the server will block all requests for ~15 minutes during startup while it re-computes dense vector embeddings. If the indices are corrupted, `faiss.read_index` will throw a fatal exception, preventing the application from starting.

## Symptoms
- Backend fails to start, throwing `RuntimeError` or `Exception` from `faiss.read_index`.
- Backend startup process takes significantly longer than normal, logging: `Encoding dense vectors...` and showing a progress bar.
- Empty retrieval results for all queries.

## Severity
P1

## Immediate Actions
Do not kill the backend process if it is currently displaying `Encoding dense vectors...` — it is actively rebuilding the cache. Let it finish if possible.

## Diagnosis
1. Navigate to the `backend/data/indices/` directory.
2. Check if the following files exist and have non-zero file sizes:
   - `faiss_IN.index`
   - `bm25_IN.pkl`
   - `chunks_IN.json`
3. If they are 0 bytes or throw errors when read by Python, they are corrupted.
4. Verify that the source corpus `backend/data/chunks.jsonl` exists. If this is missing, the indices cannot be rebuilt.

## Recovery
1. Delete all corrupted index files inside `backend/data/indices/`.
2. Ensure `backend/data/chunks.jsonl` is present.
3. Trigger a manual index rebuild by running the retrieval module directly or running the test suite:
```powershell
$env:PYTHONIOENCODING="utf-8"; d:\DravyaNidhi\vaidyasetu\backend\venv\Scripts\python.exe d:\DravyaNidhi\vaidyasetu\backend\tests\test_engine.py
```
4. Wait approximately 10-15 minutes for the `multilingual-e5-base` model to re-encode the corpus and save the new `.index` and `.pkl` files to disk.

## Validation
Once the build completes, restart the backend or re-run the test script. The startup should be near-instant, logging: `Using cached index for IN`.

## Rollback
No verified rollback mechanism found.

## Escalation
Escalate to ML engineering if `chunks.jsonl` is missing or corrupted, as the source data will need to be re-downloaded or re-parsed from PDFs.

## Do Not
- Do not attempt to manually edit the binary `.index` or `.pkl` files.
- Do not run multiple backend processes simultaneously during a rebuild, as this may cause a race condition when writing the new index files.

## Root Cause Follow-Up
Investigate file system stability or graceful shutdown procedures to prevent partial index writes in the future.
