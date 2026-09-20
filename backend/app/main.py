import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.rate_limit import limiter

# Add SlowAPI Rate Limiting Middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS so the frontend can communicate with the backend
# WARNING: allow_origins=["*"] is fine for local dev, but should be 
# restricted to your specific frontend URL in production (e.g. https://vaidyasetu.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the v1 API routes under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Django-like Admin Panel
from sqladmin import Admin
from app.db.database import engine
from app.core.admin import authentication_backend, UserAdmin, ConversationAdmin, MessageAdmin

admin = Admin(app, engine, authentication_backend=authentication_backend, title="VaidyaSetu Admin")
admin.add_view(UserAdmin)
admin.add_view(ConversationAdmin)
admin.add_view(MessageAdmin)

if __name__ == "__main__":
    import uvicorn
    print(f"Starting {settings.PROJECT_NAME} API Server...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
