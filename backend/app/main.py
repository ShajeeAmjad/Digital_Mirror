from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import v1_router
from app.core.config import settings


def create_app() -> FastAPI:
    application = FastAPI(title="Digital Mirror API", version="1.0.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.APP_ENV}

    application.include_router(v1_router, prefix="/api/v1")

    return application


app = create_app()
