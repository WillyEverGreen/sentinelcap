"""
Stress Testing & War Room API Router:
Simulates macroeconomic crises, liquidity freezes, and rate shocks.
Evaluates portfolio survival, capital shortfalls, and autonomous intervention triggers.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from data.market_data import load_scenarios, load_portfolio_config, get_returns_df
from engine.optimizer import HRPOptimizer
from engine.risk_metrics import RiskMetricsEngine
from controls.circuit_breaker import GLOBAL_CIRCUIT_BREAKER

router = APIRouter(prefix="/api/stress-test", tags=["Stress Testing"])

class StressTestRequest(BaseModel):
    scenario_id: str = Field(default="2008_GFC", description="2008_GFC | 2020_COVID | Fed_Rate_Shock | Stagflation_1970s | Custom")
    custom_shocks: dict[str, float] | None = None
    custom_vol_multiplier: float = 1.0
    current_weights: dict[str, float] | None = None

@router.get("/scenarios")
async def get_available_scenarios():
    return load_scenarios()

@router.post("")
async def execute_stress_test(request: StressTestRequest):
    scenarios = load_scenarios()
    port_cfg = load_portfolio_config()
    total_val = port_cfg.get("total_value", 10_000_000.0)

    weights = request.current_weights or GLOBAL_CIRCUIT_BREAKER.active_weights

    # Identify shock profile
    if request.scenario_id in scenarios:
        scenario = scenarios[request.scenario_id]
        shocks = scenario["asset_shocks"]
        vol_mult = scenario.get("volatility_multiplier", 2.0)
        scenario_name = scenario["name"]
        scenario_desc = scenario["description"]
    elif request.scenario_id.lower() == "custom":
        shocks = request.custom_shocks or {t: 0.0 for t in weights}
        vol_mult = request.custom_vol_multiplier
        scenario_name = "Custom Stress Test"
        scenario_desc = "User-defined shock vectors"
    else:
        raise HTTPException(status_code=400, detail=f"Scenario '{request.scenario_id}' not found")

    # Compute asset-level and total portfolio impact
    asset_breakdown = {}
    post_shock_total_val = 0.0

    for ticker, w in weights.items():
        initial_dollar = w * total_val
        shock_pct = shocks.get(ticker, 0.0)
        dollar_loss = initial_dollar * shock_pct
        post_shock_dollar = initial_dollar + dollar_loss
        post_shock_total_val += post_shock_dollar

        asset_breakdown[ticker] = {
            "initial_weight": round(w, 4),
            "initial_value": round(initial_dollar, 2),
            "shock_pct": round(shock_pct, 4),
            "dollar_impact": round(dollar_loss, 2),
            "post_shock_value": round(post_shock_dollar, 2)
        }

    total_dollar_shortfall = total_val - post_shock_total_val
    portfolio_drawdown_pct = total_dollar_shortfall / total_val

    # Post-shock weights (as prices changed)
    post_shock_weights = {
        t: round(asset_breakdown[t]["post_shock_value"] / max(post_shock_total_val, 1e-4), 4)
        for t in weights
    }

    # Stressed CVaR estimate
    returns_df = get_returns_df()
    base_risk = RiskMetricsEngine(confidence=0.99, horizon_days=10).compute(returns_df, weights, total_val)
    base_cvar_99 = base_risk["var_metrics"]["historical"]["es_cvar_pct"]
    stressed_cvar_99 = min(base_cvar_99 * vol_mult, 0.85)

    # Compute HRP defensive allocation for recommended intervention
    hrp_opt = HRPOptimizer()
    hrp_res = hrp_opt.optimize(returns_df, min_cash_buffer=0.15)
    defensive_weights = hrp_res["weights"]

    # Trigger Circuit Breaker evaluation
    liquidity_ratio = 0.50 if scenario_id_freeze(scenario) else 0.85
    cb_evaluation = GLOBAL_CIRCUIT_BREAKER.evaluate(
        current_cvar_99=stressed_cvar_99,
        current_drawdown=portfolio_drawdown_pct,
        regime_label="Crisis",
        liquidity_ratio=liquidity_ratio,
        hrp_defensive_weights=defensive_weights
    )

    return {
        "scenario_id": request.scenario_id,
        "scenario_name": scenario_name,
        "scenario_description": scenario_desc,
        "volatility_multiplier": vol_mult,
        "pre_shock": {
            "portfolio_value": total_val,
            "cvar_99_10d": base_cvar_99,
            "var_99_10d": base_risk["var_metrics"]["historical"]["var_pct"],
            "weights": weights
        },
        "post_shock": {
            "portfolio_value": round(post_shock_total_val, 2),
            "capital_shortfall_dollar": round(total_dollar_shortfall, 2),
            "portfolio_loss_pct": round(portfolio_drawdown_pct, 4),
            "stressed_cvar_99_10d": round(stressed_cvar_99, 4),
            "post_shock_weights": post_shock_weights
        },
        "asset_breakdown": asset_breakdown,
        "circuit_breaker_result": cb_evaluation,
        "recommended_defensive_weights": defensive_weights
    }

def scenario_id_freeze(scenario: dict) -> bool:
    return bool(scenario.get("liquidity_freeze", False))
