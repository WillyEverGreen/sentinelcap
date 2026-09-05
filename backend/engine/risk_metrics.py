"""
Comprehensive Risk Metrics Engine:
- 4-Method Value-at-Risk (VaR) and Expected Shortfall (ES / CVaR):
  1. Historical Simulation
  2. Parametric (Delta-Normal)
  3. Cornish-Fisher (Higher Moment / Skew-Kurtosis adjusted)
  4. Monte Carlo Simulation (10,000 simulated paths)
- Component-VaR and Percentage Risk Contribution Attribution
- Max Drawdown, Sharpe, Sortino, Calmar ratios
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy.stats import norm, skew, kurtosis

class RiskMetricsEngine:
    def __init__(self, confidence: float = 0.99, horizon_days: int = 10):
        self.confidence = confidence
        self.horizon = horizon_days
        self.z_alpha = float(norm.ppf(confidence))

    def compute(
        self,
        returns_df: pd.DataFrame,
        weights: dict[str, float],
        portfolio_value: float = 10_000_000.0,
        n_mc_sims: int = 10_000
    ) -> dict:
        assets = list(returns_df.columns)
        w_arr = np.array([weights.get(a, 0.0) for a in assets])
        w_arr = w_arr / max(np.sum(w_arr), 1e-6)

        port_daily = returns_df.values @ w_arr
        n_obs = len(port_daily)
        scale = np.sqrt(self.horizon)

        # Basic Moments
        mean_daily = float(np.mean(port_daily))
        vol_daily = float(np.std(port_daily))
        skewness = float(skew(port_daily))
        excess_kurt = float(kurtosis(port_daily))

        # 1. Historical Simulation
        sorted_losses = np.sort(-port_daily)
        cutoff_idx = int(np.floor(self.confidence * n_obs))
        cutoff_idx = min(cutoff_idx, n_obs - 1)
        var_hist_daily = float(sorted_losses[cutoff_idx])
        es_hist_daily = float(np.mean(sorted_losses[cutoff_idx:]))

        var_hist = var_hist_daily * scale
        es_hist = es_hist_daily * scale

        # 2. Parametric (Delta-Normal)
        var_param_daily = float(self.z_alpha * vol_daily - mean_daily)
        # Expected Shortfall for standard normal: phi(z) / (1 - alpha)
        phi_z = norm.pdf(self.z_alpha)
        es_param_daily = float((phi_z / (1.0 - self.confidence)) * vol_daily - mean_daily)

        var_param = var_param_daily * scale
        es_param = es_param_daily * scale

        # 3. Cornish-Fisher (Modified VaR adjusting for fat tails & asymmetry)
        z = self.z_alpha
        z_cf = (
            z
            + (z**2 - 1.0) * (skewness / 6.0)
            + (z**3 - 3.0 * z) * (excess_kurt / 24.0)
            - (2.0 * z**3 - 5.0 * z) * (skewness**2 / 36.0)
        )
        var_cf_daily = float(z_cf * vol_daily - mean_daily)
        var_cf = var_cf_daily * scale

        # 4. Monte Carlo Simulation (10,000 paths)
        cov_matrix = returns_df.cov().values
        try:
            L = np.linalg.cholesky(cov_matrix)
            rand_normals = np.random.standard_normal((n_mc_sims, len(assets)))
            sim_asset_returns = rand_normals @ L.T + returns_df.mean().values
            sim_port_returns = sim_asset_returns @ w_arr
            sim_losses = np.sort(-sim_port_returns)
            mc_cutoff = int(np.floor(self.confidence * n_mc_sims))
            var_mc_daily = float(sim_losses[mc_cutoff])
            es_mc_daily = float(np.mean(sim_losses[mc_cutoff:]))
        except Exception:
            var_mc_daily = var_param_daily
            es_mc_daily = es_param_daily

        var_mc = var_mc_daily * scale
        es_mc = es_mc_daily * scale

        # Component VaR & Risk Attribution
        # Marginal VaR_i = (cov @ w)_i / vol * z
        cov_w = cov_matrix @ w_arr
        m_var = (cov_w / max(vol_daily, 1e-8)) * self.z_alpha * scale
        component_var = w_arr * m_var
        total_var_comp = float(np.sum(component_var))

        risk_contribution = {}
        for i, a in enumerate(assets):
            c_val = float(component_var[i])
            pct_contrib = float(c_val / max(total_var_comp, 1e-6) * 100.0)
            risk_contribution[a] = {
                "weight": round(float(w_arr[i]), 4),
                "component_var_pct": round(c_val, 4),
                "component_var_dollar": round(c_val * portfolio_value, 2),
                "pct_of_total_risk": round(pct_contrib, 2)
            }

        # Drawdown Analytics
        cum_returns = np.cumprod(1.0 + port_daily)
        running_max = np.maximum.accumulate(cum_returns)
        drawdowns = (cum_returns - running_max) / running_max
        max_drawdown = float(np.min(drawdowns))
        current_drawdown = float(drawdowns[-1])

        # Ratios
        exp_ann_ret = mean_daily * 252.0
        ann_vol = vol_daily * np.sqrt(252.0)
        rf = 0.04
        sharpe = (exp_ann_ret - rf) / max(ann_vol, 1e-4)

        neg_returns = port_daily[port_daily < 0]
        downside_vol = float(np.std(neg_returns) * np.sqrt(252.0)) if len(neg_returns) > 0 else ann_vol
        sortino = (exp_ann_ret - rf) / max(downside_vol, 1e-4)

        calmar = exp_ann_ret / max(abs(max_drawdown), 1e-4)

        return {
            "confidence_level": self.confidence,
            "horizon_days": self.horizon,
            "portfolio_value": portfolio_value,
            "var_metrics": {
                "historical": {
                    "var_pct": round(var_hist, 4),
                    "var_dollar": round(var_hist * portfolio_value, 2),
                    "es_cvar_pct": round(es_hist, 4),
                    "es_cvar_dollar": round(es_hist * portfolio_value, 2)
                },
                "parametric": {
                    "var_pct": round(var_param, 4),
                    "var_dollar": round(var_param * portfolio_value, 2),
                    "es_cvar_pct": round(es_param, 4),
                    "es_cvar_dollar": round(es_param * portfolio_value, 2)
                },
                "cornish_fisher": {
                    "var_pct": round(var_cf, 4),
                    "var_dollar": round(var_cf * portfolio_value, 2)
                },
                "monte_carlo": {
                    "var_pct": round(var_mc, 4),
                    "var_dollar": round(var_mc * portfolio_value, 2),
                    "es_cvar_pct": round(es_mc, 4),
                    "es_cvar_dollar": round(es_mc * portfolio_value, 2)
                }
            },
            "moments": {
                "annual_expected_return": round(float(exp_ann_ret), 4),
                "annual_volatility": round(float(ann_vol), 4),
                "skewness": round(skewness, 3),
                "excess_kurtosis": round(excess_kurt, 3)
            },
            "performance_ratios": {
                "sharpe_ratio": round(float(sharpe), 3),
                "sortino_ratio": round(float(sortino), 3),
                "calmar_ratio": round(float(calmar), 3)
            },
            "drawdown": {
                "max_drawdown_pct": round(abs(max_drawdown), 4),
                "current_drawdown_pct": round(abs(current_drawdown), 4),
                "max_drawdown_dollar": round(abs(max_drawdown) * portfolio_value, 2)
            },
            "risk_attribution": risk_contribution
        }
