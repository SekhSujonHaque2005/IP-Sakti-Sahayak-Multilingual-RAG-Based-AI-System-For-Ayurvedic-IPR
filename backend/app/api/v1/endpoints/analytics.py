import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

# Ensure we can import ml_engine
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent.parent))
from ml_engine.telemetry.analytics import AnalyticsLogger

router = APIRouter()
analytics_logger = AnalyticsLogger()

@router.get("/dashboard")
def get_dashboard_metrics():
    """
    Returns high-level statistics about the ML Engine usage,
    including total queries, average confidence, and active jurisdictions.
    """
    try:
        stats = analytics_logger.get_dashboard_stats()
        popular_topics = analytics_logger.get_popular_topics(n=5)
        
        return {
            "status": "success",
            "metrics": stats,
            "popular_topics": popular_topics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
