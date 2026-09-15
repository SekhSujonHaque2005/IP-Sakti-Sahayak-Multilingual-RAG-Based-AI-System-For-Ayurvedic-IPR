# Developer Guide

Welcome to the VaidyaSetu Backend! This guide covers everything you need to set up the environment, run the server, and execute tests.

## 1. Prerequisites
- Python 3.10+
- `pip`
- Standard compilation tools (for FAISS C++ bindings)

## 2. Environment Setup

### Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate    # Linux/Mac
# OR
venv\Scripts\activate       # Windows
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in the `backend/` root directory:
```env
GEMINI_API_KEY=your_gemini_key
TAVILY_API_KEY=your_tavily_key
EXA_API_KEY=your_exa_key
```

## 3. Running the Server

Start the FastAPI server using Uvicorn (from the `backend/` directory):
```bash
python -m app.main
```
The server will boot on `http://127.0.0.1:8000`.

> [!WARNING]
> On the very first boot (or if `faiss_IN.index` is deleted), the server will parse the `chunks.jsonl` file and compile the local FAISS database into RAM using CPU resources. This can take several minutes to over an hour depending on the size of the dataset.

## 4. Viewing the Swagger UI
Once booted, navigate to `http://localhost:8000/docs` to see the auto-generated Swagger UI and interact with all endpoints seamlessly.

## 5. Running the Test Suite
We use native `unittest` to verify the pipeline logic.
```bash
python -m unittest discover tests
```
If you only want to test the Web Search Cascade:
```bash
python tests/test_web_scraper.py
```
