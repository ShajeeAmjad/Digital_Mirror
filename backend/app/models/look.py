import uuid

from sqlalchemy import ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Look(Base):
    __tablename__ = "looks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    original_key: Mapped[str] = mapped_column(Text, nullable=False)
    result_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    layer_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )
