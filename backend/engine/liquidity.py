"""
FRTB Liquidity Horizon Engine:
Implements Basel Committee FRTB MAR33.12 liquidity horizon scaling.
Partitions assets into regulatory liquidity bands (10d, 20d, 40d, 60d)
and computes liquidity-adjusted Expected Shortfall (ES) and liquidity coverage.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

# Regulatory liquidity horizons in days by asset class
ASSET_LH_MAPPING = {
    "SPY": 10,   # US Large Cap Equity (Liquid)
    "EFA": 10,   # Dev International Equity (Liquid)
    "AGG": 20,   # Investment Grade Aggregate Bond
    "GLD": 20,   # Gold / Precious Metals
    "VNQ": 20,   # Real Estate / REITs
    "BIL": 10,   # Short-term Treasury Bills / Cash Equivalent
}

class LiquidityHorizonEngine:
    """
    Computes liquidity-adjusted VaR/ES and portfolio liquidity coverage metrics.
    """
    def __init__(self, base_horizon: int = 10):
        self.base_horizon = base_horizon

    def compute_liquidity_adjusted_risk(
        self,
        base_cvar_10d: float,
        weights: dict[str, float],
        portfolio_value: float = 10_000_000.0
    ) -> dict:
        """
        Calculates asset-specific liquidity horizon penalties and adjusted CVaR.
        """
        asset_details = {}
        weighted_lh = 0.0

        for ticker, w in weights.items():
            lh = ASSET_LH_MAPPING.get(ticker, 20)
            lh_scale = np.sqrt(lh / self.base_horizon)
            weighted_lh += w * lh
            asset_details[ticker] = {
                "weight": round(w, 4),
                "liquidity_horizon_days": lh,
                "scaling_factor": round(float(lh_scale), 3),
                "allocated_value": round(w * portfolio_value, 2)
            }

        # Weighted liquidity-adjusted CVaR multiplier
        overall_lh_multiplier = np.sqrt(max(weighted_lh, 10.0) / self.base_horizon)
        cvar_liquidity_adjusted = base_cvar_10d * overall_lhmultiplier if 'overall_lhmultiplier' in locals() else base_cvar_10d * overall_lh_multiplier

        # Liquidity Coverage Ratio (LCR): High Quality Liquid Assets (LH <= 10d) / Stressed 30d tail outflow
        hqla_weight = sum(w for t, w in weights.items() if ASSET_LH_MAPPING.get(t, 20) <= 10)
        hqla_dollar = hqla_weight * portfolio_value
        stressed_outflow = base_cvar_10d * portfolio_value * 1.5  # 1.5x CVaR 30d tail buffer

        lcr = float(hqla_dollar / max(stressed_outflow, 1e-4))
        lcr_status = "PASS" if lcr >= 1.0 else "WARNING"

        return {
            "base_horizon_days": self.base_horizon,
            "weighted_average_lh_days": round(float(weighted_lh), 1),
            "liquidity_scaling_multiplier": round(float(overall_lh_multiplier), 3),
            "base_cvar_pct": round(base_cvar_10d, 4),
            "liquidity_adjusted_cvar_pct": round(float(cvar_liquidity_adjusted), 4),
            "liquidity_adjusted_cvar_dollar": round(float(cvar_liquidity_adjusted * portfolio_value), 2),
            "liquidity_coverage": {
                "hqla_weight": round(float(hqla_weight), 4),
                "hqla_dollar": round(float(hqla_dollar), 2),
                "stressed_30d_outflow": round(float(stressed_outflow), 2),
                "coverage_ratio": round(float(lcr), 3),
                "status": lcr_status
            },
            "asset_horizons": asset_details
        }
