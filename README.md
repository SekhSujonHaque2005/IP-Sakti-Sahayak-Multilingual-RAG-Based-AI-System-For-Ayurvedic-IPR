# VaidyaSetu (वैद्यसेतु)
### Multilingual RAG-Based AI System for Ayurvedic Intellectual Property Rights & Regulatory Compliance

> **Empowering Ayurvedic innovators, researchers, and enterprises with citation-grounded, verifiable legal guidance across domestic and international IP frameworks.**

---

## 🌟 Key Features

* **Dual-Jurisdiction Hybrid Retrieval**:
  * **Indian National Law (`IN`)**: Covers the Patents Act 1970 (Section 3(p) TKDL exclusions), Biological Diversity Act 2002 & 2023 Amendment, Drugs and Cosmetics Act 1940 (Rule 158-B), FSSAI Ayurveda Aahar Regulations 2022, and Ayurvedic Pharmacopoeia of India (API) monographs.
  * **International Treaties (`INTL`)**: Covers the WIPO GRATK Treaty (2024), Nagoya Protocol on Access & Benefit Sharing (ABS), CBD, TRIPS, and PCT regulations.
  * **Search Engine**: E5 Multilingual dense embeddings (`intfloat/multilingual-e5-base`) combined with BM25 Okapi sparse keyword indexing, fused via Reciprocal Rank Fusion (RRF).

* **Citation-Grounded LLM Synthesis**:
  * Formulates precise legal statements strictly constrained to retrieved statutory texts — preventing hallucinations.
  * Multi-provider fallback engine: Google Gemini with zero-latency failover to Hugging Face Inference API (`Qwen/Qwen2.5-72B-Instruct`).

* **Independent Parallel Fact-Verification**:
  * Concurrently checks every generated claim against cited statutory clauses using a dedicated validation model.

* **3-Signal Confidence Scoring**:
  * Calibrates answer confidence from:
    1. Claim Verification Rate
    2. Document Currency Rate
    3. Retrieval Source Consensus
  * Triggers honest abstention if confidence is below threshold rather than guessing.

* **Statutory Supersession Graph**:
  * Automatically detects repealed or amended legislation (e.g., *Biological Diversity Rules 2004* $\to$ *Rules 2024*), routing citations to in-force amendments.

* **Transparent "Thinking Mode" Audit Trail**:
  * Collapsible dropdown revealing real-time reasoning steps, database query operations, and fact-checking rationale.

* **Formulation Regulatory Classifier Wizard**:
  * Interactive tool to categorize Ayurvedic products into regulatory pathways (*Classical Generic Medicine, Proprietary Medicine, Ayurveda Aahar, Phytopharmaceutical, or Cosmetic*).

---

## 🏛️ System Architecture

```
vaidyasetu/
├── backend/
│   ├── app/                    # FastAPI web application
│   │   ├── api/v1/             # Endpoints (public, auth, chat, admin)
│   │   ├── core/               # Configuration, security, rate limiting
│   │   └── db/                 # SQLAlchemy models & migrations
│   ├── ml_engine/              # Core Machine Learning & Legal Logic
│   │   ├── search/             # Hybrid retrieval (FAISS dense + BM25 sparse)
│   │   ├── synthesis/          # Citation generation & fact-checking
│   │   ├── legal_logic/        # Supersession graph & formulation classifier
│   │   └── telemetry/          # Analytics, session management & feedback loop
│   └── tests/                  # End-to-end test suites (40+ unit & integration tests)
└── frontend/                   # Modern React (Vite, TypeScript, TailwindCSS)
    └── src/
        ├── components/         # ChatView (Thinking Mode), WizardView, LandingView
        └── api.ts              # Backend API client
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.main
```
Backend API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
bun install # or npm install
bun dev     # or npm run dev
```
Frontend web application will run at `http://localhost:5173` or `http://localhost:5174`.

---

## 🧪 Running Tests

```bash
cd backend
python tests/test_engine.py   # Runs the 40-step ML Engine test suite
python -m pytest tests/test_api.py # Runs API integration tests
```

---

## ⚖️ Legal Disclaimer
VaidyaSetu provides automated legal and regulatory information for research and educational purposes only. It does not constitute formal legal advice or representation. For actionable IP decisions, consult a qualified patent agent or legal counsel.
