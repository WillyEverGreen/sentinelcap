"""
Circuit Breaker & Autonomous Safeguard System:
Monitors multi-dimensional risk signals in real-time and autonomously executes
protective rebalancing or liquidity freezes.
"""
from __future__ import annotations
import datetime
from controls.audit_log import GLOBAL_AUDIT_LOG

class CircuitBreaker:
    """
    3-Tier Autonomous Risk Safeguard:
    - NORMAL: All metrics within risk budget.
    - AMBER: CVaR > 1.2x budget OR Regime == Crisis. Issue high-priority alert.
    - RED: CVaR > 1.5x budget OR Drawdown > 8%. Execute auto-rebalance to defensive HRP weights.
    - FROZEN: Drawdown > 15% OR Liquidity < 80%. Halt portfolio, liquidate to 100% T-Bills / Cash.
    """
    def __init__(
        self,
        risk_budget_cvar_99: float = 0.06,
        max_drawdown_limit: float = 0.08,
        critical_drawdown_limit: float = 0.15,
        min_liquidity_ratio: float = 0.80,
        mode: str = "auto"
    ):
        self.risk_budget_cvar = risk_budget_cvar_99
        self.max_drawdown = max_drawdown_limit
        self.critical_drawdown = critical_drawdown_limit
        self.min_liquidity = min_liquidity_ratio
        self.mode = mode  # "auto" | "manual"
        self.status = "NORMAL"  # "NORMAL" | "AMBER" | "RED" | "FROZEN"
        self.last_action = None
        self.last_evaluated = None
        self.active_weights = {
            "SPY": 0.35, "EFA": 0.15, "AGG": 0.25,
            "GLD": 0.10, "VNQ": 0.10, "BIL": 0.05
        }

    def evaluate(
        self,
        current_cvar_99: float,
        current_drawdown: float,
        regime_label: str,
        liquidity_ratio: float,
        hrp_defensive_weights: dict[str, float] | None = None
    ) -> dict:
        self.last_evaluated = datetime.datetime.now(datetime.timezone.utc).isoformat()
        previous_status = self.status

        # Check Tier 3: FROZEN
        if current_drawdown >= self.critical_drawdown or liquidity_ratio < self.min_liquidity:
            new_status = "FROZEN"
            trigger_reason = f"Critical breach: Drawdown {current_drawdown:.1%} >= {self.critical_drawdown:.1%} or Liquidity {liquidity_ratio:.2f} < {self.min_liquidity:.2f}"
            action = "EMERGENCY FREEZE: Liquidate to 100% Cash/T-Bills. Trading halted. CRO override required."
            target_weights = {"SPY": 0.0, "EFA": 0.0, "AGG": 0.0, "GLD": 0.0, "VNQ": 0.0, "BIL": 1.0}
            metric_val = max(current_drawdown, 1.0 - liquidity_ratio)
            thresh_val = self.critical_drawdown

        # Check Tier 2: RED (Auto-Rebalance)
        elif current_cvar_99 >= (self.risk_budget_cvar * 1.5) or current_drawdown >= self.max_drawdown:
            new_status = "RED"
            trigger_reason = f"Severe Risk Breach: 99% CVaR {current_cvar_99:.1%} >= 1.5x budget ({self.risk_budget_cvar*1.5:.1%}) or Drawdown {current_drawdown:.1%} >= {self.max_drawdown:.1%}"
            if self.mode == "auto":
                action = "AUTONOMOUS INTERVENTION: Executed defensive rebalance to HRP minimum-tail-risk weights."
                target_weights = hrp_defensive_weights or {"SPY": 0.10, "EFA": 0.05, "AGG": 0.40, "GLD": 0.20, "VNQ": 0.05, "BIL": 0.20}
                self.active_weights = target_weights
            else:
                action = "MANUAL MODE ALERT: Defensive rebalance RECOMMENDED but awaiting Risk Officer manual sign-off."
                target_weights = hrp_defensive_weights or {"SPY": 0.10, "EFA": 0.05, "AGG": 0.40, "GLD": 0.20, "VNQ": 0.05, "BIL": 0.20}
            metric_val = current_cvar_99
            thresh_val = self.risk_budget_cvar * 1.5

        # Check Tier 1: AMBER
        elif current_cvar_99 >= (self.risk_budget_cvar * 1.2) or regime_label == "Crisis":
            new_status = "AMBER"
            trigger_reason = f"Elevated Risk Warning: CVaR {current_cvar_99:.1%} >= 1.2x budget ({self.risk_budget_cvar*1.2:.1%}) or Regime is {regime_label}"
            action = "WARNING LOGGED: Heightened volatility regime detected. Monitoring intensified."
            target_weights = None
            metric_val = current_cvar_99
            thresh_val = self.risk_budget_cvar * 1.2

        # Otherwise NORMAL
        else:
            new_status = "NORMAL"
            trigger_reason = "All metrics within regulatory tolerance and risk budget"
            action = "NORMAL: Continual automated telemetry"
            target_weights = None
            metric_val = current_cvar_99
            thresh_val = self.risk_budget_cvar

        self.status = new_status
        self.last_action = action

        # If status changed or level != NORMAL, record in audit log
        if new_status != previous_status or new_status != "NORMAL":
            GLOBAL_AUDIT_LOG.log(
                level=new_status,
                mode=self.mode,
                trigger=trigger_reason,
                metric_name="portfolio_risk_composite",
                metric_value=metric_val,
                threshold_value=thresh_val,
                action_taken=action,
                details={
                    "previous_status": previous_status,
                    "cvar_99": round(current_cvar_99, 4),
                    "drawdown": round(current_drawdown, 4),
                    "regime": regime_label,
                    "liquidity_ratio": round(liquidity_ratio, 2),
                    "target_weights": target_weights
                }
            )

        return {
            "status": self.status,
            "mode": self.mode,
            "trigger_reason": trigger_reason,
            "action_taken": action,
            "recommended_weights": target_weights,
            "current_weights": self.active_weights,
            "timestamp": self.last_evaluated,
            "thresholds": {
                "risk_budget_cvar_99": self.risk_budget_cvar,
                "amber_cvar_threshold": round(self.risk_budget_cvar * 1.2, 4),
                "red_cvar_threshold": round(self.risk_budget_cvar * 1.5, 4),
                "max_drawdown_limit": self.max_drawdown,
                "critical_drawdown_limit": self.critical_drawdown,
                "min_liquidity_ratio": self.min_liquidity
            }
        }

    def set_mode(self, new_mode: str) -> dict:
        if new_mode not in ["auto", "manual"]:
            raise ValueError("Mode must be 'auto' or 'manual'")
        self.mode = new_mode
        GLOBAL_AUDIT_LOG.log(
            level=self.status,
            mode=self.mode,
            trigger="Operational Mode Switched",
            metric_name="control_mode",
            metric_value=1.0 if new_mode == "auto" else 0.0,
            threshold_value=1.0,
            action_taken=f"Safeguard mode updated to {new_mode.upper()}",
            details={"mode": new_mode}
        )
        return {"mode": self.mode, "status": self.status}

    def manual_override(self, officer_id: str = "CRO-AUTH-01", reason: str = "Risk officer reset") -> dict:
        old_status = self.status
        self.status = "NORMAL"
        GLOBAL_AUDIT_LOG.log(
            level="NORMAL",
            mode=self.mode,
            trigger=f"CRO Manual Override by {officer_id}: {reason}",
            metric_name="override_authorization",
            metric_value=1.0,
            threshold_value=1.0,
            action_taken="Emergency freeze cleared. Portfolio restored to monitored state.",
            details={"officer_id": officer_id, "previous_status": old_status}
        )
        return {"status": self.status, "message": "Circuit breaker reset successfully."}

# Global Singleton
GLOBAL_CIRCUIT_BREAKER = CircuitBreaker()
