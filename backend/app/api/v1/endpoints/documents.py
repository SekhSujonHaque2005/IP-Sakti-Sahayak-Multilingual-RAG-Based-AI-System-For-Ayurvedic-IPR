import sys
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from ml_engine.legal_logic.supersession_graph import resolve_current_document

router = APIRouter()

# Define where uploaded files will be stored temporarily
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "raw_uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/supersession/{doc_name}")
def get_document_supersession_status(doc_name: str):
    """
    Checks if a document (e.g., 'Biological Diversity Rules 2004') has been 
    superseded by a newer law, and returns the path to the current active document.
    """
    try:
        result = resolve_current_document(doc_name)
        return {
            "status": "success",
            "original_document": doc_name,
            "current_active_document": result["current_document"],
            "supersession_path": result["traversal_path"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest")
async def upload_document_for_ingestion(file: UploadFile = File(...)):
    """
    Uploads a PDF or TXT file to the backend.
    NOTE: This only saves the file to disk. The offline vector database 
    batch processor will pick it up and embed it later.
    """
    try:
        # Generate a unique filename to prevent overwriting
        file_ext = Path(file.filename).suffix
        safe_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / safe_filename
        
        # Save the file to disk
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "status": "success",
            "message": "File uploaded successfully. It has been queued for vector ingestion.",
            "original_filename": file.filename,
            "saved_as": safe_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
