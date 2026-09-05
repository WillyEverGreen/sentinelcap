"""
Risk API Router:
Exposes real-time risk profile, VaR/ES attribution, regime states,
FRTB liquidity scaling, and statistical model validation.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from fastapi import APIRouter
from data.market_data import get_returns_df, load_portfolio_config
from engine.risk_metrics import RiskMetricsEngine
from engine.regime import MarkovRegimeDetector, GARCHVolatilityForecaster
from engine.liquidity import LiquidityHorizonEngine
from engine.breach_detector import BreachDetector
from controls.circuit_breaker import GLOBAL_CIRCUIT_BREAKER

router = APIRouter(prefix="/api/risk", tags=["Risk Management"])

@router.get("/status")
async def get_risk_status():
    returns_df = get_returns_df()
    port_cfg = load_portfolio_config()
    total_val = port_cfg.get("total_value", 10_000_000.0)
    cur_weights = GLOBAL_CIRCUIT_BREAKER.active_weights

    # 1. 4-Method Risk Metrics
    risk_engine = RiskMetricsEngine(confidence=0.99, horizon_days=10)
    risk_summary = risk_engine.compute(returns_df, cur_weights, portfolio_value=total_val)

    # 2. Markov Regime Detection
    regime_detector = MarkovRegimeDetector(n_regimes=2)
    regime_summary = regime_detector.detect(returns_df["SPY"])

    # 3. GARCH Volatility Forecast
    vol_forecaster = GARCHVolatilityForecaster()
    vol_summary = vol_forecaster.forecast(returns_df["SPY"], horizon_days=5)

    # 4. FRTB Liquidity Horizon Adjustment
    cvar_base = risk_summary["var_metrics"]["historical"]["es_cvar_pct"]
    liquidity_engine = LiquidityHorizonEngine(base_horizon=10)
    liquidity_summary = liquidity_engine.compute_liquidity_adjusted_risk(
        base_cvar_10d=cvar_base,
        weights=cur_weights,
        portfolio_value=total_val
    )

    # 5. Kupiec & Christoffersen Model Backtesting
    w_series = pd.Series([cur_weights.get(c, 0.0) for c in returns_df.columns], index=returns_df.columns)
    port_daily_series = returns_df.dot(w_series)
    daily_var_99 = risk_summary["var_metrics"]["historical"]["var_pct"] / np.sqrt(10)
    
    breach_detector = BreachDetector(confidence=0.99)
    backtest_summary = breach_detector.evaluate_breaches(port_daily_series, daily_var_99)

    # 6. Evaluate Safeguard Circuit Breaker
    cvar_99_10d = risk_summary["var_metrics"]["historical"]["es_cvar_pct"]
    cur_drawdown = risk_summary["drawdown"]["current_drawdown_pct"]
    regime_label = regime_summary["regime_label"]
    lcr_ratio = liquidity_summary["liquidity_coverage"]["coverage_ratio"]

    cb_status = GLOBAL_CIRCUIT_BREAKER.evaluate(
        current_cvar_99=cvar_99_10d,
        current_drawdown=cur_drawdown,
        regime_label=regime_label,
        liquidity_ratio=lcr_ratio
    )

    return {
        "portfolio_id": port_cfg["portfolio_id"],
        "total_value": total_val,
        "active_weights": cur_weights,
        "risk_metrics": risk_summary,
        "regime": regime_summary,
        "volatility_forecast": vol_summary,
        "frtb_liquidity": liquidity_summary,
        "backtesting_validation": backtest_summary,
        "circuit_breaker": cb_status
    }