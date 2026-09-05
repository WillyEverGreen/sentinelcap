"""
SentinelCap Backend Application Entry Point.
Institutional FinTech Platform for Automated Capital Management & Risk Optimization Controls.
"""
from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data.market_data import load_portfolio_config, get_returns_df, get_prices_df
from routers.optimize import router as optimize_router
from routers.risk import router as risk_router
from routers.stress_test import router as stress_test_router
from routers.safeguard import router as safeguard_router
from routers.live_feed import router as live_feed_router

app = FastAPI(
    title="CapitalAI — Asset & Capital Management Engine",
    description="Institutional-grade autonomous capital optimization, tail-risk safeguards, and scenario stress testing.",
    version="1.0.0"
)

# Enable CORS for local Next.js, Vercel deployments, and production domains
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://capitalai.com",
]

env_origins = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = [orig.strip() for orig in env_origins.split(",") if orig.strip()] if env_origins else []
all_origins = list(set(default_origins + allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(optimize_router)
app.include_router(risk_router)
app.include_router(stress_test_router)
app.include_router(safeguard_router)
app.include_router(live_feed_router)

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "CapitalAI Core Engine",
        "version": "1.0.0"
    }

@app.get("/api/portfolio")
async def get_portfolio_overview():
    port_cfg = load_portfolio_config()
    returns_df = get_returns_df()
    prices_df = get_prices_df()

    # Provide recent 90-day price trends for frontend sparklines/charts
    recent_prices = prices_df.tail(90).reset_index()
    recent_prices["date"] = recent_prices["index"].dt.strftime("%Y-%m-%d")
    recent_prices = recent_prices.drop(columns=["index"])

    return {
        "portfolio": port_cfg,
        "recent_prices": recent_prices.to_dict(orient="records"),
        "asset_count": len(port_cfg["assets"]),
        "total_value": port_cfg["total_value"],
        "currency": port_cfg["currency"]
    }

@app.get("/api/trades")
async def get_execution_trades():
    port_cfg = load_portfolio_config()
    prices_df = get_prices_df()
    latest_prices = prices_df.iloc[-1].to_dict()

    trades_data = [
        {
            "order_id": "ORD-99014",
            "ticker": "SPY",
            "asset_name": "S&P 500 ETF Trust",
            "side": "SELL",
            "shares": int(350000 / latest_prices.get("SPY", 564.50)),
            "price": round(latest_prices.get("SPY", 564.50), 2),
            "notional": 350000.0,
            "slippage_bps": 0.82,
            "venue": "Goldman Sachs Prime",
            "time": "14:28:10",
            "status": "FILLED"
        },
        {
            "order_id": "ORD-99013",
            "ticker": "GLD",
            "asset_name": "SPDR Gold Shares",
            "side": "BUY",
            "shares": int(120000 / latest_prices.get("GLD", 282.50)),
            "price": round(latest_prices.get("GLD", 282.50), 2),
            "notional": 120000.0,
            "slippage_bps": 1.10,
            "venue": "IEX Direct",
            "time": "14:26:45",
            "status": "FILLED"
        },
        {
            "order_id": "ORD-99012",
            "ticker": "BIL",
            "asset_name": "1-3M Treasury Bills",
            "side": "BUY",
            "shares": int(45000 / latest_prices.get("BIL", 103.58)),
            "price": round(latest_prices.get("BIL", 103.58), 2),
            "notional": 45000.0,
            "slippage_bps": 0.21,
            "venue": "Fed Liquidity Gateway",
            "time": "13:50:02",
            "status": "FILLED"
        },
        {
            "order_id": "ORD-99011",
            "ticker": "AGG",
            "asset_name": "Core US Aggregate Bond",
            "side": "SELL",
            "shares": int(85500 / latest_prices.get("AGG", 103.61)),
            "price": round(latest_prices.get("AGG", 103.61), 2),
            "notional": 85500.0,
            "slippage_bps": 0.94,
            "venue": "Goldman Sachs Prime",
            "time": "12:15:33",
            "status": "FILLED"
        },
        {
            "order_id": "ORD-99010",
            "ticker": "VNQ",
            "asset_name": "Vanguard Real Estate",
            "side": "BUY",
            "shares": int(37000 / latest_prices.get("VNQ", 57.02)),
            "price": round(latest_prices.get("VNQ", 57.02), 2),
            "notional": 37000.0,
            "slippage_bps": 1.42,
            "venue": "IEX Direct",
            "time": "11:04:19",
            "status": "FILLED"
        },
        {
            "order_id": "ORD-99009",
            "ticker": "EFA",
            "asset_name": "iShares MSCI EAFE",
            "side": "BUY",
            "shares": int(60372 / latest_prices.get("EFA", 90.78)),
            "price": round(latest_prices.get("EFA", 90.78), 2),
            "notional": 60372.0,
            "slippage_bps": 1.05,
            "venue": "Goldman Sachs Prime",
            "time": "10:22:40",
            "status": "FILLED"
        }
    ]

    total_vol = sum(t["notional"] for t in trades_data)
    weighted_slippage = sum(t["notional"] * t["slippage_bps"] for t in trades_data) / total_vol if total_vol else 0.88
    filled_count = sum(1 for t in trades_data if t["status"] == "FILLED")

    intraday_curve = [
        {"hour": "09:30", "volume": 145000, "slippage": 0.65, "orders": 4},
        {"hour": "10:30", "volume": 210000, "slippage": 1.05, "orders": 6},
        {"hour": "11:30", "volume": 85000, "slippage": 0.72, "orders": 3},
        {"hour": "12:30", "volume": 65000, "slippage": 0.41, "orders": 2},
        {"hour": "13:30", "volume": 95000, "slippage": 0.54, "orders": 3},
        {"hour": "14:30", "volume": 380000, "slippage": 1.18, "orders": 9},
        {"hour": "15:30", "volume": 180000, "slippage": 0.89, "orders": 5},
    ]

    return {
        "summary": {
            "total_filled_volume": total_vol,
            "total_orders": len(trades_data),
            "filled_orders": filled_count,
            "fill_rate_pct": round((filled_count / len(trades_data)) * 100, 1),
            "avg_slippage_bps": round(weighted_slippage, 2),
            "slippage_target_bps": 2.5,
            "primary_venue": "Goldman Sachs Prime",
            "currency": "USD"
        },
        "intraday_curve": intraday_curve,
        "trades": trades_data
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
