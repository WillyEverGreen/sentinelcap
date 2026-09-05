"use client";

import React, { useState, useEffect } from "react";
import { Sliders, ArrowRightLeft, TrendingUp, ShieldCheck, CheckCircle2, Play, RefreshCw, Award } from "lucide-react";
import EfficientFrontierChart from "@/components/EfficientFrontierChart";
import { runOptimization, OptimizeRequest, OptimizeResponse, getPortfolio } from "@/lib/api";

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

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-sky-400" />
            Autonomous Capital Rebalancing Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rockafellar-Uryasev CVaR Linear Programming, Hierarchical Risk Parity, and dynamic regulatory constraints.
          </p>
        </div>

        <button
          onClick={executeOptimization}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          RUN REBALANCE OPTIMIZATION
        </button>
      </div>

      {/* Control Panel: Strategies & Constraint Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Form (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm space-y-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Parameters & Constraints</h3>

          {/* Strategy Selector */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Optimization Algorithm</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="mean_cvar">Mean-CVaR (Tail-Risk Linear Program)</option>
              <option value="hrp">Hierarchical Risk Parity (HRP Graph)</option>
              <option value="markowitz_max_sharpe">Markowitz (Max Sharpe Ratio)</option>
              <option value="markowitz_min_variance">Markowitz (Minimum Variance)</option>
            </select>
          </div>

          {/* Slider 1: Risk Tolerance */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Risk Tolerance ($\lambda$)</span>
              <span className="font-mono text-sky-400 font-semibold">{riskTolerance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>0.1 (Conservative)</span>
              <span>1.0 (Aggressive)</span>
            </div>
          </div>

          {/* Slider 2: Max Single Asset Weight */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Max Concentration Cap</span>
              <span className="font-mono text-sky-400 font-semibold">{(maxWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.60"
              step="0.05"
              value={maxWeight}
              onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>20%</span>
              <span>60%</span>
            </div>
          </div>

          {/* Slider 3: Minimum Cash Buffer */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Minimum Cash/T-Bill Reserve</span>
              <span className="font-mono text-sky-400 font-semibold">{(minCashBuffer * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.25"
              step="0.01"
              value={minCashBuffer}
              onChange={(e) => setMinCashBuffer(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>0% (Fully Invested)</span>
              <span>25% (High Liquidity)</span>
            </div>
          </div>

          {/* Slider 4: Turnover Penalty */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Turnover Penalty ($\kappa$)</span>
              <span className="font-mono text-sky-400 font-semibold">{turnoverPenalty.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.01"
              step="0.001"
              value={turnoverPenalty}
              onChange={(e) => setTurnoverPenalty(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
              <span>0.0 (High Churn)</span>
              <span>0.01 (Low Churn)</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 font-mono space-y-1">
              <div className="text-zinc-300 font-semibold">ALGORITHMIC NOTE:</div>
              <p>Turnover dampener penalizes $L_1$ weight distance $|w - w_0|$ to minimize transaction friction and bid-ask slippage.</p>
            </div>
          </div>
        </div>

        {/* Results & Efficient Frontier (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post-Optimization Analytics Strip */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">EXPECTED RETURN</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {(data.optimization_result.expected_annual_return * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">ANNUAL VOLATILITY</div>
                <div className="text-lg font-bold font-mono text-zinc-200">
                  {(data.optimization_result.annual_volatility * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">SHARPE RATIO</div>
                <div className="text-lg font-bold font-mono text-sky-400">
                  {data.optimization_result.sharpe_ratio.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">95% 10D CVaR</div>
                <div className="text-lg font-bold font-mono text-purple-300">
                  {(data.optimization_result.cvar_95_10d * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          )}

          {/* Efficient Frontier Visualizer */}
          {data?.efficient_frontier && (
            <EfficientFrontierChart
              frontierPoints={data.efficient_frontier.frontier_points}
              currentPortfolio={data.efficient_frontier.current_portfolio}
              maxSharpePortfolio={data.efficient_frontier.max_sharpe_portfolio}
              minVariancePortfolio={data.efficient_frontier.min_variance_portfolio}
            />
          )}

          {/* Rebalancing Trade List Ticket */}
          {data?.trade_list && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Institutional Execution Trade List</h3>
                  <p className="text-xs text-zinc-400">Executable orders to transition current balance sheet to optimal weights</p>
                </div>
                <div className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  Turnover: ${(data.total_turnover_dollar / 1000).toFixed(0)}k ({(data.total_turnover_pct * 100).toFixed(1)}%)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-mono">
                      <th className="pb-2 font-medium">TICKER</th>
                      <th className="pb-2 font-medium text-right">CURRENT</th>
                      <th className="pb-2 font-medium text-right text-sky-400">OPTIMAL</th>
                      <th className="pb-2 font-medium text-right">DELTA (%)</th>
                      <th className="pb-2 font-medium text-right">DELTA ($)</th>
                      <th className="pb-2 font-medium text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {data.trade_list.map((trade) => {
                      const isBuy = trade.action === "BUY";
                      const isSell = trade.action === "SELL";
                      return (
                        <tr key={trade.ticker} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-2.5 font-bold font-mono text-white">{trade.ticker}</td>
                          <td className="py-2.5 font-mono text-right text-zinc-400">
                            {(trade.current_weight * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 font-mono text-right font-semibold text-white">
                            {(trade.optimal_weight * 100).toFixed(1)}%
                          </td>
                          <td className={`py-2.5 font-mono text-right font-semibold ${isBuy ? "text-emerald-400" : isSell ? "text-rose-400" : "text-zinc-500"}`}>
                            {trade.delta_weight > 0 ? "+" : ""}{(trade.delta_weight * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 font-mono text-right text-zinc-300">
                            {trade.dollar_change > 0 ? "+" : ""}${(trade.dollar_change / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
                          </td>
                          <td className="py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isBuy
                                  ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                                  : isSell
                                  ? "text-rose-400 bg-rose-950/60 border-rose-500/30"
                                  : "text-zinc-400 bg-zinc-800/60 border-zinc-700/30"
                              }`}
                            >
                              {trade.action}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
