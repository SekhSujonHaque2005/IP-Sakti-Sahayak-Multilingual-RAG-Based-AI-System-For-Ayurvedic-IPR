# Pull Request: VaidyaSetu Prototype Overhaul & Interactive Thinking Mode

## 📌 Summary of Changes

This PR resolves all runtime issues that prevented the VaidyaSetu prototype from answering legal and regulatory queries. It also introduces the **Interactive Thinking Mode & Reasoning Dropdown**, enabling full transparency into how the ML engine consults the statutory databases and verifies legal claims.

---

## 🛠️ Key Improvements & Fixes

### 1. RAG Answer Pipeline Fixes (Resolving 0% Confidence Abstention Bug)
- **Grounded Claim Synthesis (`generation.py`)**: Added resilient JSON parsing with raw-text recovery fallback and detailed error logging.
- **Parallel Fact-Checking (`verification.py`)**: Implemented fuzzy source ID matching (exact $\to$ case-insensitive $\to$ title substring), preventing valid statutory claims from being silently dropped.
- **Confidence Scoring (`confidence.py`)**: Corrected denominator calculation in verification rate formula (`total_claims` / `retrieved_chunks`).
- **Pipeline Orchestrator (`pipeline.py`)**: Added greeting detection (`_is_greeting()`) for instant onboarding and unverified claims fallback to prevent unwarranted abstentions.

### 2. Multi-Provider Fallback & Zero-Latency LLM Routing (`llm_client.py`)
- Removed exponential retry loops on invalid Gemini keys, instantly routing requests to Hugging Face Inference API (`Qwen/Qwen2.5-72B-Instruct`).
- Configured authenticated `HF_TOKEN` handling.

### 3. Dual Jurisdiction Partitioning (India vs. International)
- Added concurrent loading of both `IN` (1,636 chunks) and `INTL` (4,708 chunks) FAISS dense and BM25 sparse indices.
- Passed `jurisdiction` parameter through API schemas (`payload.py`, `public.py`, `api.ts`).
- Added interactive **India / International** switch in the chat header with dynamic placeholder text.

### 4. Interactive Thinking Mode & Reasoning Dropdown (`ChatView.tsx`)
- **Live Thinking Card**: Displays real-time progress indicators (guardrails check, vector database search, supersession graph traversal, claim synthesis, and fact verification) with a live ticking timer.
- **Collapsible Reasoning Dropdown**: Formats a 7-step audit trail above every answer, allowing users to inspect the exact database operations and verification rationale.

### 5. Legislative Supersession Graph (`supersession_graph.py`)
- Added snake_case document identifier mapping to trace outdated acts/rules to current amendments (e.g. *Biological Diversity Rules 2004* $\to$ *Rules 2024*).
- Surfaces warning alert banners directly in the chat interface.

### 6. Windows UTF-8 & CORS Configuration
- Reconfigured standard streams to UTF-8 to prevent `UnicodeEncodeError` under Windows console `cp1252`.
- Updated FastAPI CORS middleware in `main.py` to allow ports `5173`, `5174`, and `3000`.

---

## 🧪 Verification & Test Results

- **ML Engine End-to-End Test Suite (`tests/test_engine.py`)**: **40 passed, 0 failed (3.72s)**
- **API Integration Tests (`tests/test_api.py`)**: **3 passed, 0 failed**
- **Frontend Production Build (`bun run build`)**: Zero TypeScript errors, built in **2.95s**
- **Live API Tests**:
  - Greeting query (`"hi"`): 100% confidence welcome response.
  - Indian Patent Act query (`"What is Section 3(p) of the Patents Act?"`): 80% High confidence, 8 verified sources.
  - International Treaty query (`"What is the Nagoya Protocol...?"`): 80% High confidence, sourced from WIPO & CBD corpus.
  - Formulation Classifier: Accurately categorized classical medicines and food supplements.
