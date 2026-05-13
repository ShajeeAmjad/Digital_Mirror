from unittest.mock import patch

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_presign_valid(async_client: AsyncClient) -> None:
    with patch(
        "app.api.v1.upload.generate_presigned_put",
        return_value="https://r2.example.com/presigned",
    ):
        response = await async_client.post(
            "/api/v1/upload/presign",
            json={
                "filename": "photo.jpg",
                "content_type": "image/jpeg",
                "size_bytes": 1_000_000,
            },
            headers={"Authorization": "Bearer valid-mocked"},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    assert "upload_url" in body["data"]
    assert "object_key" in body["data"]
    assert body["data"]["object_key"].endswith(".jpg")


@pytest.mark.anyio
async def test_presign_too_large(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/upload/presign",
        json={
            "filename": "big.jpg",
            "content_type": "image/jpeg",
            "size_bytes": 30_000_000,
        },
        headers={"Authorization": "Bearer valid-mocked"},
    )
    assert response.status_code == 400


@pytest.mark.anyio
async def test_presign_unauthenticated(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/upload/presign",
        json={
            "filename": "photo.jpg",
            "content_type": "image/jpeg",
            "size_bytes": 500_000,
        },
    )
    assert response.status_code == 401
