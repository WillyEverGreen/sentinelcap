"""
Unit Tests for War Room Stress Testing Engine
"""
import pytest
from routers.stress_test import execute_stress_test, StressTestRequest

@pytest.mark.asyncio
async def test_gfc_stress_scenario():
    req = StressTestRequest(scenario_id="2008_GFC")
    res = await execute_stress_test(req)
    assert res["scenario_id"] == "2008_GFC"
    assert res["post_shock"]["capital_shortfall_dollar"] > 0
    assert res["post_shock"]["portfolio_loss_pct"] > 0.10
    assert res["circuit_breaker_result"]["status"] in ["RED", "FROZEN"]

@pytest.mark.asyncio
async def test_covid_stress_scenario():
    req = StressTestRequest(scenario_id="2020_COVID")
    res = await execute_stress_test(req)
    assert res["scenario_id"] == "2020_COVID"
    assert res["post_shock"]["capital_shortfall_dollar"] > 0

@pytest.mark.asyncio
async def test_custom_stress_zero_shock():
    req = StressTestRequest(
        scenario_id="Custom",
        custom_shocks={"SPY": 0.0, "EFA": 0.0, "AGG": 0.0, "GLD": 0.0, "VNQ": 0.0, "BIL": 0.0},
        custom_vol_multiplier=1.0
    )
    res = await execute_stress_test(req)
    assert abs(res["post_shock"]["capital_shortfall_dollar"]) < 1e-2
