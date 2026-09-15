from fastapi import APIRouter
from app.api.v1.endpoints import health, query, sessions, feedback, analytics, classifier, documents, auth, chat, public

api_router = APIRouter()

api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(classifier.router, prefix="/classifier", tags=["classifier"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
