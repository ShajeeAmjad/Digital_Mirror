import uuid
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    data: T | None = None
    error: str | None = None


class ProfileCreateRequest(BaseModel):
    display_name: str | None = None
    skin_tone: str | None = None
    face_shape: str | None = None
    goals: list[str] | None = None


class ProfileResponse(BaseModel):
    id: uuid.UUID
    display_name: str | None
    skin_tone: str | None
    face_shape: str | None
    goals: list[str] | None
    subscription_status: str

    model_config = {"from_attributes": True}
