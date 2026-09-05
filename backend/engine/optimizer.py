"""
Portfolio Optimization Engine:
- Mean-CVaR Optimization (Rockafellar & Uryasev 2000 via CVXPY)
- Hierarchical Risk Parity (HRP - Lopez de Prado via SciPy)
- Classical Mean-Variance Markowitz (Max Sharpe & Min Variance)
- Efficient Frontier Generator with dynamic constraint enforcement
"""
from __future__ import annotations
import numpy as np
import pandas as pd
import cvxpy as cp
import scipy.cluster.hierarchy as sch
from scipy.spatial.distance import squareform
from scipy.optimize import minimize

class MeanCVaROptimizer:
    def __init__(self, alpha: float = 0.95):
        self.alpha = alpha

    def optimize(
        self,
        returns_df: pd.DataFrame,
        risk_tolerance: float = 0.5,
        max_weight: float = 0.40,
        min_cash_buffer: float = 0.05,
        current_weights: dict[str, float] | None = None,
        turnover_penalty: float = 0.001,
        cash_ticker: str = "BIL"
    ) -> dict:
        assets = list(returns_df.columns)
        n_assets = len(assets)
        returns = returns_df.values
        n_samples = returns.shape[0]

        mean_daily_returns = returns_df.mean().values
        annual_factor = 252.0

        w = cp.Variable(n_assets)
        gamma = cp.Variable()
        z = cp.Variable(n_samples)

        cvar = gamma + (1.0 / ((1.0 - self.alpha) * n_samples)) * cp.sum(z)
        expected_daily_return = mean_daily_returns @ w
        ret_weight = (risk_tolerance ** 1.5) * 8.0
        objective_expr = cvar - ret_weight * expected_daily_return

        if current_weights is not None and turnover_penalty > 0:
            w0 = np.array([current_weights.get(a, 0.0) for a in assets])
            turnover = cp.norm1(w - w0)
            objective_expr += turnover_penalty * turnover

        constraints = [
            z >= 0,
            z >= -returns @ w - gamma,
            cp.sum(w) == 1.0,
            w >= 0.0,
            w <= max_weight
        ]

        if cash_ticker in assets and min_cash_buffer > 0:
            cash_idx = assets.index(cash_ticker)
            constraints.append(w[cash_idx] >= min_cash_buffer)

        problem = cp.Problem(cp.Minimize(objective_expr), constraints)
        
        try:
            problem.solve(solver=cp.CLARABEL)
            if problem.status not in [cp.OPTIMAL, cp.OPTIMAL_INACCURATE] or w.value is None:
                problem.solve(solver=cp.SCS)
        except Exception:
            problem.solve(solver=cp.SCS)

        if w.value is None:
            weights_arr = np.ones(n_assets) / n_assets
        else:
            weights_arr = np.maximum(w.value, 0.0)
            weights_arr /= weights_arr.sum()

        weights_dict = {assets[i]: float(round(weights_arr[i], 4)) for i in range(n_assets)}
        
        port_daily_ret = returns @ weights_arr
        exp_annual_ret = float(np.mean(port_daily_ret) * annual_factor)
        annual_vol = float(np.std(port_daily_ret) * np.sqrt(annual_factor))
        sharpe = float((exp_annual_ret - 0.04) / max(annual_vol, 1e-4))

        sorted_losses = np.sort(-port_daily_ret)
        var_idx = int(self.alpha * n_samples)
        hist_var_daily = float(sorted_losses[var_idx])
        hist_cvar_daily = float(np.mean(sorted_losses[var_idx:]))

        cvar_10d = hist_cvar_daily * np.sqrt(10)
        var_10d = hist_var_daily * np.sqrt(10)

        turnover_val = 0.0
        if current_weights:
            turnover_val = float(0.5 * sum(abs(weights_dict.get(a, 0.0) - current_weights.get(a, 0.0)) for a in assets))

        return {
            "strategy": "mean_cvar",
            "weights": weights_dict,
            "expected_annual_return": round(exp_annual_ret, 4),
            "annual_volatility": round(annual_vol, 4),
            "sharpe_ratio": round(sharpe, 3),
            "cvar_95_daily": round(hist_cvar_daily, 4),
            "cvar_95_10d": round(cvar_10d, 4),
            "var_95_10d": round(var_10d, 4),
            "turnover": round(turnover_val, 4),
            "status": "OPTIMAL" if problem.status in [cp.OPTIMAL, cp.OPTIMAL_INACCURATE] else "APPROXIMATE"
        }

