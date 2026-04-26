import uuid

from sqlalchemy import ARRAY, String, Text, numeric, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    brand: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    shade: Mapped[str | None] = mapped_column(Text, nullable=True)
    hex_color: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_gbp: Mapped[float | None] = mapped_column(numeric(10, 2), nullable=True)
    affiliate_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    skin_tones: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
