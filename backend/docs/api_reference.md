# VaidyaSetu Backend API Reference

This document outlines the REST API exposed by the FastAPI server, mounted by default at `http://localhost:8000/api/v1`.

---

## 1. Core ML Endpoints

### `POST /query`
Executes a full Retrieval-Augmented Generation (RAG) query against the legal database and live web.

**Request Payload:**
```json
{
  "query": "Is ashwagandha regulated as a drug in India?",
  "session_id": "optional-uuid-string"
}
```
**Response (200 OK):**
```json
{
  "session_id": "abc-123",
  "query": "Is ashwagandha regulated as a drug in India?",
  "answer": "Yes, Ashwagandha falls under the purview of...",
  "confidence": 0.94,
  "sources": {
    "vector_chunks": [...],
    "web_results": [...]
  }
}
```

---

### `POST /classifier/product`
Classifies a given product description into a regulatory category using the LLM.

**Request Payload:**
```json
{
  "product_name": "Herbal Sleep Tea",
  "ingredients": ["Chamomile", "Ashwagandha", "Melatonin"],
  "intended_use": "Promotes sleep and reduces stress"
}
```
**Response (200 OK):**
```json
{
  "category": "Ayurvedic Proprietary Medicine",
  "confidence_score": 0.88,
  "reasoning": "The presence of Ashwagandha...",
  "required_licenses": ["AYUSH Manufacturing License"]
}
```

---

## 2. Telemetry & Analytics

### `POST /feedback`
Submits user feedback (Thumbs Up/Down) to the telemetry loop for future model fine-tuning.

**Request Payload:**
```json
{
  "session_id": "abc-123",
  "query": "What is the legal age?",
  "answer": "The legal age is...",
  "chunks_used": ["doc1", "doc2"],
  "rating": "thumbs_up",
  "correction": ""
}
```

### `GET /analytics/dashboard`
Retrieves aggregated telemetry statistics for the Admin Dashboard.

**Response (200 OK):**
```json
{
  "total_queries": 1542,
  "avg_confidence": 0.89,
  "top_intents": {
    "legal_definition": 450,
    "licensing_requirement": 320
  },
  "jurisdiction_split": {"IN": 1542, "INTL": 0},
  "confidence_distribution": {"high": 1200, "medium": 300, "low": 42}
}
```

### `GET /sessions/{session_id}`
Retrieves the chat history for a given session.

---

## 3. Data & Document Management

### `POST /documents/ingest`
Uploads a raw PDF, DOCX, or TXT file to the ingestion queue.

**Request:** `multipart/form-data` with a `file` field.
**Response (202 Accepted):**
```json
{
  "status": "success",
  "filename": "document.pdf",
  "message": "File ingested successfully. Vector encoding will occur on next server reboot."
}
```

### `GET /documents/supersession`
Checks if a specific law or gazette notification has been superseded by newer legislation.

**Query Parameters:** `?document_id=XYZ&jurisdiction=IN`

---

## 4. DevOps

### `GET /health`
Liveness probe to verify server and database connectivity.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-14T12:00:00Z",
  "services": {
    "vector_db": "connected",
    "llm_api": "connected"
  }
}
```
