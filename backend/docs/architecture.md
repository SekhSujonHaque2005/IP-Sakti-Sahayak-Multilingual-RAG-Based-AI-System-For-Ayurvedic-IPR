# VaidyaSetu Backend Architecture

This document provides a high-level overview of the VaidyaSetu Backend Architecture. It details the interaction between the FastAPI server, the Machine Learning (ML) Engine, the external Web Search cascade, and the internal FAISS Vector Database.

---

## 1. System Use Case Diagram

The system serves three primary actors: **End Users**, **Data Administrators**, and **System Administrators**.

```mermaid
usecaseDiagram
    actor User as End User
    actor Admin as System Admin
    actor DataAdmin as Data Admin

    package "VaidyaSetu Core" {
        usecase "Query Legal Data" as UC1
        usecase "Submit Feedback" as UC2
        usecase "View Analytics Dashboard" as UC3
        usecase "Classify Product Category" as UC4
        usecase "Check Supersession Status" as UC5
        usecase "Ingest New Documents" as UC6
    }

    User --> UC1
    User --> UC2
    User --> UC4
    User --> UC5

    Admin --> UC3
    DataAdmin --> UC6
```

---

## 2. Component Data Flow Diagram (DFD)

The system employs a concurrent RAG (Retrieval-Augmented Generation) pipeline. When a user query arrives, the system simultaneously searches internal vectors and the live web to minimize latency.

```mermaid
flowchart TD
    Client((Client App))
    API[FastAPI Router\n/api/v1/query]
    LLM[Gemini Pro LLM Client]
    
    subgraph "Concurrent Search Pipeline"
        VectorDB[(FAISS Vector Database\n+ BM25 Indices)]
        WebCascade[4-Tier Web Search Cascade\nTavily -> Bing -> Exa -> DDG]
    end

    Telemetry[(JSONL Telemetry Store\nFeedback & Analytics)]
    
    Client -- "1. POST JSON Query" --> API
    API -- "2. Dispatch Threads" --> VectorDB
    API -- "2. Dispatch Threads" --> WebCascade
    
    VectorDB -- "3. Local Legal Context" --> LLM
    WebCascade -- "3. Live Web Context" --> LLM
    
    LLM -- "4. Synthesized Answer" --> API
    API -- "5. Log Query Metadata" --> Telemetry
    API -- "6. Return JSON Response" --> Client
```

---

## 3. Web Search Cascade Flow Diagram

To ensure indestructible external context retrieval, the web search component relies on a resilient 4-Tier fallback cascade mechanism. If any API is rate-limited (429) or offline, the system instantly degrades gracefully to the next tier.

```mermaid
flowchart LR
    Start([Search Request])
    
    T1{"Tier 1:\nTavily API"}
    T2{"Tier 2:\nNative Bing Scraper"}
    T3{"Tier 3:\nExa Search API"}
    T4{"Tier 4:\nDuckDuckGo Scraper"}
    
    End([Return Results])
    Fail([Return Empty List])

    Start --> T1
    T1 -- "Success" --> End
    T1 -- "Fail/429" --> T2
    
    T2 -- "Success" --> End
    T2 -- "Fail/Blocked" --> T3
    
    T3 -- "Success" --> End
    T3 -- "Fail/Limit" --> T4
    
    T4 -- "Success" --> End
    T4 -- "Fail" --> Fail
```

---

## 4. Class Diagram: ML Engine Core

The backend is modularized. The `ml_engine` package encapsulates all search, retrieval, generation, and telemetry logic, exposing clean interfaces to the FastAPI routers.

```mermaid
classDiagram
    class RAGPipeline {
        +run_query(session_id: str, query: str, context: dict) dict
    }
    
    class LocalSearch {
        -faiss_index: IndexFlatL2
        -bm25_index: BM25Okapi
        +hybrid_retrieve(query: str, k: int) list
        +build_indices(chunks: list)
    }

    class WebSearch {
        +web_search(query: str, max_results: int) list
        -search_tavily(query: str) list
        -search_bing_scraper(query: str) list
        -search_exa(query: str) list
        -search_duckduckgo(query: str) list
    }
    
    class LLMClient {
        -client: genai.GenerativeModel
        +generate_response(query: str, context: str) str
        +classify_product(description: str) dict
    }

    class AnalyticsLogger {
        -log_path: str
        +log_query(...)
        +get_dashboard_stats() dict
    }

    RAGPipeline --> LocalSearch : uses
    RAGPipeline --> WebSearch : uses
    RAGPipeline --> LLMClient : uses
    RAGPipeline --> AnalyticsLogger : logs telemetry
```

---

## 5. Sequence Diagram: Data Ingestion

The ingestion endpoint allows Data Administrators to upload new raw PDFs or Text documents into the system.

```mermaid
sequenceDiagram
    actor DataAdmin
    participant IngestAPI as /api/v1/documents/ingest
    participant Parser as PDF/Text Parser
    participant DB as FAISS Database (Offline Task)
    participant Storage as Raw File Storage
    
    DataAdmin->>IngestAPI: POST multipart/form-data (File)
    IngestAPI->>Storage: Save file to /data/raw_uploads
    IngestAPI->>Parser: Extract text (Metadata mapping)
    Parser-->>IngestAPI: Extracted raw text
    IngestAPI-->>DataAdmin: Return 202 Accepted (Queued for encoding)
    
    note over IngestAPI,DB: System restart required for Vector encoding
```