class HRPOptimizer:
    def __init__(self, method: str = "single", metric: str = "euclidean"):
        self.method = method
        self.metric = metric

    def optimize(
        self,
        returns_df: pd.DataFrame,
        min_cash_buffer: float = 0.05,
        cash_ticker: str = "BIL"
    ) -> dict:
        cov = returns_df.cov()
        corr = returns_df.corr()
        assets = list(returns_df.columns)

        dist = np.sqrt(np.clip((1.0 - corr.values) / 2.0, 0, 1))
        # Ensure zero diagonal
        np.fill_diagonal(dist, 0.0)
        condensed_dist = squareform(dist, checks=False)
        link = sch.linkage(condensed_dist, method=self.method)

        sort_ix = self._get_quasi_diag(link)
        sorted_assets = [assets[i] for i in sort_ix]

        raw_weights = self._recursive_bisection(cov, sorted_assets)

        if cash_ticker in raw_weights and min_cash_buffer > 0:
            if raw_weights[cash_ticker] < min_cash_buffer:
                deficit = min_cash_buffer - raw_weights[cash_ticker]
                other_sum = sum(w for a, w in raw_weights.items() if a != cash_ticker)
                for a in raw_weights:
                    if a != cash_ticker and other_sum > 0:
                        raw_weights[a] -= deficit * (raw_weights[a] / other_sum)
                raw_weights[cash_ticker] = min_cash_buffer

        total_w = sum(raw_weights.values())
        weights_dict = {a: float(round(w / total_w, 4)) for a, w in raw_weights.items()}

        weights_arr = np.array([weights_dict[a] for a in assets])
        port_daily_ret = returns_df.values @ weights_arr
        annual_factor = 252.0
        exp_annual_ret = float(np.mean(port_daily_ret) * annual_factor)
        annual_vol = float(np.std(port_daily_ret) * np.sqrt(annual_factor))
        sharpe = float((exp_annual_ret - 0.04) / max(annual_vol, 1e-4))

        sorted_losses = np.sort(-port_daily_ret)
        cvar_idx = int(0.95 * len(sorted_losses))
        cvar_10d = float(np.mean(sorted_losses[cvar_idx:])) * np.sqrt(10)
        var_10d = float(sorted_losses[cvar_idx]) * np.sqrt(10)

        return {
            "strategy": "hrp",
            "weights": weights_dict,
            "expected_annual_return": round(exp_annual_ret, 4),
            "annual_volatility": round(annual_vol, 4),
            "sharpe_ratio": round(sharpe, 3),
            "cvar_95_10d": round(cvar_10d, 4),
            "var_95_10d": round(var_10d, 4),
            "status": "OPTIMAL"
        }

    @staticmethod
    def _get_quasi_diag(link):
        link = link.astype(int)
        sort_ix = pd.Series([link[-1, 0], link[-1, 1]])
        num_items = link[-1, 3]

        while sort_ix.max() >= num_items:
            sort_ix.index = range(0, sort_ix.shape[0] * 2, 2)
            df0 = sort_ix[sort_ix >= num_items]
            i = df0.index
            j = df0.values - num_items
            sort_ix[i] = link[j, 0]
            df0 = pd.Series(link[j, 1], index=i + 1)
            sort_ix = pd.concat([sort_ix, df0]).sort_index()
            sort_ix.index = range(sort_ix.shape[0])
        return sort_ix.tolist()

    def _recursive_bisection(self, cov: pd.DataFrame, sorted_assets: list[str]) -> dict[str, float]:
        w = pd.Series(1.0, index=sorted_assets)
        clusters = [sorted_assets]

        while len(clusters) > 0:
            clusters = [c[j:k] for c in clusters for j, k in ((0, len(c) // 2), (len(c) // 2, len(c))) if len(c) > 1]
            for i in range(0, len(clusters), 2):
                c0 = clusters[i]
                c1 = clusters[i + 1]
                v0 = self._cluster_variance(cov, c0)
                v1 = self._cluster_variance(cov, c1)
                alpha = 1.0 - v0 / (v0 + v1 + 1e-8)
                w[c0] *= alpha
                w[c1] *= (1.0 - alpha)
        return w.to_dict()

    @staticmethod
    def _cluster_variance(cov: pd.DataFrame, items: list[str]) -> float:
        sub_cov = cov.loc[items, items].values
        diag_inv = 1.0 / np.clip(np.diag(sub_cov), 1e-8, None)
        ivp = (diag_inv / np.sum(diag_inv)).reshape(-1, 1)
        res = ivp.T @ sub_cov @ ivp
        return float(np.squeeze(res))

class MarkowitzOptimizer:
    def __init__(self, risk_free_rate: float = 0.04):
        self.rf = risk_free_rate

    def optimize(
        self,
        returns_df: pd.DataFrame,
        target: str = "max_sharpe",
        max_weight: float = 0.40,
        min_cash_buffer: float = 0.05,
        cash_ticker: str = "BIL"
    ) -> dict:
        assets = list(returns_df.columns)
        n = len(assets)
        mu = returns_df.mean().values * 252.0
        cov = returns_df.cov().values * 252.0

        def port_stats(w):
            ret = np.sum(mu * w)
            vol = np.sqrt(np.maximum(w.T @ cov @ w, 1e-8))
            sharpe = (ret - self.rf) / vol
            return ret, vol, sharpe

        bounds = [(0.0, max_weight) for _ in range(n)]
        if cash_ticker in assets and min_cash_buffer > 0:
            cash_idx = assets.index(cash_ticker)
            bounds[cash_idx] = (min_cash_buffer, max_weight)

        constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]
        init_w = np.ones(n) / n

        if target == "max_sharpe":
            obj = lambda w: -port_stats(w)[2]
        else:
            obj = lambda w: port_stats(w)[1]

        res = minimize(obj, init_w, method="SLSQP", bounds=bounds, constraints=constraints)

        if not res.success:
            w_opt = init_w
        else:
            w_opt = res.x / np.sum(res.x)

        weights_dict = {assets[i]: float(round(w_opt[i], 4)) for i in range(n)}
        ret, vol, sharpe = port_stats(w_opt)

        port_daily = returns_df.values @ w_opt
        sorted_losses = np.sort(-port_daily)
        cvar_idx = int(0.95 * len(sorted_losses))
        cvar_10d = float(np.mean(sorted_losses[cvar_idx:])) * np.sqrt(10)
        var_10d = float(sorted_losses[cvar_idx]) * np.sqrt(10)

        return {
            "strategy": f"markowitz_{target}",
            "weights": weights_dict,
            "expected_annual_return": round(float(ret), 4),
            "annual_volatility": round(float(vol), 4),
            "sharpe_ratio": round(float(sharpe), 3),
            "cvar_95_10d": round(cvar_10d, 4),
            "var_95_10d": round(var_10d, 4),
            "status": "OPTIMAL" if res.success else "APPROXIMATE"
        }

def generate_efficient_frontier(
    returns_df: pd.DataFrame,
    current_weights: dict[str, float] | None = None,
    n_points: int = 25
) -> dict:
    assets = list(returns_df.columns)
    n = len(assets)
    mu = returns_df.mean().values * 252.0
    cov = returns_df.cov().values * 252.0

    min_var_opt = MarkowitzOptimizer().optimize(returns_df, target="min_variance")
    max_sharpe_opt = MarkowitzOptimizer().optimize(returns_df, target="max_sharpe")

    min_ret = min_var_opt["expected_annual_return"]
    max_ret = max(mu) * 0.95
    target_returns = np.linspace(min_ret, max_ret, n_points)

    bounds = [(0.0, 0.50) for _ in range(n)]

    def _solve_point(r_target):
        cons = [
            {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
            {"type": "eq", "fun": lambda w, rt=r_target: np.sum(mu * w) - rt}
        ]
        res = minimize(lambda w: w.T @ cov @ w, np.ones(n)/n, method="SLSQP", bounds=bounds, constraints=cons)
        if res.success:
            vol = float(np.sqrt(max(res.x.T @ cov @ res.x, 1e-8)))
            port_daily = returns_df.values @ (res.x / np.sum(res.x))
            cvar = float(np.mean(np.sort(-port_daily)[int(0.95 * len(port_daily)):]) * np.sqrt(10))
            return {
                "expected_return": round(float(r_target), 4),
                "volatility": round(vol, 4),
                "sharpe": round((float(r_target) - 0.04) / max(vol, 1e-4), 3),
                "cvar_95_10d": round(cvar, 4)
            }
        return None

    from concurrent.futures import ThreadPoolExecutor
    curve_points = []
    with ThreadPoolExecutor() as executor:
        for r in executor.map(_solve_point, target_returns):
            if r is not None:
                curve_points.append(r)

    current_point = None
    if current_weights:
        w_cur = np.array([current_weights.get(a, 0.0) for a in assets])
        w_cur = w_cur / max(np.sum(w_cur), 1e-6)
        cur_ret = float(np.sum(mu * w_cur))
        cur_vol = float(np.sqrt(max(w_cur.T @ cov @ w_cur, 1e-8)))
        cur_daily = returns_df.values @ w_cur
        cur_cvar = float(np.mean(np.sort(-cur_daily)[int(0.95 * len(cur_daily)):]) * np.sqrt(10))
        current_point = {
            "expected_return": round(cur_ret, 4),
            "volatility": round(cur_vol, 4),
            "sharpe": round((cur_ret - 0.04) / max(cur_vol, 1e-4), 3),
            "cvar_95_10d": round(cur_cvar, 4)
        }

    return {
        "frontier_points": curve_points,
        "current_portfolio": current_point,
        "max_sharpe_portfolio": {
            "expected_return": max_sharpe_opt["expected_annual_return"],
            "volatility": max_sharpe_opt["annual_volatility"],
            "sharpe": max_sharpe_opt["sharpe_ratio"],
            "cvar_95_10d": max_sharpe_opt["cvar_95_10d"],
            "weights": max_sharpe_opt["weights"]
        },
        "min_variance_portfolio": {
            "expected_return": min_var_opt["expected_annual_return"],
            "volatility": min_var_opt["annual_volatility"],
            "sharpe": min_var_opt["sharpe_ratio"],
            "cvar_95_10d": min_var_opt["cvar_95_10d"],
            "weights": min_var_opt["weights"]
        }
    }