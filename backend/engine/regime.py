"""
Regime Detection & Volatility Forecasting Engine:
- 2-State Markov Switching Regression (Hamilton 1989 via statsmodels)
  State 0: Low Volatility ("Calm / Normal" regime)
  State 1: High Volatility ("Crisis / Shock" regime)
- Conditional Volatility Forecaster (EWMA / GARCH(1,1) forward projections)
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from statsmodels.tsa.regime_switching.markov_regression import MarkovRegression

class MarkovRegimeDetector:
    """
    2-State Markov Regime Switching Model calibrated on portfolio returns.
    Computes smoothed probabilities of Crisis regime and state transition matrix.
    """
    def __init__(self, n_regimes: int = 2):
        self.n_regimes = n_regimes

    def detect(self, returns_series: pd.Series) -> dict:
        """
        Fits Markov Switching model on daily returns.
        Falls back gracefully if numerical convergence fails.
        """
        s = returns_series.dropna()
        n = len(s)
        
        # Default baseline if data too short
        if n < 50:
            return {
                "current_regime": 0,
                "regime_label": "Calm",
                "crisis_probability": 0.05,
                "calm_probability": 0.95,
                "transition_matrix": [[0.98, 0.02], [0.15, 0.85]],
                "model_status": "FALLBACK_INSUFFICIENT_DATA"
            }

        try:
            # Fit Markov switching model with switching variance
            model = MarkovRegression(s, k_regimes=self.n_regimes, trend="c", switching_variance=True)
            res = model.fit(disp=False, maxiter=100)

            # Identify which regime has higher variance (Crisis state)
            variances = [res.params.get(f"sigma2[{i}]", np.var(s)) for i in range(self.n_regimes)]
            crisis_idx = int(np.argmax(variances))
            calm_idx = 1 - crisis_idx

            smoothed_probs = res.smoothed_marginal_probabilities
            last_crisis_prob = float(smoothed_probs.iloc[-1, crisis_idx])
            last_calm_prob = float(smoothed_probs.iloc[-1, calm_idx])

            # Transition Matrix P[i, j]
            p00 = float(res.regime_transition[0, 0, 0]) if hasattr(res, "regime_transition") else 0.96
            p11 = float(res.regime_transition[1, 1, 0]) if hasattr(res, "regime_transition") else 0.82
            p01 = 1.0 - p00
            p10 = 1.0 - p11

            is_crisis = last_crisis_prob > 0.45
            regime_label = "Crisis" if is_crisis else "Calm"
            current_regime = 1 if is_crisis else 0

            return {
                "current_regime": current_regime,
                "regime_label": regime_label,
                "crisis_probability": round(last_crisis_prob, 4),
                "calm_probability": round(last_calm_prob, 4),
                "transition_matrix": [
                    [round(p00, 3), round(p01, 3)],
                    [round(p10, 3), round(p11, 3)]
                ],
                "regime_volatilities": {
                    "calm_annual_vol": round(float(np.sqrt(variances[calm_idx] * 252)), 4),
                    "crisis_annual_vol": round(float(np.sqrt(variances[crisis_idx] * 252)), 4)
                },
                "model_status": "CONVERGED"
            }
        except Exception as e:
            # Robust statistical fallback using rolling volatility percentile
            rolling_vol = s.rolling(window=21).std() * np.sqrt(252)
            cur_vol = float(rolling_vol.iloc[-1])
            p75_vol = float(rolling_vol.quantile(0.75))
            is_crisis = cur_vol > p75_vol
            crisis_prob = float(min(max((cur_vol - rolling_vol.mean()) / (2.0 * rolling_vol.std() + 1e-6) * 0.5 + 0.3, 0.02), 0.98))

            return {
                "current_regime": 1 if is_crisis else 0,
                "regime_label": "Crisis" if is_crisis else "Calm",
                "crisis_probability": round(crisis_prob, 4),
                "calm_probability": round(1.0 - crisis_prob, 4),
                "transition_matrix": [[0.96, 0.04], [0.18, 0.82]],
                "regime_volatilities": {
                    "calm_annual_vol": round(float(rolling_vol.quantile(0.25)), 4),
                    "crisis_annual_vol": round(float(rolling_vol.quantile(0.90)), 4)
                },
                "model_status": "STATISTICAL_FALLBACK"
            }


class GARCHVolatilityForecaster:
    """
    Computes forward-looking volatility forecast using EWMA / GARCH(1,1) proxy.
    Returns 5-day horizon conditional volatility path and volatility regime.
    """
    def __init__(self, omega: float = 1e-6, alpha: float = 0.08, beta: float = 0.90):
        self.omega = omega
        self.alpha = alpha
        self.beta = beta

    def forecast(self, returns_series: pd.Series, horizon_days: int = 5) -> dict:
        s = returns_series.dropna().values
        n = len(s)
        var_t = np.var(s)

        # Iterate GARCH(1,1) variance updates
        for r in s:
            var_t = self.omega + self.alpha * (r ** 2) + self.beta * var_t

        current_daily_vol = np.sqrt(var_t)
        current_annual_vol = current_daily_vol * np.sqrt(252.0)

        # Long-run unconditional variance
        long_run_var = self.omega / max(1.0 - self.alpha - self.beta, 1e-4)

        # Multi-step variance forecast: E[sigma_{t+k}^2] = V_L + (alpha+beta)^k * (sigma_t^2 - V_L)
        forecast_path = []
        persistence = self.alpha + self.beta
        for k in range(1, horizon_days + 1):
            exp_var_k = long_run_var + (persistence ** k) * (var_t - long_run_var)
            forecast_path.append(round(float(np.sqrt(exp_var_k * 252.0)), 4))

        if current_annual_vol < 0.14:
            vol_regime = "Normal"
        elif current_annual_vol < 0.25:
            vol_regime = "Elevated"
        else:
            vol_regime = "Extreme"

        return {
            "current_annual_vol": round(float(current_annual_vol), 4),
            "forecast_vol_path": forecast_path,
            "vol_regime": vol_regime,
            "persistence": round(float(persistence), 4)
        }
