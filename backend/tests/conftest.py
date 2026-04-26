from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_db
from app.main import create_app
from app.models.base import Base

TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
TEST_JWT_PAYLOAD = {"sub": TEST_USER_ID, "aud": "authenticated"}


@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(scope="session")
async def db_engine():  # type: ignore[no-untyped-def]
    import os

    db_url = os.environ.get(
        "SUPABASE_DB_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/digital_mirror_test",
    )
    engine = create_async_engine(db_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:  # type: ignore[no-untyped-def]
    factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with factory() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    app = create_app()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with patch(
        "app.core.security.verify_supabase_jwt",
        new=AsyncMock(return_value=TEST_JWT_PAYLOAD),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            yield client
