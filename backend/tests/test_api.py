import pytest


@pytest.mark.asyncio
async def test_health(async_client):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_chat_validation_empty(async_client):
    response = await async_client.post("/chat", json={"message": "", "thread_id": "test"})
    assert response.status_code == 422
