"""Initial schema: profiles, looks, products, critique_results, tutorials

Revision ID: 0001
Revises:
Create Date: 2026-04-23
"""

import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("display_name", sa.Text, nullable=True),
        sa.Column("skin_tone", sa.Text, nullable=True),
        sa.Column("face_shape", sa.Text, nullable=True),
        sa.Column("goals", ARRAY(sa.String), nullable=True),
        sa.Column(
            "subscription_status",
            sa.Text,
            nullable=False,
            server_default="free",
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "looks",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.Text, nullable=True),
        sa.Column("original_key", sa.Text, nullable=False),
        sa.Column("result_key", sa.Text, nullable=True),
        sa.Column("layer_config", JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "products",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("brand", sa.Text, nullable=False),
        sa.Column("category", sa.Text, nullable=False),
        sa.Column("shade", sa.Text, nullable=True),
        sa.Column("hex_color", sa.Text, nullable=True),
        sa.Column("image_key", sa.Text, nullable=True),
        sa.Column("price_gbp", sa.Numeric(10, 2), nullable=True),
        sa.Column("affiliate_url", sa.Text, nullable=True),
        sa.Column("skin_tones", ARRAY(sa.String), nullable=True),
    )

    op.create_table(
        "critique_results",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "look_id",
            UUID(as_uuid=True),
            sa.ForeignKey("looks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("score", sa.Integer, nullable=True),
        sa.Column("tips", JSONB, nullable=True),
        sa.Column("product_ids", ARRAY(UUID(as_uuid=True)), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "tutorials",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("category", sa.Text, nullable=False),
        sa.Column("difficulty", sa.Text, nullable=False),
        sa.Column("is_premium", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("steps", JSONB, nullable=True),
        sa.Column("thumbnail_key", sa.Text, nullable=True),
    )

    # RLS policies — only applied against Supabase PostgreSQL (which has the auth schema).
    # Skipped in CI which uses a plain PostgreSQL instance.
    if os.environ.get("APP_ENV") == "production":
        op.execute("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY")
        op.execute("""
            CREATE POLICY profiles_self ON profiles
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id)
        """)

        op.execute("ALTER TABLE looks ENABLE ROW LEVEL SECURITY")
        op.execute("""
            CREATE POLICY looks_owner ON looks
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id)
        """)

        op.execute("ALTER TABLE products ENABLE ROW LEVEL SECURITY")
        op.execute(
            "CREATE POLICY products_public ON products FOR SELECT USING (true)"
        )

        op.execute("ALTER TABLE critique_results ENABLE ROW LEVEL SECURITY")
        op.execute("""
            CREATE POLICY critique_results_owner ON critique_results
            FOR SELECT USING (auth.uid() = user_id)
        """)

        op.execute("ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY")
        op.execute("""
            CREATE POLICY tutorials_access ON tutorials
            FOR SELECT USING (
                is_premium = false
                OR (
                    auth.uid() IS NOT NULL
                    AND EXISTS (
                        SELECT 1 FROM profiles
                        WHERE id = auth.uid()
                        AND subscription_status = 'premium'
                    )
                )
            )
        """)


def downgrade() -> None:
    op.drop_table("tutorials")
    op.drop_table("critique_results")
    op.drop_table("products")
    op.drop_table("looks")
    op.drop_table("profiles")
