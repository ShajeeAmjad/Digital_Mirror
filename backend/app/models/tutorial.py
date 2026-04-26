import uuid

from sqlalchemy import Boolean, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Tutorial(Base):
    __tablename__ = "tutorials"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(Text, nullable=False)
    is_premium: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    steps: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    thumbnail_key: Mapped[str | None] = mapped_column(Text, nullable=True)
