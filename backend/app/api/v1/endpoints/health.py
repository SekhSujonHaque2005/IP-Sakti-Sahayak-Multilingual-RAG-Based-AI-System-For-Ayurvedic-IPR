from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    """
    Simple health check endpoint to verify the API is running.
    """
    return {
        "status": "healthy",
        "service": "vaidyasetu-ml-engine",
        "version": "1.0.0"
    }
