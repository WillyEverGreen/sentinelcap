"""
Unit Tests for Portfolio Optimization Engine
"""
import pytest
import numpy as np
from data.market_data import get_returns_df
from engine.optimizer import MeanCVaROptimizer, HRPOptimizer, MarkowitzOptimizer, generate_efficient_frontier

@pytest.fixture
def returns_df():
    return get_returns_df()

class TestMeanCVaROptimizer:
    def test_weights_sum_to_one(self, returns_df):
        opt = MeanCVaROptimizer(alpha=0.95)
        res = opt.optimize(returns_df, risk_tolerance=0.5, max_weight=0.40, min_cash_buffer=0.05)
        weights = res["weights"]
        total_w = sum(weights.values())
        assert abs(total_w - 1.0) < 1e-3, f"Weights must sum to 1.0, got {total_w}"

    def test_concentration_limit_respected(self, returns_df):
        opt = MeanCVaROptimizer(alpha=0.95)
        max_w = 0.35
        res = opt.optimize(returns_df, risk_tolerance=0.5, max_weight=max_w, min_cash_buffer=0.0)
        weights = res["weights"]
        for ticker, w in weights.items():
            assert w <= max_w + 1e-3, f"{ticker} weight {w} exceeded max concentration {max_w}"

    def test_cash_buffer_respected(self, returns_df):
        opt = MeanCVaROptimizer(alpha=0.95)
        min_cash = 0.15
        res = opt.optimize(returns_df, risk_tolerance=0.5, max_weight=0.50, min_cash_buffer=min_cash)
        assert res["weights"]["BIL"] >= min_cash - 1e-3, f"BIL cash weight must be >= {min_cash}"

    def test_turnover_penalty_reduces_churn(self, returns_df):
        current_w = {"SPY": 0.50, "EFA": 0.10, "AGG": 0.20, "GLD": 0.10, "VNQ": 0.05, "BIL": 0.05}
        opt = MeanCVaROptimizer(alpha=0.95)
        res_no_penalty = opt.optimize(returns_df, current_weights=current_w, turnover_penalty=0.0)
        res_with_penalty = opt.optimize(returns_df, current_weights=current_w, turnover_penalty=0.01)
        assert res_with_penalty["turnover"] <= res_no_penalty["turnover"] + 1e-3

class TestHRPOptimizer:
    def test_hrp_valid_weights(self, returns_df):
        opt = HRPOptimizer()
        res = opt.optimize(returns_df, min_cash_buffer=0.05)
        weights = res["weights"]
        assert abs(sum(weights.values()) - 1.0) < 1e-3
        assert all(w >= 0 for w in weights.values())
        assert res["weights"]["BIL"] >= 0.05 - 1e-3

class TestMarkowitzOptimizer:
    def test_max_sharpe(self, returns_df):
        opt = MarkowitzOptimizer()
        res = opt.optimize(returns_df, target="max_sharpe", max_weight=0.40)
        assert abs(sum(res["weights"].values()) - 1.0) < 1e-3
        assert res["sharpe_ratio"] > 0

    def test_min_variance(self, returns_df):
        opt = MarkowitzOptimizer()
        res = opt.optimize(returns_df, target="min_variance", max_weight=0.40)
        assert abs(sum(res["weights"].values()) - 1.0) < 1e-3

class TestEfficientFrontier:
    def test_frontier_generation(self, returns_df):
        cur_w = {"SPY": 0.35, "EFA": 0.15, "AGG": 0.25, "GLD": 0.10, "VNQ": 0.10, "BIL": 0.05}
        data = generate_efficient_frontier(returns_df, current_weights=cur_w, n_points=15)
        assert len(data["frontier_points"]) > 5
        assert data["current_portfolio"] is not None
        assert "max_sharpe_portfolio" in data
