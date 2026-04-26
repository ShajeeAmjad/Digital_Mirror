from unittest.mock import AsyncMock, patch

import jwt
import pytest
from httpx import AsyncClient

from tests.conftest import TEST_USER_ID


@pytest.mark.anyio
async def test_me_no_token(async_client: AsyncClient) -> None:
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_me_invalid_token(async_client: AsyncClient) -> None:
    with patch(
        "app.core.security.verify_supabase_jwt",
        new=AsyncMock(side_effect=Exception("invalid")),
    ):
        response = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer bad-token"},
        )
    assert response.status_code in (401, 500)


@pytest.mark.anyio
async def test_me_no_profile(async_client: AsyncClient) -> None:
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer valid-mocked"},
    )
    assert response.status_code == 404


@pytest.mark.anyio
async def test_upsert_profile_creates(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/auth/profile",
        json={"display_name": "Test User", "skin_tone": "medium"},
        headers={"Authorization": "Bearer valid-mocked"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["display_name"] == "Test User"
    assert body["data"]["skin_tone"] == "medium"
    assert body["error"] is None


@pytest.mark.anyio
async def test_me_returns_profile_after_create(async_client: AsyncClient) -> None:
    # Create profile first
    await async_client.post(
        "/api/v1/auth/profile",
        json={"display_name": "Returning User"},
        headers={"Authorization": "Bearer valid-mocked"},
    )
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer valid-mocked"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["display_name"] == "Returning User"
    assert str(body["data"]["id"]) == TEST_USER_ID
