"""
Optimization API Router:
Exposes portfolio optimization strategies with real-world dynamic constraints.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from data.market_data import get_returns_df, load_portfolio_config
from engine.optimizer import MeanCVaROptimizer, HRPOptimizer, MarkowitzOptimizer, generate_efficient_frontier

router = APIRouter(prefix="/api", tags=["Optimization"])

class OptimizeRequest(BaseModel):
    strategy: str = Field(default="mean_cvar", description="mean_cvar | hrp | markowitz_max_sharpe | markowitz_min_variance")
    risk_tolerance: float = Field(default=0.5, ge=0.05, le=1.0)
    max_weight: float = Field(default=0.40, ge=0.15, le=0.90)
    min_cash_buffer: float = Field(default=0.05, ge=0.0, le=0.40)
    turnover_penalty: float = Field(default=0.001, ge=0.0, le=0.05)
    current_weights: dict[str, float] | None = None

@router.post("/optimize")
async def optimize_portfolio(request: OptimizeRequest):
    returns_df = get_returns_df()
    port_cfg = load_portfolio_config()
    total_val = port_cfg.get("total_value", 10_000_000.0)

    cur_weights = request.current_weights
    if not cur_weights:
        cur_weights = {a["ticker"]: a["weight"] for a in port_cfg["assets"]}

    strat = request.strategy.lower()
    
    if strat == "mean_cvar":
        opt = MeanCVaROptimizer(alpha=0.95)
        result = opt.optimize(
            returns_df=returns_df,
            risk_tolerance=request.risk_tolerance,
            max_weight=request.max_weight,
            min_cash_buffer=request.min_cash_buffer,
            current_weights=cur_weights,
            turnover_penalty=request.turnover_penalty
        )
    elif strat == "hrp":
        opt = HRPOptimizer()
        result = opt.optimize(
            returns_df=returns_df,
            min_cash_buffer=request.min_cash_buffer
        )
    elif strat == "markowitz_max_sharpe":
        opt = MarkowitzOptimizer()
        result = opt.optimize(
            returns_df=returns_df,
            target="max_sharpe",
            max_weight=request.max_weight,
            min_cash_buffer=request.min_cash_buffer
        )
    elif strat == "markowitz_min_variance":
        opt = MarkowitzOptimizer()
        result = opt.optimize(
            returns_df=returns_df,
            target="min_variance",
            max_weight=request.max_weight,
            min_cash_buffer=request.min_cash_buffer
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown strategy '{request.strategy}'")

    # Compute Rebalancing Trade List (Delta vs Current)
    opt_weights = result["weights"]
    trade_list = []
    for ticker, new_w in opt_weights.items():
        old_w = cur_weights.get(ticker, 0.0)
        delta_w = round(new_w - old_w, 4)
        dollar_delta = round(delta_w * total_val, 2)
        action = "BUY" if delta_w > 0.0001 else ("SELL" if delta_w < -0.0001 else "HOLD")
        trade_list.append({
            "ticker": ticker,
            "current_weight": round(old_w, 4),
            "optimal_weight": round(new_w, 4),
            "delta_weight": delta_w,
            "dollar_change": dollar_delta,
            "action": action
        })

    # Sort trade list by absolute dollar magnitude
    trade_list.sort(key=lambda x: abs(x["dollar_change"]), reverse=True)

    # Compute Efficient Frontier
    frontier_data = generate_efficient_frontier(returns_df, current_weights=cur_weights, n_points=25)

    return {
        "optimization_result": result,
        "current_weights": cur_weights,
        "trade_list": trade_list,
        "total_turnover_pct": round(0.5 * sum(abs(t["delta_weight"]) for t in trade_list), 4),
        "total_turnover_dollar": round(0.5 * sum(abs(t["dollar_change"]) for t in trade_list), 2),
        "efficient_frontier": frontier_data
    }
