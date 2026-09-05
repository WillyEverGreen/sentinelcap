"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, ShieldX, TrendingDown, 
  Flame, Skull, Activity, ArrowRight, Play, RefreshCw, Zap 
} from "lucide-react";
import { runStressTest, StressTestResponse } from "@/lib/api";

const PRESET_SCENARIOS = [
  {
    id: "2008_GFC",
    name: "2008 Lehman Collapse",
    icon: Skull,
    tag: "Systemic Crisis",
    desc: "Equities -38%, Real Estate -37%, Gold +25%, Volatility x3.5 with liquidity freeze.",
    color: "border-rose-500/40 hover:border-rose-500",
  },
  {
    id: "2020_COVID",
    name: "COVID-19 Flash Crash",
    icon: Flame,
    tag: "Flash Liquidity Shock",
    desc: "Unprecedented velocity of drop: Equities -34%, Volatility x4.0 across all assets.",
    color: "border-amber-500/40 hover:border-amber-500",
  },
  {
    id: "Fed_Rate_Shock",
    name: "Fed Rate Shock (+300 bps)",
    icon: Zap,
    tag: "Monetary Tightening",
    desc: "Equities -15%, Duration Bonds -18%, REITs -22%, Cash yield increases.",
    color: "border-sky-500/40 hover:border-sky-500",
  },
  {
    id: "Stagflation_1970s",
    name: "1970s Stagflation",
    icon: Activity,
    tag: "Supply-Side Shock",
    desc: "Equities & Bonds drop, Gold surges +40%, Cash rates elevated.",
    color: "border-purple-500/40 hover:border-purple-500",
  },
];

export default function StressTestPage() {
  const [selectedScenario, setSelectedScenario] = useState("2008_GFC");
  const [volMultiplier, setVolMultiplier] = useState(3.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressTestResponse | null>(null);

  const executeTest = async (scenarioId = selectedScenario) => {
    setLoading(true);
    try {
      const res = await runStressTest({
        scenario_id: scenarioId,
        custom_vol_multiplier: volMultiplier,
      });
      setResult(res);
    } catch (e) {
      console.error("Stress test failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeTest("2008_GFC");
  }, []);

  const handleSelectScenario = (id: string) => {
    setSelectedScenario(id);
    executeTest(id);
  };

  const cbStatus = result?.circuit_breaker_result?.status || "NORMAL";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Crisis War Room & Hypothetical Scenario Simulator
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Simulate historical systemic crashes, liquidity freezes, and rate shocks to stress test capital solvency.
          </p>
        </div>

        <button
          onClick={() => executeTest()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          TRIGGER STRESS SIMULATION
        </button>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESET_SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`p-4 rounded-xl border bg-zinc-900/60 backdrop-blur-sm cursor-pointer transition-all ${
                isSelected
                  ? "border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-500/10"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-200">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {sc.tag}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-3">{sc.name}</h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{sc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* War Room Results Section */}
      {result && (
        <div className="space-y-6">
          
          {/* Circuit Breaker Emergency Assessment Banner */}
          <div className={`rounded-xl border p-5 backdrop-blur-md ${
            cbStatus === "FROZEN" ? "bg-red-950/60 border-red-600 text-red-100" :
            cbStatus === "RED" ? "bg-rose-950/50 border-rose-500/60 text-rose-100" :
            "bg-amber-950/40 border-amber-500/50 text-amber-100"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-black/40 border border-current/30">
                  {cbStatus === "FROZEN" ? <ShieldX className="w-6 h-6 text-red-400" /> : <ShieldAlert className="w-6 h-6 text-rose-400" />}
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase font-bold opacity-80">
                    SAFEGUARD SYSTEM TELEMETRY STATE
                  </div>
                  <div className="text-xl font-bold tracking-tight mt-0.5">
                    LEVEL {cbStatus === "FROZEN" ? "3 — CIRCUIT BREAKER FROZEN" : "2 — RED ALERT INTERVENTION"}
                  </div>
                  <p className="text-xs mt-1 opacity-90">{result.circuit_breaker_result.trigger_reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/audit-log"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  Inspect Audit Trail <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Capital Shortfall & Loss Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-[10px] text-zinc-400 font-mono">PRE-SHOCK VALUE</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${(result.pre_shock.portfolio_value / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-1">Base capital baseline</div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-[10px] text-zinc-400 font-mono">POST-SHOCK CAPITAL</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                ${(result.post_shock.portfolio_value / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-rose-400 font-mono mt-1">
                Drawdown: -{(result.post_shock.portfolio_loss_pct * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-[10px] text-zinc-400 font-mono">CAPITAL SHORTFALL ($)</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                ${(result.post_shock.capital_shortfall_dollar / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-1">Net equity loss during shock</div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="text-[10px] text-zinc-400 font-mono">STRESSED 99% CVaR (10D)</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {(result.post_shock.stressed_cvar_99_10d * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-1">
                Vol Mult: {result.volatility_multiplier}x
              </div>
            </div>
          </div>

          {/* Detailed Asset Impact Breakdown Table */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Asset-by-Asset Shock Transmission</h3>
                <p className="text-xs text-zinc-400">Granular P&L attribution and flight-to-quality dynamics</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-mono">
                    <th className="pb-2.5 font-medium">ASSET</th>
                    <th className="pb-2.5 font-medium text-right">PRE-VALUE</th>
                    <th className="pb-2.5 font-medium text-right">SHOCK (%)</th>
                    <th className="pb-2.5 font-medium text-right text-rose-400">P&L IMPACT ($)</th>
                    <th className="pb-2.5 font-medium text-right">POST-VALUE</th>
                    <th className="pb-2.5 font-medium text-right text-sky-400">DEFENSIVE WEIGHT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {Object.entries(result.asset_breakdown).map(([ticker, item]) => {
                    const isNeg = item.dollar_impact < 0;
                    const defWeight = result.recommended_defensive_weights?.[ticker] ?? 0;
                    return (
                      <tr key={ticker} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-2.5 font-bold font-mono text-white">{ticker}</td>
                        <td className="py-2.5 font-mono text-right text-zinc-400">
                          ${(item.initial_value / 1000).toFixed(0)}k
                        </td>
                        <td className={`py-2.5 font-mono text-right font-semibold ${item.shock_pct > 0 ? "text-emerald-400" : item.shock_pct < 0 ? "text-rose-400" : "text-zinc-400"}`}>
                          {item.shock_pct > 0 ? "+" : ""}{(item.shock_pct * 100).toFixed(1)}%
                        </td>
                        <td className={`py-2.5 font-mono text-right font-semibold ${isNeg ? "text-rose-400" : "text-emerald-400"}`}>
                          {item.dollar_impact > 0 ? "+" : ""}${(item.dollar_impact / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
                        </td>
                        <td className="py-2.5 font-mono text-right text-zinc-300">
                          ${(item.post_shock_value / 1000).toFixed(0)}k
                        </td>
                        <td className="py-2.5 font-mono text-right font-semibold text-white">
                          {(defWeight * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
