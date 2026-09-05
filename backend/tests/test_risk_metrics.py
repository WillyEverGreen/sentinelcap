"""
Unit Tests for Risk Metrics Engine & Statistical Models
"""
import pytest
import numpy as np
import pandas as pd
from data.market_data import get_returns_df
from engine.risk_metrics import RiskMetricsEngine
from engine.regime import MarkovRegimeDetector, GARCHVolatilityForecaster
from engine.liquidity import LiquidityHorizonEngine
from engine.breach_detector import BreachDetector

@pytest.fixture
def returns_df():
    return get_returns_df()

@pytest.fixture
def sample_weights():
    return {"SPY": 0.35, "EFA": 0.15, "AGG": 0.25, "GLD": 0.10, "VNQ": 0.10, "BIL": 0.05}

class TestRiskMetrics:
    def test_var_less_than_or_equal_to_es(self, returns_df, sample_weights):
        engine = RiskMetricsEngine(confidence=0.99, horizon_days=10)
        res = engine.compute(returns_df, sample_weights)
        vm = res["var_metrics"]
        assert vm["historical"]["es_cvar_pct"] >= vm["historical"]["var_pct"] - 1e-4
        assert vm["parametric"]["es_cvar_pct"] >= vm["parametric"]["var_pct"] - 1e-4

    def test_risk_attribution_sum(self, returns_df, sample_weights):
        engine = RiskMetricsEngine(confidence=0.99, horizon_days=10)
        res = engine.compute(returns_df, sample_weights)
        pct_sum = sum(item["pct_of_total_risk"] for item in res["risk_attribution"].values())
        assert abs(pct_sum - 100.0) < 1.0

    def test_drawdown_metrics(self, returns_df, sample_weights):
        engine = RiskMetricsEngine(confidence=0.99, horizon_days=10)
        res = engine.compute(returns_df, sample_weights)
        assert res["drawdown"]["max_drawdown_pct"] >= 0.0
        assert res["drawdown"]["current_drawdown_pct"] >= 0.0

class TestRegimeDetector:
    def test_markov_regime_output(self, returns_df):
        detector = MarkovRegimeDetector(n_regimes=2)
        res = detector.detect(returns_df["SPY"])
        assert res["current_regime"] in [0, 1]
        assert res["regime_label"] in ["Calm", "Crisis"]
        assert 0.0 <= res["crisis_probability"] <= 1.0

class TestGARCHForecaster:
    def test_vol_forecast(self, returns_df):
        forecaster = GARCHVolatilityForecaster()
        res = forecaster.forecast(returns_df["SPY"], horizon_days=5)
        assert len(res["forecast_vol_path"]) == 5
        assert res["current_annual_vol"] > 0
        assert res["vol_regime"] in ["Normal", "Elevated", "Extreme"]

class TestLiquidityEngine:
    def test_liquidity_scaling(self, sample_weights):
        engine = LiquidityHorizonEngine(base_horizon=10)
        res = engine.compute_liquidity_adjusted_risk(0.06, sample_weights)
        assert res["liquidity_scaling_multiplier"] >= 1.0
        assert res["liquidity_coverage"]["coverage_ratio"] > 0

class TestBreachDetector:
    def test_kupiec_and_christoffersen(self, returns_df, sample_weights):
        detector = BreachDetector(confidence=0.99)
        port_ret = returns_df.dot(pd.Series(sample_weights))
        res = detector.evaluate_breaches(port_ret, predicted_var_daily=0.02)
        assert "kupiec_test" in res
        assert "christoffersen_test" in res
        assert res["basel_traffic_light"]["zone"] in ["GREEN", "AMBER", "RED"]