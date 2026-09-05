"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  TrendingUp,
  ShieldAlert,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Plus,
  Wifi,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// ─── Chart Data aligned with SentinelCap Portfolio ($10M AUM) ──────
const performanceData = [
  { month: "Jan", portfolio: 10000, benchmark: 10000 },
  { month: "Feb", portfolio: 10180, benchmark: 9920 },
  { month: "Mar", portfolio: 10250, benchmark: 9850 },
  { month: "Apr", portfolio: 10420, benchmark: 10050 },
  { month: "May", portfolio: 10390, benchmark: 10120 },
  { month: "Jun", portfolio: 10610, benchmark: 10240 },
  { month: "Jul", portfolio: 10540, benchmark: 10180 },
  { month: "Aug", portfolio: 10820, benchmark: 10390 },
  { month: "Sep", portfolio: 10760, benchmark: 10290 },
  { month: "Oct", portfolio: 11050, benchmark: 10480 },
  { month: "Nov", portfolio: 10980, benchmark: 10410 },
  { month: "Dec", portfolio: 11250, benchmark: 10620 },
];

const activityData = [
  { day: "Mon", algo: 42, manual: 12 },
  { day: "Tue", algo: 58, manual: 18 },
  { day: "Wed", algo: 65, manual: 15 },
  { day: "Thu", algo: 82, manual: 24 },
  { day: "Fri", algo: 94, manual: 28 },
  { day: "Sat", algo: 18, manual: 4 },
  { day: "Sun", algo: 12, manual: 2 },
];

