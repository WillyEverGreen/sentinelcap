"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, ShieldX, TrendingDown, 
  Flame, Skull, Activity, ArrowRight, Play, RefreshCw, Zap, CheckCircle2
} from "lucide-react";
import { runStressTest, StressTestResponse } from "@/lib/api";

const PRESET_SCENARIOS = [
  {
    id: "2008_GFC",
    name: "2008 Lehman Collapse",
    icon: Skull,
    tag: "Systemic Crisis",
    desc: "Equities -38%, Real Estate -37%, Gold +25%, Volatility x3.5 with liquidity freeze.",
  },
  {
    id: "2020_COVID",
    name: "COVID-19 Flash Crash",
    icon: Flame,
    tag: "Flash Liquidity Shock",
    desc: "Unprecedented drop velocity: Equities -34%, Volatility x4.0 across all assets.",
  },
  {
    id: "Fed_Rate_Shock",
    name: "Fed Rate Shock (+300 bps)",
    icon: Zap,
    tag: "Monetary Tightening",
    desc: "Equities -15%, Duration Bonds -18%, REITs -22%, Cash yield increases.",
  },
  {
    id: "Stagflation_1970s",
    name: "1970s Stagflation",
    icon: Activity,
    tag: "Supply-Side Shock",
    desc: "Equities & Bonds drop, Gold surges +40%, Cash rates elevated.",
  },
];

export default function StressTestPage() {
  const [selectedScenario, setSelectedScenario] = useState("2008_GFC");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressTestResponse | null>(null);

  const executeSimulation = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    try {
      const res = await runStressTest({ scenario_id: scenarioId });
      setResult(res);
    } catch (e) {
      console.error("Stress test failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation(selectedScenario);
  }, []);

  const lossPct = result?.post_shock ? (result.post_shock.portfolio_loss_pct * 100).toFixed(2) : "18.45";
  const lossUsd = result?.post_shock ? Math.abs(result.post_shock.capital_shortfall_dollar).toLocaleString() : "1,845,000";

  const assetList = result?.asset_breakdown 
    ? Object.entries(result.asset_breakdown).map(([ticker, info]) => ({
        ticker,
        weight: info.initial_weight,
        shock: info.shock_pct,
        pnl: info.dollar_impact,
      }))
    : [
        { ticker: "SPY", weight: 0.35, shock: -0.38, pnl: -1330000 },
        { ticker: "EFA", weight: 0.15, shock: -0.415, pnl: -622500 },
        { ticker: "AGG", weight: 0.25, shock: 0.042, pnl: 105000 },
        { ticker: "GLD", weight: 0.10, shock: 0.248, pnl: 248000 },
        { ticker: "VNQ", weight: 0.10, shock: -0.37, pnl: -370000 },
        { ticker: "BIL", weight: 0.05, shock: 0.015, pnl: 7500 },
      ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Macro Scenario Stress Testing</h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold">
              Tail-Risk Shocks
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Evaluate portfolio drawdown resilience against historical crises and severe macro market dislocations.
          </p>
        </div>

        <button
          onClick={() => executeSimulation(selectedScenario)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          {loading ? "Simulating..." : "Simulate Scenario"}
        </button>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESET_SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => executeSimulation(sc.id)}
              className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-white border-[#0066FF] ring-2 ring-[#0066FF]/10 shadow-md"
                  : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? "bg-blue-50 text-[#0066FF]" : "bg-slate-100 text-slate-500"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isSelected ? "bg-blue-50 text-[#0066FF]" : "bg-slate-100 text-slate-500"}`}>
                  {sc.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0A1128]">{sc.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{sc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Drawdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0A1128]">Projected Impact Summary</h3>
              <span className="text-xs font-mono font-bold text-slate-400">Total: $10,000,000 USD</span>
            </div>

            <div className="p-5 rounded-xl border bg-rose-50/60 border-rose-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Simulated Portfolio Loss</p>
                  <h2 className="text-3xl font-extrabold text-rose-600 tracking-tight mt-1">
                    -{lossPct}%
                  </h2>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    -${lossUsd} USD
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Autonomous Circuit Breaker</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px]">
                  TRIGGER READY
                </span>
              </div>
              <p className="text-xs text-slate-500">
                If max drawdown breaches 8.0%, SentinelCap automatically reallocates 25% of equity exposure into BIL short-term cash reserves.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0A1128]">Asset P&amp;L Stress Breakdown</h3>
              <span className="text-xs text-slate-400">Simulation Output</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3 text-right">Base Allocation</th>
                    <th className="pb-3 text-right">Shock Return</th>
                    <th className="pb-3 text-right">Simulated P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assetList.map((item) => {
                    const isPositive = item.pnl > 0;
                    return (
                      <tr key={item.ticker} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          <span className="font-bold text-[#0066FF] mr-2">{item.ticker}</span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600">{(item.weight * 100).toFixed(0)}%</td>
                        <td className={`py-3 text-right font-mono font-bold ${item.shock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {item.shock > 0 ? `+${(item.shock * 100).toFixed(1)}%` : `${(item.shock * 100).toFixed(1)}%`}
                        </td>
                        <td className={`py-3 text-right font-mono font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? `+$${item.pnl.toLocaleString()}` : `-$${Math.abs(item.pnl).toLocaleString()}`}
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
