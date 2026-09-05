"use client";

import { useTheme } from "@/components/ThemeProvider";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, ShieldAlert, ShieldCheck, ShieldX, TrendingDown, 
  Flame, Skull, Activity, ArrowRight, Play, RefreshCw, Zap, CheckCircle2, BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from "recharts";
import { runStressTest, getStressScenarios, StressTestResponse } from "@/lib/api";

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
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("2008_GFC");
  const [scenariosList, setScenariosList] = useState<any[]>(PRESET_SCENARIOS);
  const [chartMode, setChartMode] = useState<"pct" | "dollar">("pct");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressTestResponse | null>(null);

  useEffect(() => {
    setMounted(true);
    getStressScenarios()
      .then((res) => {
        if (res && typeof res === "object") {
          const loaded = Object.entries(res)
            .filter(([k]) => k !== "Custom")
            .map(([k, v]: [string, any]) => ({
              id: k,
              name: v.name || k,
              icon: k.includes("2008") ? Skull : k.includes("COVID") ? Flame : k.includes("Rate") ? Zap : Activity,
              tag: v.category || "Macro Stress",
              desc: v.description || "Historical crisis shock scenario.",
            }));
          if (loaded.length > 0) setScenariosList(loaded);
        }
      })
      .catch((err) => console.error("Scenarios load error:", err));
  }, []);

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

  const chartData = assetList.map((item) => ({
    ticker: item.ticker,
    shockPct: Number((item.shock * 100).toFixed(1)),
    pnlUsd: item.pnl,
    pnlFormatted: (item.pnl / 1000).toFixed(0),
    weight: Number((item.weight * 100).toFixed(0)),
    isPositive: item.shock >= 0,
  }));

  // Custom Interactive Tooltip for Stress Shock Chart
  const CustomStressTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = chartData.find((c) => c.ticker === label);
      if (!item) return null;

      return (
        <div className="bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 shadow-xl text-xs space-y-2 select-none min-w-[220px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
              {label} Shock Impact
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                item.isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {item.isPositive ? "HEDGE GAIN" : "DRAWDOWN LOSS"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Portfolio Weight:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.weight}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Scenario Return:</span>
              <span className={`font-mono font-black ${item.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                {item.shockPct > 0 ? `+${item.shockPct}%` : `${item.shockPct}%`}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Estimated P&L Impact:</span>
              <span className={`font-mono font-black text-sm ${item.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                {item.pnlUsd >= 0 ? `+$${item.pnlUsd.toLocaleString()}` : `-$${Math.abs(item.pnlUsd).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] dark:text-white tracking-tight">Macro Scenario Stress Testing</h1>
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
        {scenariosList.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => executeSimulation(sc.id)}
              className={`relative p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-white dark:bg-[#131B2E] border-[#0066FF] dark:border-[#38BDF8] ring-2 ring-[#0066FF]/10 shadow-md"
                  : "bg-white dark:bg-[#131B2E] border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? "bg-blue-50 dark:bg-blue-950/60 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isSelected ? "bg-blue-50 dark:bg-blue-950/60 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  {sc.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0A1128] dark:text-white">{sc.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{sc.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Drawdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0A1128] dark:text-white">Projected Impact Summary</h3>
              <span className="text-xs font-mono font-bold text-slate-400">Base Capital: $10,000,000</span>
            </div>

            <div className="p-5 rounded-xl border bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Simulated Portfolio Loss</p>
                  <h2 className="text-3xl font-extrabold text-rose-600 tracking-tight mt-1">
                    -{lossPct}%
                  </h2>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
                    -${lossUsd} USD
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Autonomous Circuit Breaker</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px]">
                  TRIGGER READY
                </span>
              </div>
              <p className="text-xs text-slate-500">
                If max drawdown breaches 8.0%, SentinelCap automatically reallocates 25% of equity exposure into BIL / TREPS cash reserves.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-[14px] font-bold text-[#0A1128] dark:text-white">Contagion Risk Factors</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Liquidity Freeze</strong>
                  High probability of severe bid-ask spread widening across fixed-income instruments during peak volatility.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Cross-Asset Correlation</strong>
                  Expect traditional diversification to break down as equities and REITs move in tandem.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Margin Call Spirals</strong>
                  Deleveraging by institutional peers could induce secondary shockwaves in large-cap equities.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Asset Shock Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive Bar Chart of Asset P&L & Return Shock */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-[#0A1128] dark:text-white tracking-tight">
                    Asset Shock & Return Attribution
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[10px] font-extrabold">
                    Interactive
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Hover over bars to inspect simulated return and exact capital shortfall
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0E1526] p-0.5 rounded-lg text-xs font-bold border border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => setChartMode("pct")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    chartMode === "pct" ? "bg-white dark:bg-[#1E293B] text-[#0066FF] dark:text-[#38BDF8] shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  % Shock
                </button>
                <button
                  onClick={() => setChartMode("dollar")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    chartMode === "dollar" ? "bg-white dark:bg-[#1E293B] text-[#0066FF] dark:text-[#38BDF8] shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  $ P&L Impact
                </button>
              </div>
            </div>

            <div className="w-full h-[220px] min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height={220} minWidth={100} minHeight={220}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 15, left: 15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#F8FAFC"} vertical={false} />
                    <XAxis dataKey="ticker" stroke={isDark ? "#64748B" : "#94A3B8"} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke={isDark ? "#64748B" : "#94A3B8"}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                      tickFormatter={(val) =>
                        chartMode === "pct" ? `${val}%` : `$${(val / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomStressTooltip />} cursor={{ fill: "rgba(0, 102, 255, 0.04)" }} />
                    <ReferenceLine y={0} stroke={isDark ? "#64748B" : "#94A3B8"} strokeWidth={1} />
                    <Bar
                      dataKey={chartMode === "pct" ? "shockPct" : "pnlUsd"}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      isAnimationActive={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isPositive ? "#10B981" : "#F43F5E"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-[15px] font-bold text-[#0A1128] dark:text-white">Asset P&L Stress Breakdown</h3>
              <span className="text-xs text-slate-400">Simulation Output</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3 text-right">Base Allocation</th>
                    <th className="pb-3 text-right">Shock Return</th>
                    <th className="pb-3 text-right">Simulated P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {assetList.map((item) => {
                    const isPositive = item.pnl >= 0;
                    return (
                      <tr key={item.ticker} className="hover:bg-slate-50 dark:hover:bg-[#1E293B] dark:bg-[#1E293B]/60 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-[#0066FF] mr-2">{item.ticker}</span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600 dark:text-slate-300">{(item.weight * 100).toFixed(0)}%</td>
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