"""
SentinelCap Backend Application Entry Point.
Institutional FinTech Platform for Automated Capital Management & Risk Optimization Controls.
"""
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data.market_data import load_portfolio_config, get_returns_df, get_prices_df
from routers.optimize import router as optimize_router
from routers.risk import router as risk_router
from routers.stress_test import router as stress_test_router
from routers.safeguard import router as safeguard_router
from routers.live_feed import router as live_feed_router

app = FastAPI(
    title="SentinelCap - Asset & Capital Management Engine",
    description="Institutional-grade autonomous capital optimization, tail-risk safeguards, and scenario stress testing.",
    version="1.0.0"
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "service": "SentinelCap Core Engine",
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
