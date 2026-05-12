import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user
from app.core.storage import generate_presigned_put
from app.schemas.auth import APIResponse

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_SIZE_BYTES = 20_971_520  # 20 MB


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    size_bytes: int


class PresignResponse(BaseModel):
    upload_url: str
    object_key: str


@router.post("/presign", response_model=APIResponse[PresignResponse])
async def presign_upload(
    body: PresignRequest,
    user_id: str = Depends(get_current_user),
) -> APIResponse[PresignResponse]:
    if body.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="invalid_content_type")
    if body.size_bytes > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="file_too_large")

    ext = "jpg" if body.content_type == "image/jpeg" else "png"
    object_key = f"{user_id}/originals/{uuid.uuid4()}.{ext}"
    upload_url = generate_presigned_put(object_key, body.content_type)

    return APIResponse(data=PresignResponse(upload_url=upload_url, object_key=object_key))
