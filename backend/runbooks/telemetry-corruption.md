# Incident: Telemetry File Corruption

## Purpose
Recovery guide for resolving issues where the Admin Dashboard or Feedback Submission loops throw HTTP 500 errors due to corrupted data storage.

## Impact
End users will not be able to log feedback. Admin panels will fail to load or will load with skewed/broken statistics.

## Symptoms
- Calling `/analytics/dashboard` yields an `HTTP 500 Internal Server Error`.
- The Uvicorn log prints `json.decoder.JSONDecodeError`.

## Severity
P3 - Low (Does not impact core RAG search capabilities)

## Diagnosis
VaidyaSetu telemetry (`analytics.jsonl` and `feedback.jsonl`) relies on simple append-only local files rather than a robust SQL database. If the server crashes mid-write, or if multiple threads attempt to write simultaneously without file locks, the JSON strings can become truncated or mangled on disk.

## Recovery

### Option 1: Surgical Fix
Open `backend/data/analytics.jsonl` or `backend/data/feedback.jsonl` in a text editor. Scroll to the very bottom of the file (where corruption usually occurs). Delete any incomplete or malformed JSON objects on the last line. Ensure every remaining line is a valid JSON object.

### Option 2: Nuclear Option (Wipe Telemetry)
If the file is completely destroyed, simply delete it. The `AnalyticsLogger` and `FeedbackStore` classes are designed to automatically recreate the files on the next incoming request.
```bash
rm data/analytics.jsonl
rm data/feedback.jsonl
```

## Validation
Restart the server and query the dashboard endpoint:
```powershell
$body = '{}'
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/v1/analytics/dashboard -Method Get
```
It should return a `200 OK` with zeroed-out stats.
