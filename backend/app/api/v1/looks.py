import logging
import uuid

import boto3
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.look import Look
from app.schemas.auth import APIResponse

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class LookCreateRequest(BaseModel):
    original_key: str
    title: str | None = None
    layer_config: dict | None = None


class LookResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    original_key: str
    result_key: str | None
    title: str | None
    layer_config: dict | None
    created_at: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _s3_client() -> boto3.client:  # type: ignore[valid-type]
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
        region_name="auto",
    )


def _delete_r2_objects(keys: list[str]) -> None:
    """Attempt to delete R2 objects; log and swallow any errors (non-fatal)."""
    try:
        client = _s3_client()
        for key in keys:
            client.delete_object(Bucket=settings.R2_BUCKET, Key=key)
    except Exception:
        logger.exception("Failed to delete R2 objects %s — continuing", keys)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("", response_model=APIResponse[LookResponse])
async def create_look(
    body: LookCreateRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[LookResponse]:
    look = Look(
        user_id=uuid.UUID(user_id),
        original_key=body.original_key,
        title=body.title,
        layer_config=body.layer_config,
    )
    db.add(look)
    await db.commit()
    await db.refresh(look)
    return APIResponse(data=LookResponse.model_validate(look))


@router.get("", response_model=APIResponse[list[LookResponse]])
async def list_looks(
    page: int = Query(default=1, ge=1),
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[list[LookResponse]]:
    offset = (page - 1) * 20
    result = await db.execute(
        select(Look)
        .where(Look.user_id == uuid.UUID(user_id))
        .order_by(Look.created_at.desc())
        .offset(offset)
        .limit(20)
    )
    looks = result.scalars().all()
    return APIResponse(data=[LookResponse.model_validate(look) for look in looks])


@router.get("/{look_id}", response_model=APIResponse[LookResponse])
async def get_look(
    look_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[LookResponse]:
    result = await db.execute(select(Look).where(Look.id == look_id))
    look = result.scalar_one_or_none()
    if look is None or look.user_id != uuid.UUID(user_id):
        raise HTTPException(status_code=404, detail="look_not_found")
    return APIResponse(data=LookResponse.model_validate(look))


@router.delete("/{look_id}", response_model=APIResponse[None])
async def delete_look(
    look_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[None]:
    result = await db.execute(select(Look).where(Look.id == look_id))
    look = result.scalar_one_or_none()
    if look is None or look.user_id != uuid.UUID(user_id):
        raise HTTPException(status_code=404, detail="look_not_found")

    # Collect R2 keys to delete (non-fatal if it fails)
    keys_to_delete = [look.original_key]
    if look.result_key:
        keys_to_delete.append(look.result_key)

    await db.delete(look)
    await db.commit()

    _delete_r2_objects(keys_to_delete)

    return APIResponse(data=None)
