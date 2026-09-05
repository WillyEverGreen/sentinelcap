"""
Market Data Engine: Generates institutional-quality historical returns,
prices, and factor covariance matrices for multi-asset portfolios.
Provides deterministic data for offline resilience and reproducibility.
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent

def load_portfolio_config() -> dict:
    config_file = DATA_DIR / "sample_portfolio.json"
    with open(config_file, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def load_scenarios() -> dict:
    scenarios_file = DATA_DIR / "scenarios.json"
    with open(scenarios_file, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def generate_historical_data(n_days: int = 504, seed: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates realistic daily returns and price series for:
    SPY, EFA, AGG, GLD, VNQ, BIL.
    Includes a realistic regime shift (crisis tail event) in the series.
    """
    np.random.seed(seed)
    tickers = ["SPY", "EFA", "AGG", "GLD", "VNQ", "BIL"]
    
    annual_returns = np.array([0.105, 0.082, 0.048, 0.075, 0.078, 0.045])
    daily_returns_mean = annual_returns / 252.0
    
    annual_vols = np.array([0.165, 0.175, 0.065, 0.145, 0.190, 0.008])
    daily_vols = annual_vols / np.sqrt(252.0)
    
    corr = np.array([
        [ 1.00,  0.82, -0.15,  0.08,  0.72,  0.02],
        [ 0.82,  1.00, -0.08,  0.15,  0.65,  0.01],
        [-0.15, -0.08,  1.00,  0.22,  0.18,  0.12],
        [ 0.08,  0.15,  0.22,  1.00,  0.12,  0.05],
        [ 0.72,  0.65,  0.18,  0.12,  1.00,  0.01],
        [ 0.02,  0.01,  0.12,  0.05,  0.01,  1.00],
    ])
    
    diag_vols = np.diag(daily_vols)
    daily_cov = diag_vols @ corr @ diag_vols
    L = np.linalg.cholesky(daily_cov)
    
    raw_normals = np.random.standard_normal((n_days, len(tickers)))
    correlated_returns = raw_normals @ L.T + daily_returns_mean
    
    shock_start = 350
    shock_len = 25
    shock_multiplier = np.array([-0.018, -0.016, 0.003, 0.004, -0.020, 0.0002])
    correlated_returns[shock_start:shock_start + shock_len] += shock_multiplier + np.random.normal(0, daily_vols * 2.2, (shock_len, len(tickers)))
    
    last_bday = pd.Timestamp.now().floor('D')
    while last_bday.weekday() >= 5:
        last_bday -= pd.Timedelta(days=1)
    dates = pd.date_range(end=last_bday, periods=n_days, freq="B")
    returns_df = pd.DataFrame(correlated_returns, index=dates, columns=tickers)
    
    base_prices = {"SPY": 510.0, "EFA": 78.0, "AGG": 98.0, "GLD": 215.0, "VNQ": 88.0, "BIL": 91.5}
    prices_dict = {}
    for t in tickers:
        p_series = [base_prices[t]]
        for r in returns_df[t]:
            p_series.append(p_series[-1] * (1.0 + r))
        prices_dict[t] = p_series[1:]
        
    prices_df = pd.DataFrame(prices_dict, index=dates)
    return returns_df, prices_df

_RETURNS_DF, _PRICES_DF = generate_historical_data()

def get_returns_df() -> pd.DataFrame:
    return _RETURNS_DF.copy()

def get_prices_df() -> pd.DataFrame:
    return _PRICES_DF.copy()