// Custom Tooltip for Line Chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0066FF] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/30">
        ${(payload[0].value / 1000).toFixed(2)}M USD
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("YTD (2026)");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6 select-none font-sans">

      {/* ─── 1. TOP 4 METRIC KPI CARDS ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total AUM (Active Card with subtle blue aura) */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,102,255,0.06)] hover:shadow-md transition-all group">
          <div className="pointer-events-none absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">Total Capital (AUM)</p>
              <h3 className="text-[26px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                $10,000,000 <span className="text-[14px] font-semibold text-slate-400">USD</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.5%</span>
            <span className="text-slate-400 font-normal">YTD Alpha vs S&amp;P 500</span>
          </div>
        </div>

        {/* Card 2: Net Expected Yield */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">Expected Annual Return</p>
              <h3 className="text-[26px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                +9.84% <span className="text-[14px] font-semibold text-slate-400">p.a.</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1.8%</span>
            <span className="text-slate-400 font-normal">Sharpe Ratio: 1.42</span>
          </div>
        </div>

        {/* Card 3: Tail Risk / VaR (99%) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">Conditional VaR (99%)</p>
              <h3 className="text-[26px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                3.42% <span className="text-[14px] font-semibold text-slate-400">max</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-0.8%</span>
            <span className="text-slate-400 font-normal">Below 6.0% risk budget</span>
          </div>
        </div>

        {/* Card 4: Liquidity Buffer */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">Cash &amp; Liquidity Buffer</p>
              <h3 className="text-[26px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                $1,250,000 <span className="text-[14px] font-semibold text-slate-400">BIL</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>12.5%</span>
            <span className="text-slate-400 font-normal">10-Day Liquidity Horizon</span>
          </div>
        </div>

      </div>

      {/* ─── 2. MAIN GRID (MIDDLE + RIGHT COLUMNS) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Chart & Bottom Row (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Capital Growth & Benchmark Performance */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[17px] font-bold text-[#0A1128] tracking-tight">
                  Portfolio Performance &amp; Benchmark Alpha
                </h3>
                <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                  Real-time trajectory of SentinelCap Mean-CVaR allocation vs. S&amp;P 500 (SPY)
                </p>
              </div>

              {/* Legend & Filter Pill */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                    <span>SentinelCap</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span>S&amp;P 500</span>
                  </div>
                </div>

                {/* Dropdown filter pill */}
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  {timeRange}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Recharts Dual-Line Chart */}
            <div className="w-full h-[260px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[9500, 11500]}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#0066FF"
                      strokeWidth={2.8}
                      dot={false}
                      isAnimationActive={false}
                      activeDot={{ r: 6, fill: "#0066FF", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#CBD5E1"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      activeDot={{ r: 4, fill: "#94A3B8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom Dual Cards: Execution Activity & Safeguard Budgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Bottom Card 1: Execution Activity (Bar Chart) */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-[15px] font-bold text-[#0A1128]">Execution Volume</h4>
                  <p className="text-[11px] text-slate-400">Autonomous trade rebalances ($k)</p>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                    Algorithmic
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    Manual
                  </span>
                </div>
              </div>

              <div className="w-full h-[150px]">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} barGap={4} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Bar dataKey="algo" fill="#0066FF" radius={[3, 3, 0, 0]} maxBarSize={10} isAnimationActive={false} />
                      <Bar dataKey="manual" fill="#38BDF8" radius={[3, 3, 0, 0]} maxBarSize={10} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bottom Card 2: Safeguards & Risk Limits */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-[15px] font-bold text-[#0A1128]">Risk Budgets &amp; Safeguards</h4>
                  <p className="text-[11px] text-slate-400">Enforced circuit breakers &amp; limits</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                  All Normal
                </span>
              </div>

              <div className="space-y-3 mt-1">
                {[
                  { name: "Max Drawdown Cap", current: "2.40%", limit: "8.00%", pct: 30, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                  { name: "CVaR (99%) Limit", current: "3.42%", limit: "6.00%", pct: 57, icon: <Zap className="w-3.5 h-3.5" /> },
                  { name: "Asset Cap (SPY ≤ 40%)", current: "35.0%", limit: "40.0%", pct: 87, icon: <Sliders className="w-3.5 h-3.5" /> },
                  { name: "Liquidity Ratio (≥ 80%)", current: "94.5%", limit: "80.0%", pct: 94, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <span className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-[#0066FF]">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-medium text-[11.5px]">
                        <strong className="text-slate-800 font-semibold">{item.current}</strong> / {item.limit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0066FF] rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Treasury Vault Card & Recent Executions */}
        <div className="space-y-6">

          {/* Card 1: Institutional Treasury Vault Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[15px] font-bold text-[#0A1128]">Institutional Vault</h4>
              <Link
                href="/optimize"
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                title="Run Rebalance"
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Electric Blue Institutional Vault Card */}
            <div className="relative w-full aspect-[1.62/1] rounded-2xl p-5 bg-gradient-to-br from-[#0066FF] via-[#0055EE] to-[#0038B8] text-white shadow-lg shadow-blue-600/25 flex flex-col justify-between overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 w-36 h-36 bg-cyan-400/20 rounded-full blur-xl" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-bold tracking-wide text-white/95">Alex Vance</span>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Chief Risk Officer</p>
                </div>
                <Wifi className="w-4 h-4 rotate-90 text-white/80" />
              </div>

              {/* Custody Pool Key */}
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-mono tracking-widest text-blue-200">PORT-INST-001</p>
                <p className="font-mono text-[16px] sm:text-[18px] tracking-[0.16em] font-semibold text-white/95">
                  9481 2049 8812 0019
                </p>
              </div>

              {/* Balance & Custody Partner */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-blue-200 tracking-wider">Vault Balance</p>
                  <p className="text-[15px] font-extrabold text-white tracking-tight">$10,000,000 USD</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-semibold text-blue-200 tracking-wider">Prime Custody</p>
                  <p className="text-[12px] font-bold text-white tracking-tight">Goldman Sachs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Portfolio Executions & Rebalances */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[15px] font-bold text-[#0A1128]">Recent Executions</h4>
              <Link
                href="/audit-log"
                className="text-[12px] font-semibold text-[#0066FF] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Audit Log
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  ticker: "SPY",
                  name: "S&P 500 ETF Trust",
                  action: "Dynamic Trim (38% → 35%)",
                  amount: "+$350,000",
                  isPositive: true,
                  bgColor: "bg-blue-50 text-[#0066FF]",
                },
                {
                  ticker: "GLD",
                  name: "SPDR Gold Shares",
                  action: "Safe-Haven Flight Hedge",
                  amount: "+$120,000",
                  isPositive: true,
                  bgColor: "bg-amber-50 text-amber-600",
                },
                {
                  ticker: "AGG",
                  name: "Core US Aggregate Bond",
                  action: "Duration Rebalancing",
                  amount: "-$85,500",
                  isPositive: false,
                  bgColor: "bg-violet-50 text-violet-600",
                },
                {
                  ticker: "BIL",
                  name: "1-3M Treasury Bills",
                  action: "Collateral Reserve Sweep",
                  amount: "+$45,000",
                  isPositive: true,
                  bgColor: "bg-emerald-50 text-emerald-600",
                },
              ].map((tx) => (
                <div key={tx.ticker} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${tx.bgColor} shadow-sm`}>
                      {tx.ticker}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#0A1128] group-hover:text-[#0066FF] transition-colors">
                        {tx.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {tx.action}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[13px] font-bold ${tx.isPositive ? "text-emerald-600" : "text-[#0A1128]"}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
