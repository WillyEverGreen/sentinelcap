"""
Unit Tests for Autonomous Circuit Breaker Safeguard
"""
import pytest
from controls.circuit_breaker import CircuitBreaker
from controls.audit_log import AuditLogger

class TestCircuitBreaker:
    def test_normal_conditions(self):
        cb = CircuitBreaker(risk_budget_cvar_99=0.06, max_drawdown_limit=0.08)
        res = cb.evaluate(
            current_cvar_99=0.045,
            current_drawdown=0.02,
            regime_label="Calm",
            liquidity_ratio=1.20
        )
        assert res["status"] == "NORMAL"

    def test_amber_alert_on_cvar(self):
        cb = CircuitBreaker(risk_budget_cvar_99=0.06)
        # CVaR 7.5% > 1.2x budget (7.2%)
        res = cb.evaluate(
            current_cvar_99=0.075,
            current_drawdown=0.03,
            regime_label="Calm",
            liquidity_ratio=1.0
        )
        assert res["status"] == "AMBER"

    def test_red_alert_auto_rebalance(self):
        cb = CircuitBreaker(risk_budget_cvar_99=0.06, mode="auto")
        # CVaR 9.5% > 1.5x budget (9.0%)
        defensive = {"SPY": 0.10, "EFA": 0.05, "AGG": 0.40, "GLD": 0.20, "VNQ": 0.05, "BIL": 0.20}
        res = cb.evaluate(
            current_cvar_99=0.095,
            current_drawdown=0.05,
            regime_label="Crisis",
            liquidity_ratio=0.90,
            hrp_defensive_weights=defensive
        )
        assert res["status"] == "RED"
        assert res["recommended_weights"] == defensive
        assert cb.active_weights == defensive

    def test_frozen_critical_drawdown(self):
        cb = CircuitBreaker(critical_drawdown_limit=0.15)
        res = cb.evaluate(
            current_cvar_99=0.12,
            current_drawdown=0.18,  # > 15%
            regime_label="Crisis",
            liquidity_ratio=0.85
        )
        assert res["status"] == "FROZEN"
        assert "EMERGENCY FREEZE" in res["action_taken"]

    def test_manual_mode_no_auto_execution(self):
        cb = CircuitBreaker(risk_budget_cvar_99=0.06, mode="manual")
        original_weights = cb.active_weights.copy()
        defensive = {"SPY": 0.10, "EFA": 0.05, "AGG": 0.40, "GLD": 0.20, "VNQ": 0.05, "BIL": 0.20}
        res = cb.evaluate(
            current_cvar_99=0.10,
            current_drawdown=0.06,
            regime_label="Crisis",
            liquidity_ratio=0.95,
            hrp_defensive_weights=defensive
        )
        assert res["status"] == "RED"
        # Weights should NOT be altered automatically in manual mode
        assert cb.active_weights == original_weights
        assert "MANUAL MODE ALERT" in res["action_taken"]

    def test_manual_override(self):
        cb = CircuitBreaker()
        cb.status = "FROZEN"
        res = cb.manual_override(officer_id="CRO-007", reason="Test reset")
        assert res["status"] == "NORMAL"
        assert cb.status == "NORMAL"

class TestAuditLogger:
    def test_audit_log_recording(self):
        logger = AuditLogger()
        logger.log(
            level="RED",
            mode="auto",
            trigger="Test breach",
            metric_name="cvar",
            metric_value=0.10,
            threshold_value=0.09,
            action_taken="Defensive rebalance"
        )
        entries = logger.get_entries(limit=10)
        assert len(entries) >= 1
        assert entries[0]["level"] == "RED"
