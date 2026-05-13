from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.anyio


async def test_create_look(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/looks",
        json={"original_key": "user/originals/photo.jpg", "title": "My Look"},
        headers={"Authorization": "Bearer test"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    data = body["data"]
    assert data["original_key"] == "user/originals/photo.jpg"
    assert data["title"] == "My Look"
    assert data["result_key"] is None
    assert "id" in data
    assert "created_at" in data


async def test_list_looks_empty(async_client: AsyncClient) -> None:
    response = await async_client.get(
        "/api/v1/looks",
        headers={"Authorization": "Bearer test"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    assert isinstance(body["data"], list)


async def test_list_looks_after_create(async_client: AsyncClient) -> None:
    # Create a look first
    create_resp = await async_client.post(
        "/api/v1/looks",
        json={"original_key": "user/originals/list_test.jpg", "title": "List Test"},
        headers={"Authorization": "Bearer test"},
    )
    assert create_resp.status_code == 200
    created_id = create_resp.json()["data"]["id"]

    # List and verify it appears
    list_resp = await async_client.get(
        "/api/v1/looks",
        headers={"Authorization": "Bearer test"},
    )
    assert list_resp.status_code == 200
    ids = [item["id"] for item in list_resp.json()["data"]]
    assert created_id in ids


async def test_get_look(async_client: AsyncClient) -> None:
    # Create a look
    create_resp = await async_client.post(
        "/api/v1/looks",
        json={"original_key": "user/originals/get_test.jpg", "title": "Get Test"},
        headers={"Authorization": "Bearer test"},
    )
    assert create_resp.status_code == 200
    look_id = create_resp.json()["data"]["id"]

    # Fetch by id
    get_resp = await async_client.get(
        f"/api/v1/looks/{look_id}",
        headers={"Authorization": "Bearer test"},
    )
    assert get_resp.status_code == 200
    body = get_resp.json()
    assert body["error"] is None
    assert body["data"]["id"] == look_id
    assert body["data"]["title"] == "Get Test"


async def test_delete_look(async_client: AsyncClient) -> None:
    # Create a look with both original and result keys
    create_resp = await async_client.post(
        "/api/v1/looks",
        json={
            "original_key": "user/originals/del_test.jpg",
            "title": "Delete Test",
        },
        headers={"Authorization": "Bearer test"},
    )
    assert create_resp.status_code == 200
    look_id = create_resp.json()["data"]["id"]

    # Patch boto3 delete to avoid real S3 calls
    mock_s3 = MagicMock()
    mock_s3.delete_object.return_value = {}
    with patch("app.api.v1.looks.boto3.client", return_value=mock_s3):
        delete_resp = await async_client.delete(
            f"/api/v1/looks/{look_id}",
            headers={"Authorization": "Bearer test"},
        )
    assert delete_resp.status_code == 200
    assert delete_resp.json()["error"] is None

    # Subsequent GET should return 404
    get_resp = await async_client.get(
        f"/api/v1/looks/{look_id}",
        headers={"Authorization": "Bearer test"},
    )
    assert get_resp.status_code == 404
