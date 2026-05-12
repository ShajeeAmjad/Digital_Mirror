from fastapi import APIRouter

from app.api.v1 import auth, looks, upload

v1_router = APIRouter()
v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
v1_router.include_router(upload.router, prefix="/upload", tags=["upload"])
v1_router.include_router(looks.router, prefix="/looks", tags=["looks"])
