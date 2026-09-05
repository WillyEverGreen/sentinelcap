# SentinelCap — Installation & Setup Guide

This guide walks through setting up and launching SentinelCap locally on Windows, macOS, or Linux.

---

## Prerequisites

- **Python**: 3.11 or 3.12 (`uv` or `pip`)
- **Node.js**: v18+ (tested on Node v20/v24)
- **Git**

---

## Quick Start (Two Terminals)

### Terminal 1: Backend (FastAPI + CVXPY)

```bash
cd backend

# Option A: Using uv (Recommended - installs in seconds)
uv venv .venv --python 3.12
uv pip install --python .venv/Scripts/python.exe -r requirements.txt
.venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Option B: Standard Python venv
python -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000`.
Interactive Swagger API documentation: `http://localhost:8000/docs`.

---

### Terminal 2: Frontend (Next.js 16 + React 19)

```bash
cd frontend

npm install
npm run dev
```
Frontend will be live at `http://localhost:3000`.

---

## Running Automated Tests

Run the full quantitative suite and API integration tests:

```bash
cd backend
pytest -v
```

All 30 unit & integration tests validate:
- Rockafellar-Uryasev CVaR optimization linear programming
- Concentration limits, liquidity buffer floors, and turnover penalties
- Hierarchical Risk Parity (HRP) tree clustering & recursive bisection
- Markowitz Max Sharpe & Minimum Variance
- 4-Method VaR & Expected Shortfall (Historical, Parametric, Cornish-Fisher, Monte Carlo 10k paths)
- Euler Component-VaR attribution
- Markov Regime Switching (Calm vs Crisis) & GARCH volatility forecasting
- FRTB Basel MAR33.12 liquidity horizon scaling
- Kupiec POF Likelihood Ratio & Christoffersen Independence backtests
- 3-Tier Circuit Breaker state transitions & CRO overrides
- War Room Stress Tests (2008 GFC, 2020 COVID, Fed rate shock)
- Asynchronous FastAPI endpoints

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend REST endpoint for Next.js |
