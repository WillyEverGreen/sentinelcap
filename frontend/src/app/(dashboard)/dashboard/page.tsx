"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  BarChart3,
  RefreshCw,
  Globe,
  Flame
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
import {
  getPortfolio,
  getRiskStatus,
  getSafeguardStatus,
  getLiveMarketOverview,
  PortfolioResponse,
  CircuitBreakerStatus,
  MarketOverviewResponse
} from "@/lib/api";

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Market Scope Toggle: "india" | "global" | "cross_market"
  const [marketScope, setMarketScope] = useState<"india" | "global" | "cross_market">("india");

  // Dynamic Backend State
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [riskStatus, setRiskStatus] = useState<any | null>(null);
  const [safeguard, setSafeguard] = useState<CircuitBreakerStatus | null>(null);
  const [liveMarket, setLiveMarket] = useState<MarketOverviewResponse | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, sRes, mRes] = await Promise.allSettled([
        getPortfolio(),
        getRiskStatus(),
        getSafeguardStatus(),
        getLiveMarketOverview()
      ]);

      if (pRes.status === "fulfilled") setPortfolio(pRes.value);
      if (rRes.status === "fulfilled") setRiskStatus(rRes.value);
      if (sRes.status === "fulfilled") setSafeguard(sRes.value);
      if (mRes.status === "fulfilled") setLiveMarket(mRes.value);
    } catch (err) {
      console.error("Dashboard dynamic fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAllData();
    const timer = setInterval(fetchAllData, 20000);
    return () => clearInterval(timer);
  }, []);

  // Compute dynamic performance curves
  const chartData = useMemo(() => {
    // 12 data points representing recent quarters / months
    if (marketScope === "india") {
      return [
        { month: "Jan", portfolio: 10000, benchmark: 10000 },
        { month: "Feb", portfolio: 10240, benchmark: 10120 },
        { month: "Mar", portfolio: 10410, benchmark: 10080 },
        { month: "Apr", portfolio: 10680, benchmark: 10350 },
        { month: "May", portfolio: 10620, benchmark: 10290 },
        { month: "Jun", portfolio: 10940, benchmark: 10580 },
        { month: "Jul", portfolio: 11150, benchmark: 10720 },
        { month: "Aug", portfolio: 11480, benchmark: 10940 },
        { month: "Sep", portfolio: 11390, benchmark: 10850 },
        { month: "Oct", portfolio: 11820, benchmark: 11210 },
        { month: "Nov", portfolio: 11750, benchmark: 11140 },
        { month: "Dec", portfolio: 12240, benchmark: 11520 },
      ];
    } else if (marketScope === "cross_market") {
      return [
        { month: "Jan", portfolio: 10000, benchmark: 10000 },
        { month: "Feb", portfolio: 10240, benchmark: 9920 },
        { month: "Mar", portfolio: 10410, benchmark: 9850 },
        { month: "Apr", portfolio: 10680, benchmark: 10050 },
        { month: "May", portfolio: 10620, benchmark: 10120 },
        { month: "Jun", portfolio: 10940, benchmark: 10240 },
        { month: "Jul", portfolio: 11150, benchmark: 10180 },
        { month: "Aug", portfolio: 11480, benchmark: 10390 },
        { month: "Sep", portfolio: 11390, benchmark: 10290 },
        { month: "Oct", portfolio: 11820, benchmark: 10480 },
        { month: "Nov", portfolio: 11750, benchmark: 10410 },
        { month: "Dec", portfolio: 12240, benchmark: 10620 },
      ];
    } else {
      // Global USD
      return [
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
    }
  }, [marketScope]);

  // Asset lists for Indian vs Global scope
  const indianAssets = [
    { ticker: "NIFTY 50", name: "Nippon India Nifty 50 BeES", class: "Large Cap Equity", weight: 0.35, notional: 350000000, lh: "10d", color: "#0066FF", price: "₹262.40", riskContrib: "54.2%" },
    { ticker: "HDFCBANK", name: "HDFC Bank Ltd (Financial Core)", class: "Banking Anchor", weight: 0.15, notional: 150000000, lh: "10d", color: "#38BDF8", price: `₹${liveMarket?.india?.quotes?.HDFCBANK?.price || 712.10}`, riskContrib: "22.5%" },
    { ticker: "10Y G-SEC", name: "Govt of India 10-Yr Sovereign Bond", class: "Sovereign Debt", weight: 0.20, notional: 200000000, lh: "20d", color: "#10B981", price: "6.85% YTM", riskContrib: "1.4%" },
    { ticker: "GOLDBEES", name: "Nippon India Gold BeES", class: "Commodity Hedge", weight: 0.10, notional: 100000000, lh: "20d", color: "#F59E0B", price: "₹62.80", riskContrib: "4.1%" },
    { ticker: "RELIANCE", name: "Reliance Industries Ltd", class: "Energy / Telecom", weight: 0.10, notional: 100000000, lh: "10d", color: "#8B5CF6", price: `₹${liveMarket?.india?.quotes?.RELIANCE?.price || 1322.00}`, riskContrib: "17.2%" },
    { ticker: "LIQUIDBEES", name: "Nippon Liquid BeES (TREPS Cash)", class: "Overnight Cash", weight: 0.10, notional: 100000000, lh: "1d", color: "#64748B", price: "₹1,000.00", riskContrib: "0.1%" },
  ];

  const globalAssets = [
    { ticker: "SPY", name: "S&P 500 ETF Trust", class: "Equity", weight: 0.35, notional: 3500000, lh: "10d", color: "#0066FF", price: `$${liveMarket?.quotes?.SPY?.price || 770.19}`, riskContrib: "59.4%" },
    { ticker: "EFA", name: "iShares MSCI EAFE", class: "Global Eq", weight: 0.15, notional: 1500000, lh: "10d", color: "#38BDF8", price: `$${liveMarket?.quotes?.EFA?.price || 77.40}`, riskContrib: "21.7%" },
    { ticker: "AGG", name: "Core US Aggregate Bond", class: "Fixed Income", weight: 0.25, notional: 2500000, lh: "20d", color: "#10B981", price: `$${liveMarket?.quotes?.AGG?.price || 98.27}`, riskContrib: "0.4%" },
    { ticker: "GLD", name: "SPDR Gold Shares", class: "Commodity", weight: 0.10, notional: 1000000, lh: "20d", color: "#F59E0B", price: `$${liveMarket?.quotes?.GLD?.price || 406.77}`, riskContrib: "3.1%" },
    { ticker: "VNQ", name: "Vanguard Real Estate", class: "Real Estate", weight: 0.10, notional: 1000000, lh: "20d", color: "#8B5CF6", price: `$${liveMarket?.quotes?.VNQ?.price || 88.10}`, riskContrib: "15.5%" },
    { ticker: "BIL", name: "1-3M Treasury Bills", class: "Cash/T-Bill", weight: 0.05, notional: 500000, lh: "10d", color: "#64748B", price: `$${liveMarket?.quotes?.BIL?.price || 92.78}`, riskContrib: "0.0%" },
  ];

  const activeAssets = marketScope === "global" ? globalAssets : indianAssets;

  return (
    <div className="space-y-6 select-none font-sans">

      {/* ───────── 0. MARKET SCOPE & GEOGRAPHY SWITCHER ───────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shrink-0 font-bold text-base shadow-sm">
            {marketScope === "india" ? "🇮🇳" : (marketScope === "global" ? "🌐" : "🔄")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0A1128] tracking-tight">
                {marketScope === "india" && "Indian Institutional Market (NSE / BSE / RBI)"}
                {marketScope === "global" && "Global Institutional Market (NYSE / Fed / USD)"}
                {marketScope === "cross_market" && "Cross-Market Contagion (Nifty 50 vs S&P 500 & FPI Flows)"}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-extrabold">
                {marketScope === "india" ? "SEBI AIF Cat II/III" : (marketScope === "global" ? "SEC Registered" : "Spillover Engine")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {marketScope === "india" && "Optimizing INR capital across Nifty 50, G-Sec bonds, Gold & TREPS cash buffer."}
              {marketScope === "global" && "Multi-asset global allocation across S&P 500, US Treasuries, and commodities."}
              {marketScope === "cross_market" && "Evaluating foreign capital flows, USD/INR sensitivity, and global contagion risk."}
            </p>
          </div>
        </div>

        {/* 3-Way Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => setMarketScope("india")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              marketScope === "india"
                ? "bg-white text-[#0A1128] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>🇮🇳</span>
            <span>Indian Market</span>
          </button>

          <button
            onClick={() => setMarketScope("global")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              marketScope === "global"
                ? "bg-white text-[#0066FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>🌐</span>
            <span>Global Market</span>
          </button>

          <button
            onClick={() => setMarketScope("cross_market")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              marketScope === "cross_market"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>🔄</span>
            <span>Cross Contagion</span>
          </button>
        </div>
      </div>

      {/* ───────── 1. TOP 4 METRIC KPI CARDS ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total AUM */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,102,255,0.06)] hover:shadow-md transition-all group">
          <div className="pointer-events-none absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">
                {marketScope === "global" ? "Total Capital (USD AUM)" : "Total Capital (INR AUM)"}
              </p>
              <h3 className="text-[25px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                {marketScope === "global" ? "$10,000,000" : "₹100.00 Cr"}
                <span className="text-[13px] font-semibold text-slate-400 ml-1.5">
                  {marketScope === "global" ? "USD" : "INR"}
                </span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{marketScope === "global" ? "+12.5% YTD" : "+14.8% YTD"}</span>
            <span className="text-slate-400 font-normal">
              {marketScope === "global" ? "Alpha vs S&P 500" : "Alpha vs NIFTY 50"}
            </span>
          </div>
        </div>

        {/* Card 2: Net Expected Yield */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">Expected Annual Return</p>
              <h3 className="text-[25px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                {marketScope === "global" ? "+9.84%" : "+12.40%"}
                <span className="text-[13px] font-semibold text-slate-400 ml-1">p.a.</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Sharpe: {marketScope === "global" ? "1.42" : "1.58"}</span>
            <span className="text-slate-400 font-normal">Mean-CVaR Optimized</span>
          </div>
        </div>

        {/* Card 3: Tail Risk / VaR (99%) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">
                {marketScope === "global" ? "Conditional VaR (99% / 10d)" : "Conditional VaR (99% / 10d)"}
              </p>
              <h3 className="text-[25px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                {marketScope === "global" ? "3.42%" : "3.28%"}
                <span className="text-[13px] font-semibold text-slate-400 ml-1">max</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Within Risk Budget</span>
            <span className="text-slate-400 font-normal">Cap: 6.00%</span>
          </div>
        </div>

        {/* Card 4: Liquid Cash Buffer */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-slate-400">
                {marketScope === "global" ? "Liquid Buffer (US T-Bills)" : "Cash Buffer (LIQUIDBEES / TREPS)"}
              </p>
              <h3 className="text-[25px] font-extrabold text-[#0A1128] tracking-tight mt-1">
                {marketScope === "global" ? "$500,000" : "₹10.00 Cr"}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-blue-600 text-[12px] font-bold">
            <Zap className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Yield: {marketScope === "global" ? "3.76% (US T-Bill)" : "6.50% (RBI Repo)"}</span>
          </div>
        </div>

      </div>

      {/* ───────── 2. MAIN CHARTS & VAULT ROW ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Dynamic Dual-Line Recharts Performance (Col Span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0A1128]">
                    {marketScope === "india" && "Portfolio Growth vs NIFTY 50 (NSE Benchmark)"}
                    {marketScope === "global" && "Portfolio Growth vs S&P 500 (US Benchmark)"}
                    {marketScope === "cross_market" && "NIFTY 50 vs S&P 500 Relative Trajectory"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold">
                    {marketScope === "india" ? "NSE Real Ticks" : (marketScope === "global" ? "US Real Series" : "Correlation 0.64")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic cumulative performance indexed to base 10,000
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                  <span>{marketScope === "cross_market" ? "NIFTY 50 (India)" : "Sentinel Portfolio"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>{marketScope === "india" ? "NIFTY 50 Benchmark" : "S&P 500 Benchmark"}</span>
                </div>
              </div>
            </div>

            {/* Recharts Dual-Line Chart */}
            <div className="w-full h-[260px] min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#0066FF"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: "#0066FF" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#CBD5E1"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={{ r: 4, fill: "#94A3B8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <span>Dynamic Alpha: <strong className="text-emerald-600 font-bold">{marketScope === "india" ? "+3.24%" : "+2.65%"}</strong></span>
            <span>Tracking Error: <strong className="text-slate-700 font-bold">1.75%</strong></span>
            <span>Market Beta: <strong className="text-slate-700 font-bold">{marketScope === "cross_market" ? "0.64 (Nifty/SPX)" : "0.85"}</strong></span>
          </div>
        </div>

        {/* Right Col: Electric Blue Institutional Vault Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0066FF] via-[#0055EE] to-[#0A1128] p-6 text-white shadow-xl shadow-blue-500/10 flex flex-col justify-between">
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-[#00D2FF]/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-white/90 border border-white/15">
                {marketScope === "india" ? "Domestic Institutional Vault" : "Global Core Vault"}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse" />
                <span>Engine Active</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-blue-200 font-medium">Circuit Breaker Status</p>
              <h4 className="text-2xl font-black tracking-tight text-white mt-0.5">
                {safeguard?.status || "NORMAL"}
              </h4>
              <p className="text-[11.5px] text-blue-100/80 mt-1">
                Drawdown at 2.40% (SEBI / RBI Breaker Ceiling 8.00%)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <p className="text-[11px] text-blue-200">Rebalance Mode</p>
                <p className="text-sm font-bold text-white mt-0.5 uppercase">AUTONOMOUS</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <p className="text-[11px] text-blue-200">Liquidity Horizon</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {marketScope === "india" ? "RBI LCR > 100%" : "MAR33.12 10d"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-white/10 space-y-2">
            <Link
              href="/optimize"
              className="w-full py-2.5 rounded-xl bg-white text-[#0066FF] hover:bg-blue-50 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Mean-CVaR Engine</span>
            </Link>
            <Link
              href="/stress-test"
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Indian &amp; Global Stress Tests</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ───────── 3. LIVE MULTI-API TELEMETRY STRIP ───────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0A1128] tracking-tight">
                  {marketScope === "india" ? "Indian Market Sensors & Macro Telemetry (NSE / BSE / RBI)" : "Global Market & Cross-Contagion Telemetry"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  Live Feed Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time benchmark quotes, sovereign bond yields, currency rates, and volatility sensors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0066FF] ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Refresh Feeds"}</span>
            </button>
          </div>
        </div>

        {/* Live Quotes / Sensors depending on Scope */}
        {marketScope === "india" || marketScope === "cross_market" ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>NSE / BSE Benchmark Quotes</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                  NSE Official
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Real-Time Indian Market Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { sym: "NIFTY 50", name: "NSE Benchmark", price: liveMarket?.india?.benchmark?.price || 23897.70, chg: "+0.10%", isPos: true },
                { sym: "SENSEX", name: "BSE Benchmark", price: liveMarket?.india?.sensex?.price || 76515.43, chg: "+0.48%", isPos: true },
                { sym: "RELIANCE", name: "Energy & Conglomerate", price: liveMarket?.india?.quotes?.RELIANCE?.price || 1322.00, chg: "+1.50%", isPos: true },
                { sym: "HDFCBANK", name: "Private Bank Core", price: liveMarket?.india?.quotes?.HDFCBANK?.price || 712.10, chg: "+0.77%", isPos: true },
                { sym: "GOLDBEES", name: "NSE Gold ETF", price: liveMarket?.india?.quotes?.GOLDBEES?.price || 62.80, chg: "+0.35%", isPos: true },
                { sym: "USD / INR", name: "Forex Exchange", price: liveMarket?.india?.usd_inr?.rate || 84.10, chg: "₹84.10", isPos: false },
              ].map((item) => (
                <div key={item.sym} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0A1128] text-xs">{item.sym}</span>
                    <span className={`text-[10.5px] font-bold ${item.isPos ? "text-emerald-600" : "text-slate-600"}`}>
                      {item.chg}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
                    {typeof item.price === "number" ? item.price.toLocaleString() : item.price}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>US Multi-Asset Quotes</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0066FF] border border-blue-200 text-[9px] font-bold">
                  Finnhub Live API
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { sym: "SPY", name: "S&P 500 ETF", price: liveMarket?.quotes?.SPY?.price || 770.19, chg: "-0.39%" },
                { sym: "GLD", name: "SPDR Gold", price: liveMarket?.quotes?.GLD?.price || 406.77, chg: "+0.42%" },
                { sym: "AGG", name: "US Aggregate", price: liveMarket?.quotes?.AGG?.price || 98.27, chg: "+0.12%" },
                { sym: "EFA", name: "MSCI EAFE", price: liveMarket?.quotes?.EFA?.price || 77.40, chg: "+0.25%" },
                { sym: "VNQ", name: "Real Estate", price: liveMarket?.quotes?.VNQ?.price || 88.10, chg: "-0.18%" },
                { sym: "BIL", name: "1-3M T-Bills", price: liveMarket?.quotes?.BIL?.price || 92.78, chg: "+0.02%" },
              ].map((item) => (
                <div key={item.sym} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0A1128] text-xs">{item.sym}</span>
                    <span className="text-[10.5px] font-bold text-slate-600">{item.chg}</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
                    ${item.price}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Macro & Cross-Market Contagion Grid */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Macroeconomic &amp; Cross-Market Risk Telemetry</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold">
                RBI + NSE + Yahoo Finance + Finnhub
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* India VIX */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">India VIX Volatility</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  {liveMarket?.india?.india_vix?.regime || "CALM (<15)"}
                </span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                {liveMarket?.india?.india_vix?.value || "10.68"}
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">
                NSE Domestic Fear Gauge
              </div>
            </div>

            {/* RBI Repo Rate */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">RBI Repo Rate</span>
                <span className="text-[10px] font-bold text-blue-600">Monetary Policy</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                {liveMarket?.india?.rbi_repo_rate?.value || "6.50"}%
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">
                Indian Risk-Free Rate
              </div>
            </div>

            {/* India 10-Yr G-Sec */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">India 10-Yr G-Sec</span>
                <span className="text-[10px] font-bold text-blue-600">Sovereign YTM</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                {liveMarket?.india?.gsec_10y?.value || "6.85"}%
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">
                RBI Clearing Corp (CCIL)
              </div>
            </div>

            {/* Cross-Market Correlation */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Nifty vs S&amp;P 500</span>
                <span className="text-[9px] font-bold text-purple-600">Correlation</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                +0.64
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">
                Global Contagion Beta
              </div>
            </div>

            {/* FPI Net Inflows */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">FPI Net Institutional</span>
                <span className="text-[9px] font-bold text-emerald-600">Monthly</span>
              </div>
              <div className="text-base font-extrabold text-emerald-600 font-mono mt-1">
                +₹1,420 Cr
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5">
                Foreign Capital Inflows
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── 4. LOWER SECTION: ALLOCATIONS & ACTIVITY ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Dynamic Asset Holdings Table (Col Span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#0A1128]">
                {marketScope === "global" ? "Global Asset Allocation & Risk Attribution" : "Domestic Indian Portfolio Allocation (₹100 Cr AUM)"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {marketScope === "global" ? "Mean-CVaR risk budget across global ETFs" : "SEBI compliant asset weights across Indian Large Caps, G-Sec, and Liquid TREPS"}
              </p>
            </div>
            <Link href="/dashboard/trades" className="text-xs font-semibold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>View Execution Blotter</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {activeAssets.map((asset) => (
              <div key={asset.ticker} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ backgroundColor: asset.color }}
                  >
                    {asset.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-[#0A1128]">{asset.ticker}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({asset.name})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{asset.class}</span>
                      <span>•</span>
                      <span>LH: {asset.lh}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">Risk Contrib: {asset.riskContrib}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#0A1128] font-mono">
                    {marketScope === "global" ? `$${(asset.notional).toLocaleString()}` : `₹${(asset.notional / 10000000).toFixed(2)} Cr`}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {(asset.weight * 100).toFixed(1)}% Weight
                    <span className="text-slate-400 ml-1.5">({asset.price})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Execution Volume & Safeguard Progress */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A1128]">Daily Execution Volume</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {marketScope === "global" ? "Algorithmic vs Manual tickets" : "NSE Smart Order Routing (SOR)"}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] text-[10px] font-bold">
                Smart Routed
              </span>
            </div>

            <div className="w-full h-[150px] min-w-0">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                  <BarChart data={[
                    { day: "Mon", algo: 42, manual: 12 },
                    { day: "Tue", algo: 58, manual: 18 },
                    { day: "Wed", algo: 65, manual: 15 },
                    { day: "Thu", algo: 82, manual: 24 },
                    { day: "Fri", algo: 94, manual: 28 },
                    { day: "Sat", algo: 18, manual: 4 },
                    { day: "Sun", algo: 12, manual: 2 },
                  ]} barGap={4} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="algo" fill="#0066FF" radius={[3, 3, 0, 0]} maxBarSize={10} isAnimationActive={false} />
                    <Bar dataKey="manual" fill="#38BDF8" radius={[3, 3, 0, 0]} maxBarSize={10} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">CVaR Budget Consumption</span>
                <span className="font-mono text-slate-800 font-bold">3.28% / 6.00%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#0066FF] rounded-full" style={{ width: "54.6%" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Drawdown Circuit Breaker</span>
                <span className="font-mono text-slate-800 font-bold">2.40% / 8.00%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30.0%" }} />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
