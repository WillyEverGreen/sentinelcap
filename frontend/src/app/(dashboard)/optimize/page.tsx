"use client";

import React, { useState, useEffect } from "react";
import { Sliders, TrendingUp, ShieldCheck, CheckCircle2, Play, RefreshCw } from "lucide-react";
import EfficientFrontierChart from "@/components/EfficientFrontierChart";
import { runOptimization, OptimizeRequest, OptimizeResponse, TradeItem } from "@/lib/api";

const SAMPLE_TRADES: TradeItem[] = [
  { ticker: "SPY", current_weight: 0.38, optimal_weight: 0.35, delta_weight: -0.03, dollar_change: -300000, action: "SELL" },
  { ticker: "EFA", current_weight: 0.15, optimal_weight: 0.16, delta_weight: 0.01, dollar_change: 100000, action: "BUY" },
  { ticker: "AGG", current_weight: 0.25, optimal_weight: 0.24, delta_weight: -0.01, dollar_change: -100000, action: "SELL" },
  { ticker: "GLD", current_weight: 0.10, optimal_weight: 0.12, delta_weight: 0.02, dollar_change: 200000, action: "BUY" },
  { ticker: "VNQ", current_weight: 0.07, optimal_weight: 0.08, delta_weight: 0.01, dollar_change: 100000, action: "BUY" },
  { ticker: "BIL", current_weight: 0.05, optimal_weight: 0.05, delta_weight: 0.00, dollar_change: 0, action: "HOLD" },
];

export default function OptimizePage() {
  const [strategy, setStrategy] = useState<OptimizeRequest["strategy"]>("mean_cvar");
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [maxWeight, setMaxWeight] = useState(0.40);
  const [minCashBuffer, setMinCashBuffer] = useState(0.05);
  const [turnoverPenalty, setTurnoverPenalty] = useState(0.001);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OptimizeResponse | null>(null);

  const executeOptimization = async () => {
    setLoading(true);
    try {
      const res = await runOptimization({
        strategy,
        risk_tolerance: riskTolerance,
        max_weight: maxWeight,
        min_cash_buffer: minCashBuffer,
        turnover_penalty: turnoverPenalty,
      });
      setData(res);
    } catch (e) {
      console.error("Optimization failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeOptimization();
  }, []);

  const res = data?.optimization_result;
  const expReturn = res ? (res.expected_annual_return * 100).toFixed(2) : "9.84";
  const vol = res ? (res.annual_volatility * 100).toFixed(2) : "11.20";
  const sharpe = res ? res.sharpe_ratio.toFixed(2) : "1.42";
  const cvar = res ? (res.cvar_95_10d * 100).toFixed(2) : "3.42";

  const tradeList = data?.trade_list || SAMPLE_TRADES;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Autonomous Portfolio Optimizer</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[11px] font-bold">
              Mean-CVaR &amp; HRP
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional portfolio weight rebalancing with tail-risk budgets, turnover limits, and liquidity minimums.
          </p>
        </div>

        <button
          onClick={executeOptimization}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          {loading ? "Rebalancing..." : "Run Optimization"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Controls & Parameters (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#0066FF]" />
            <h3>Optimization Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Model / Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as any)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0066FF] font-medium"
              >
                <option value="mean_cvar">Mean-CVaR Optimization (Tail Risk)</option>
                <option value="hrp">Hierarchical Risk Parity (HRP)</option>
                <option value="markowitz_max_sharpe">Markowitz (Max Sharpe Ratio)</option>
                <option value="markowitz_min_variance">Markowitz (Minimum Variance)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Risk Tolerance (λ)</span>
                <span className="font-mono text-slate-900 font-bold">{(riskTolerance * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Max Single-Asset Weight</span>
                <span className="font-mono text-slate-900 font-bold">{(maxWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.90"
                step="0.05"
                value={maxWeight}
                onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Minimum Cash Reserve (BIL)</span>
                <span className="font-mono text-slate-900 font-bold">{(minCashBuffer * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.30"
                step="0.02"
                value={minCashBuffer}
                onChange={(e) => setMinCashBuffer(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Turnover Friction Penalty</span>
                <span className="font-mono text-slate-900 font-bold">{(turnoverPenalty * 10000).toFixed(0)} bps</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.01"
                step="0.0005"
                value={turnoverPenalty}
                onChange={(e) => setTurnoverPenalty(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-[#0066FF] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Enforced Constraints
            </p>
            <p>• Tail Risk CVaR α=0.95 10-day horizon</p>
            <p>• Cash liquidity floor ≥ {(minCashBuffer * 100).toFixed(0)}%</p>
            <p>• No single asset concentration &gt; {(maxWeight * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Right Area: Results & Efficient Frontier (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Optimal Exp. Return</p>
              <h4 className="text-lg font-extrabold text-emerald-600 mt-1">{expReturn}%</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Annualized p.a.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Optimal Volatility</p>
              <h4 className="text-lg font-extrabold text-[#0066FF] mt-1">{vol}%</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Standard Dev</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Sharpe Ratio</p>
              <h4 className="text-lg font-extrabold text-[#0A1128] mt-1">{sharpe}</h4>
              <p className="text-[10.5px] text-emerald-600 font-bold mt-0.5">Risk-adjusted</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Tail Risk (CVaR 95%)</p>
              <h4 className="text-lg font-extrabold text-amber-600 mt-1">{cvar}%</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5">10-Day Drawdown</p>
            </div>
          </div>

          {/* Efficient Frontier Chart */}
          <EfficientFrontierChart
            frontierPoints={data?.efficient_frontier?.frontier_points || []}
            currentPortfolio={data?.efficient_frontier?.current_portfolio || null}
            maxSharpePortfolio={data?.efficient_frontier?.max_sharpe_portfolio || null}
            minVariancePortfolio={data?.efficient_frontier?.min_variance_portfolio || null}
          />

          {/* Weights & Rebalance Trades Table */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0A1128]">Asset Allocation &amp; Rebalance Orders</h3>
              <span className="text-xs text-slate-400">Total Capital: $10,000,000 USD</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3 text-right">Current Weight</th>
                    <th className="pb-3 text-right">Optimal Weight</th>
                    <th className="pb-3 text-right">Delta</th>
                    <th className="pb-3 text-right">Rebalance Notional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tradeList.map((w: TradeItem) => {
                    const isPositive = w.delta_weight > 0;
                    return (
                      <tr key={w.ticker} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          <span className="font-bold text-[#0066FF] mr-2">{w.ticker}</span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600">{(w.current_weight * 100).toFixed(1)}%</td>
                        <td className="py-3 text-right font-mono font-bold text-[#0066FF]">{(w.optimal_weight * 100).toFixed(1)}%</td>
                        <td className={`py-3 text-right font-mono font-bold ${isPositive ? "text-emerald-600" : w.delta_weight < 0 ? "text-rose-500" : "text-slate-400"}`}>
                          {w.delta_weight > 0 ? `+${(w.delta_weight * 100).toFixed(1)}%` : `${(w.delta_weight * 100).toFixed(1)}%`}
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${isPositive ? "text-emerald-600" : w.dollar_change < 0 ? "text-slate-800" : "text-slate-400"}`}>
                          {w.dollar_change > 0 ? `+$${Math.abs(w.dollar_change).toLocaleString()}` : w.dollar_change < 0 ? `-$${Math.abs(w.dollar_change).toLocaleString()}` : "$0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
