import uuid

from sqlalchemy import ForeignKey, Integer, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CritiqueResult(Base):
    __tablename__ = "critique_results"

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
    look_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("looks.id", ondelete="CASCADE"),
        nullable=False,
    )
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tips: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    product_ids: Mapped[list[uuid.UUID] | None] = mapped_column(
        ARRAY(UUID(as_uuid=True)), nullable=True
    )
    created_at: Mapped[str] = mapped_column(
        server_default=text("now()"), nullable=False
    )
