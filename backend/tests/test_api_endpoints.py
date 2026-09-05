"""
Integration Tests for FastAPI Endpoints
"""
import pytest
import httpx
from main import app

@pytest.mark.asyncio
async def test_api_health():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "HEALTHY"

@pytest.mark.asyncio
async def test_api_portfolio():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/portfolio")
        assert resp.status_code == 200
        data = resp.json()
        assert "portfolio" in data
        assert "recent_prices" in data

@pytest.mark.asyncio
async def test_api_optimize_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/optimize", json={
            "strategy": "mean_cvar",
            "risk_tolerance": 0.5,
            "max_weight": 0.40,
            "min_cash_buffer": 0.05
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "optimization_result" in data
        assert "trade_list" in data
        assert "efficient_frontier" in data

@pytest.mark.asyncio
async def test_api_risk_status():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/risk/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "risk_metrics" in data
        assert "regime" in data
        assert "circuit_breaker" in data

@pytest.mark.asyncio
async def test_api_safeguard_endpoints():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/safeguard/status")
        assert resp.status_code == 200
        status_data = resp.json()
        assert "status" in status_data

        toggle_resp = await client.post("/api/safeguard/toggle", json={"mode": "manual"})
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["mode"] == "manual"

        # Toggle back to auto
        await client.post("/api/safeguard/toggle", json={"mode": "auto"})

        audit_resp = await client.get("/api/safeguard/audit-log")
        assert audit_resp.status_code == 200
        assert len(audit_resp.json()["entries"]) > 0
