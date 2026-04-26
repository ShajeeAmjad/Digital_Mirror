import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.profile import Profile
from app.schemas.auth import APIResponse, ProfileCreateRequest, ProfileResponse

router = APIRouter()


@router.get("/me", response_model=APIResponse[ProfileResponse])
async def get_me(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[ProfileResponse]:
    result = await db.execute(
        select(Profile).where(Profile.id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=404, detail="profile_not_found")
    return APIResponse(data=ProfileResponse.model_validate(profile))


@router.post("/profile", response_model=APIResponse[ProfileResponse])
async def upsert_profile(
    body: ProfileCreateRequest,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIResponse[ProfileResponse]:
    uid = uuid.UUID(user_id)

    update_values: dict[str, object] = {}
    if body.display_name is not None:
        update_values["display_name"] = body.display_name
    if body.skin_tone is not None:
        update_values["skin_tone"] = body.skin_tone
    if body.face_shape is not None:
        update_values["face_shape"] = body.face_shape
    if body.goals is not None:
        update_values["goals"] = body.goals

    # Build upsert: insert or update on conflict
    set_clause = ", ".join(
        f"{k} = EXCLUDED.{k}" for k in update_values
    ) or "id = EXCLUDED.id"

    columns = ["id"] + list(update_values.keys())
    placeholders = [":id"] + [f":{k}" for k in update_values]

    stmt = text(
        f"INSERT INTO profiles ({', '.join(columns)}) "
        f"VALUES ({', '.join(placeholders)}) "
        f"ON CONFLICT (id) DO UPDATE SET {set_clause} "
        f"RETURNING *"
    )
    row = await db.execute(stmt, {"id": uid, **update_values})
    await db.commit()

    profile_row = row.mappings().one()
    profile = Profile(**profile_row)
    return APIResponse(data=ProfileResponse.model_validate(profile))
