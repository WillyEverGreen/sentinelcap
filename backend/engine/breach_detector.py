"""
VaR Backtesting & Breach Detection Engine:
- Kupiec Proportion of Failures (POF) Likelihood Ratio Test (Unconditional Coverage)
- Christoffersen Independence Test (Clustering / Conditional Coverage)
- Basel Committee Traffic Light Framework (Green / Amber / Red supervisory zones)
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy.stats import chi2

class BreachDetector:
    def __init__(self, confidence: float = 0.99):
        self.confidence = confidence
        self.p_expected = 1.0 - confidence

    def evaluate_breaches(
        self,
        actual_returns: pd.Series,
        predicted_var_daily: float | pd.Series
    ) -> dict:
        """
        Runs Kupiec POF test, Christoffersen Independence test, and Basel Traffic Light.
        """
        losses = -actual_returns.values
        n_obs = len(losses)
        
        if isinstance(predicted_var_daily, (int, float)):
            var_thresholds = np.full(n_obs, predicted_var_daily)
        else:
            var_thresholds = predicted_var_daily.values

        # Breach indicators I_t in {0, 1}
        breaches = (losses > var_thresholds).astype(int)
        n_exceptions = int(np.sum(breaches))
        observed_rate = n_exceptions / max(n_obs, 1)

        # 1. Kupiec POF Likelihood Ratio Test
        p = self.p_expected
        p_hat = observed_rate

        if n_exceptions == 0:
            lr_pof = -2.0 * n_obs * np.log(1.0 - p)
        elif n_exceptions == n_obs:
            lr_pof = -2.0 * n_obs * np.log(p)
        else:
            term1 = (1.0 - p) ** (n_obs - n_exceptions) * (p ** n_exceptions)
            term2 = (1.0 - p_hat) ** (n_obs - n_exceptions) * (p_hat ** n_exceptions)
            lr_pof = -2.0 * np.log(max(term1 / max(term2, 1e-12), 1e-12))

        p_value_pof = float(1.0 - chi2.cdf(max(lr_pof, 0.0), df=1))
        kupiec_pass = bool(p_value_pof > 0.05)

        # 2. Christoffersen Independence Test
        # Transition counts: n00, n01, n10, n11
        n00, n01, n10, n11 = 0, 0, 0, 0
        for t in range(1, n_obs):
            prev, curr = breaches[t - 1], breaches[t]
            if prev == 0 and curr == 0:
                n00 += 1
            elif prev == 0 and curr == 1:
                n01 += 1
            elif prev == 1 and curr == 0:
                n10 += 1
            elif prev == 1 and curr == 1:
                n11 += 1

        pi0 = n01 / max(n00 + n01, 1)
        pi1 = n11 / max(n10 + n11, 1)
        pi = (n01 + n11) / max(n_obs - 1, 1)

        # Log-likelihood under independence vs 1st-order Markov
        try:
            L_null = ((1.0 - pi) ** (n00 + n10)) * (pi ** (n01 + n11))
            L_alt = ((1.0 - pi0) ** n00) * (pi0 ** n01) * ((1.0 - pi1) ** n10) * (pi1 ** n11)
            lr_ind = -2.0 * np.log(max(L_null / max(L_alt, 1e-12), 1e-12))
            p_value_ind = float(1.0 - chi2.cdf(max(lr_ind, 0.0), df=1))
        except Exception:
            lr_ind = 0.0
            p_value_ind = 1.0

        christoffersen_pass = bool(p_value_ind > 0.05)

        # 3. Basel Supervisory Traffic Light (for 250 trailing days at 99%)
        # Scale to 250-day equivalent
        scaled_exceptions = int(round(n_exceptions * (250.0 / max(n_obs, 1))))
        if scaled_exceptions <= 4:
            basel_zone = "GREEN"
            multiplier = 3.0
            supervisory_verdict = "Model accepted. Standard capital multiplier applies."
        elif scaled_exceptions <= 9:
            basel_zone = "AMBER"
            multiplier = 3.0 + 0.1 * (scaled_exceptions - 4)
            supervisory_verdict = "Supervisory caution. Capital surcharge imposed. Model monitoring required."
        else:
            basel_zone = "RED"
            multiplier = 4.0
            supervisory_verdict = "Model rejected. Automatic fallback to standardized capital rules required."

        return {
            "total_observations": n_obs,
            "confidence_level": self.confidence,
            "expected_exceptions": round(n_obs * self.p_expected, 1),
            "observed_exceptions": n_exceptions,
            "expected_failure_rate": round(self.p_expected, 4),
            "observed_failure_rate": round(observed_rate, 4),
            "kupiec_test": {
                "test_statistic_lr": round(float(lr_pof), 3),
                "p_value": round(p_value_pof, 4),
                "null_hypothesis": "Observed failure rate equals nominal alpha",
                "is_accepted": kupiec_pass
            },
            "christoffersen_test": {
                "test_statistic_lr": round(float(lr_ind), 3),
                "p_value": round(p_value_ind, 4),
                "null_hypothesis": "Breaches are independently distributed (no clustering)",
                "is_accepted": christoffersen_pass
            },
            "basel_traffic_light": {
                "zone": basel_zone,
                "trailing_250_scaled_exceptions": scaled_exceptions,
                "capital_multiplier": round(multiplier, 2),
                "verdict": supervisory_verdict
            }
        }
