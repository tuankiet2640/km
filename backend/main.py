from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.users.routers import user_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins, change in prod to only allowed origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(user_router.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"]) # users router

# folders router
from backend.folders.routers import folder_router
app.include_router(folder_router.router, prefix=f"{settings.API_V1_STR}/folders", tags=["folders"])
