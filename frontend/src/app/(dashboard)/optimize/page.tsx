"use client";

import React, { useState, useEffect } from "react";
import { Sliders, TrendingUp, ShieldCheck, CheckCircle2, Play, RefreshCw, BarChart3, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import EfficientFrontierChart, { FrontierPoint } from "@/components/EfficientFrontierChart";
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
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState<OptimizeRequest["strategy"]>("mean_cvar");
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [maxWeight, setMaxWeight] = useState(0.40);
  const [minCashBuffer, setMinCashBuffer] = useState(0.05);
  const [turnoverPenalty, setTurnoverPenalty] = useState(0.001);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OptimizeResponse | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const expReturn = res ? (res.expected_annual_return * 100).toFixed(2) : (loading ? "..." : "5.86");
  const vol = res ? (res.annual_volatility * 100).toFixed(2) : (loading ? "..." : "3.73");
  const sharpe = res ? res.sharpe_ratio.toFixed(2) : (loading ? "..." : "0.50");
  const cvar = res ? (res.cvar_95_10d * 100).toFixed(2) : (loading ? "..." : "1.51");

  const tradeList = data?.trade_list || SAMPLE_TRADES;

  // Chart data for weights comparison
  const weightComparisonData = tradeList.map((t) => ({
    ticker: t.ticker,
    current: Number((t.current_weight * 100).toFixed(1)),
    optimal: Number((t.optimal_weight * 100).toFixed(1)),
    delta: Number((t.delta_weight * 100).toFixed(1)),
    dollarChange: t.dollar_change,
    action: t.action,
  }));

  // Custom Interactive Weight Tooltip
  const CustomWeightTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload[0]?.value || 0;
      const optimal = payload[1]?.value || 0;
      const delta = (optimal - current).toFixed(1);
      const item = weightComparisonData.find((w) => w.ticker === label);

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl text-xs space-y-2 select-none min-w-[210px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
              {label} Rebalance
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                item?.action === "BUY"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : item?.action === "SELL"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              {item?.action}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                <span className="text-slate-500 font-medium">Current Weight:</span>
              </div>
              <span className="font-mono font-bold text-slate-700">{current}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0066FF]" />
                <span className="text-[#0066FF] font-semibold">Target Weight:</span>
              </div>
              <span className="font-mono font-black text-slate-900">{optimal}%</span>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Weight Shift:</span>
              <span className={`font-mono font-bold ${Number(delta) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {Number(delta) >= 0 ? `+${delta}%` : `${delta}%`}
              </span>
            </div>

            {item?.dollarChange !== undefined && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target Rebalance:</span>
                <span className="font-mono font-bold text-slate-700">
                  ${Math.abs(item.dollarChange).toLocaleString()} USD
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Autonomous Portfolio Optimizer</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[11px] font-bold">
              Mean-CVaR & HRP
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
              <h4 className="text-lg font-extrabold text-emerald-600 mt-1">+{expReturn}%</h4>
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
            riskFreeRate={0.065}
          />

          {/* Interactive Weight Rebalancing Comparison BarChart */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-[15px] font-bold text-[#0A1128] tracking-tight">
                  Asset Allocation Shift: Current vs Optimal Weights
                </h3>
                <p className="text-xs text-slate-400">
                  Interactive target rebalancing breakdown per asset class
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                  <span>Current Weight</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#0066FF]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0066FF]" />
                  <span>Optimal Target</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[220px] min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <BarChart data={weightComparisonData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                    <XAxis dataKey="ticker" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={45}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip content={<CustomWeightTooltip />} cursor={{ fill: "rgba(0, 102, 255, 0.04)" }} />
                    <Bar dataKey="current" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                    <Bar dataKey="optimal" fill="#0066FF" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Weights & Rebalance Trades Table */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-bold text-[#0A1128]">Required Rebalance Orders</h3>
              <span className="text-xs font-mono text-slate-400">6 Recommended Orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3 text-right">Current</th>
                    <th className="pb-3 text-right">Optimal</th>
                    <th className="pb-3 text-right">Delta</th>
                    <th className="pb-3 text-right">Notional Change</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tradeList.map((trade) => {
                    const isBuy = trade.action === "BUY";
                    const isSell = trade.action === "SELL";
                    return (
                      <tr key={trade.ticker} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          <span className="font-bold text-[#0066FF] mr-2">{trade.ticker}</span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600">
                          {(trade.current_weight * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          {(trade.optimal_weight * 100).toFixed(1)}%
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          trade.delta_weight > 0 ? "text-emerald-600" : trade.delta_weight < 0 ? "text-rose-600" : "text-slate-400"
                        }`}>
                          {trade.delta_weight > 0 ? `+${(trade.delta_weight * 100).toFixed(1)}%` : `${(trade.delta_weight * 100).toFixed(1)}%`}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-700">
                          ${Math.abs(trade.dollar_change).toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isBuy
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isSell
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-50 text-slate-500 border border-slate-200"
                          }`}>
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

        </div>
      </div>
    </div>
  );
}
