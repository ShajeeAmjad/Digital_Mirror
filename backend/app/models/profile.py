import uuid

from sqlalchemy import ARRAY, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    display_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    skin_tone: Mapped[str | None] = mapped_column(Text, nullable=True)
    face_shape: Mapped[str | None] = mapped_column(Text, nullable=True)
    goals: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    subscription_status: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="free"
    )
    created_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[str] = mapped_column(
        server_default=text("now()"),
        onupdate=func.now(),
        nullable=False,
    )
