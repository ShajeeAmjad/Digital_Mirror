import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health(async_client: AsyncClient) -> None:
    response = await async_client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "env" in body
