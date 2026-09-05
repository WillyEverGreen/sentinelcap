"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPortfolio, getRiskStatus, PortfolioResponse, RiskMetricsResponse } from "@/lib/api";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [riskData, setRiskData] = useState<RiskMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const fetchData = async () => {
    try {
      const [port, risk] = await Promise.all([getPortfolio(), getRiskStatus()]);
      setPortfolio(port);
      setRiskData(risk);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalVal = portfolio?.total_value || 10_000_000;
  const cvar99 = riskData?.risk_metrics?.var_metrics?.historical?.es_cvar_pct || 0.0512;
  const riskBudget = portfolio?.portfolio?.risk_budget_cvar_99 || 0.06;
  const lcr = riskData?.frtb_liquidity?.liquidity_coverage?.coverage_ratio || 4.03;
  const regimeLabel = riskData?.regime?.regime_label || "Calm";

  // Institutional Multi-Asset Positions
  const assets = [
    { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", category: "EQUITY", weight: 0.35, val: 3500000, price: "$510.20", lh: 10, riskPct: 59.4, color: "#38bdf8", type: "Equities" },
    { ticker: "AGG", name: "iShares Core US Aggregate Bond", category: "FIXED_INCOME", weight: 0.25, val: 2500000, price: "$98.40", lh: 20, riskPct: 0.4, color: "#818cf8", type: "Bonds" },
    { ticker: "EFA", name: "iShares MSCI EAFE Developed", category: "EQUITY", weight: 0.15, val: 1500000, price: "$78.10", lh: 10, riskPct: 21.7, color: "#38bdf8", type: "Equities" },
    { ticker: "GLD", name: "SPDR Gold Shares Physical Trust", category: "COMMODITY", weight: 0.10, val: 1000000, price: "$215.50", lh: 20, riskPct: 3.1, color: "#fbbf24", type: "Gold & REIT" },
    { ticker: "VNQ", name: "Vanguard Real Estate REIT ETF", category: "COMMODITY", weight: 0.10, val: 1000000, price: "$88.20", lh: 20, riskPct: 15.5, color: "#c084fc", type: "Gold & REIT" },
    { ticker: "BIL", name: "SPDR Bloomberg 1-3M T-Bill", category: "FIXED_INCOME", weight: 0.05, val: 500000, price: "$91.50", lh: 10, riskPct: 0.1, color: "#34d399", type: "Bonds" },
  ];

  const filteredAssets = activeCategory === "ALL" 
    ? assets 
    : assets.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching reference image: Title + Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">eCommerce & Capital Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Home - Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/optimize"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>Rebalance Portfolio</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* TOP SECTION: Grid matching reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: 4 metric cards matching reference (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Card 1: Donut Chart Card ($69,700 style) */}
          <div className="bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-slate-400 font-medium">$</span>
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">10,000,000</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  2.2%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Expected Capital Allocation</p>
            </div>

            {/* Donut Chart on Left, Legend on Right */}
            <div className="flex items-center justify-between gap-4 mt-5">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Outer circle background track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#22263d" strokeWidth="12" />
                  
                  {/* Segment 1: Equities (50%) - Electric Cyan */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="12"
                    strokeDasharray="119.38 238.76"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Segment 2: Fixed Income (25%) - Soft Indigo */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="12"
                    strokeDasharray="59.69 238.76"
                    strokeDashoffset="-119.38"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Segment 3: Real Assets & Gold (25%) - Warm Amber */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="12"
                    strokeDasharray="59.69 238.76"
                    strokeDashoffset="-179.07"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>

              {/* Legend List matching reference */}
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block shadow-sm shadow-sky-400/50" /> Equities
                  </span>
                  <span className="font-mono font-semibold text-white">$5,000k</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#818cf8] inline-block shadow-sm shadow-indigo-400/50" /> Bonds
                  </span>
                  <span className="font-mono font-semibold text-white">$3,000k</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24] inline-block shadow-sm shadow-amber-400/50" /> Gold/REIT
                  </span>
                  <span className="font-mono font-semibold text-white">$2,000k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Mini Bar Chart Card ($2,420 style) */}
          <div className="bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">4.03x</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  2.6%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Average Liquidity Coverage (LCR)</p>
            </div>

            {/* Glowing vertical mini bar chart */}
            <div className="h-16 flex items-end justify-between gap-2.5 mt-4 pt-2">
              {[35, 60, 45, 80, 50, 95, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-[#22263d] rounded-md h-full flex items-end p-0.5">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded-sm hover:brightness-125 transition-all cursor-pointer shadow-sm shadow-cyan-500/20"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Progress Card (1,836 style) */}
          <div className="bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">5.12%</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="7" x2="17" y2="17" />
                    <polyline points="17 7 17 17 7 17" />
                  </svg>
                  2.2%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">99% 10-Day Expected Shortfall</p>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">85% to Risk Budget</span>
                <span className="font-mono text-emerald-400 font-semibold">6.0% Limit</span>
              </div>
              <div className="h-2 w-full bg-[#22263d] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full w-[85%] shadow-sm shadow-emerald-400/30" />
              </div>
            </div>
          </div>

          {/* Card 4: Team / Regime Card (6.3k style) */}
          <div className="bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">CALM</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LOW VOL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Hamilton Markov Regime State</p>
            </div>

            <div className="mt-4">
              <p className="text-[11px] text-slate-400 font-medium mb-2">Today's Risk Guardians</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#181b2a] shadow-sm">
                    CR
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#181b2a] shadow-sm">
                    LP
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#181b2a] shadow-sm">
                    FR
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-semibold bg-[#22263d] px-2.5 py-0.5 rounded-full border border-white/[0.05]">
                  +3 nodes
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Large Area Chart Card matching reference (5 cols) */}
        <div className="lg:col-span-5 bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Sales & Capital this Month</h3>
                <p className="text-xs text-slate-400 mt-0.5">Simulated multi-asset liquidity growth</p>
              </div>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-medium">$</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">14,094,000</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  4.6%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Another $48,346 to goal target</p>
            </div>
          </div>

          {/* Smooth Green Area Line Chart */}
          <div className="mt-6">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2">
              <span>$24k</span>
              <span>$20.5k</span>
              <span>$17k</span>
              <span>$13.5k</span>
              <span>$10k</span>
            </div>

            <div className="relative w-full aspect-[2.4/1]">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[30, 70, 110, 140].map((y) => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#22263d" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Filled Area */}
                <path
                  d="M 0,95 L 40,85 L 80,60 L 120,60 L 160,30 L 200,30 L 240,80 L 280,105 L 320,85 L 360,85 L 400,60 L 400,160 L 0,160 Z"
                  fill="url(#greenGrad)"
                />

                {/* Crisp Glowing Green Path matching reference */}
                <path
                  d="M 0,95 L 40,85 L 80,60 L 120,60 L 160,30 L 200,30 L 240,80 L 280,105 L 320,85 L 360,85 L 400,60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Highlight Point */}
                <circle cx="200" cy="30" r="4.5" fill="#10b981" stroke="#181b2a" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Date Axis matching reference */}
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-3">
              <span>Jun 04</span>
              <span>Jun 07</span>
              <span>Jun 10</span>
              <span>Jun 13</span>
              <span>Jun 16</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Grid matching reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* BOTTOM LEFT: Recent Orders style table with Category Tab Pills (7 cols) */}
        <div className="lg:col-span-7 bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide">Recent Orders & Positions</h3>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          {/* Category Tabs with Professional SVGs matching reference */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: "ALL",
                label: "All Assets",
                svg: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
              },
              {
                id: "EQUITY",
                label: "Equities",
                svg: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ),
              },
              {
                id: "FIXED_INCOME",
                label: "Bonds",
                svg: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="21" x2="21" y2="21" />
                    <line x1="6" y1="18" x2="6" y2="10" />
                    <line x1="12" y1="18" x2="12" y2="10" />
                    <line x1="18" y1="18" x2="18" y2="10" />
                    <path d="M3 10 12 3l9 7" />
                  </svg>
                ),
              },
              {
                id: "COMMODITY",
                label: "Gold & REIT",
                svg: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
              },
            ].map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#1e2338] text-sky-400 border-sky-500/40 shadow-sm"
                      : "bg-[#141624] text-slate-400 border-white/[0.04] hover:bg-[#1a1d2e] hover:text-white"
                  }`}
                >
                  <span className={active ? "text-sky-400" : "text-slate-400"}>{tab.svg}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Clean table matching reference columns */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.05] text-slate-400 text-[11px] font-mono pb-2">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-right">Quantity</th>
                  <th className="pb-2 font-medium text-right">Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredAssets.map((item) => (
                  <tr key={item.ticker} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 flex items-center gap-3">
                      {/* Asset Category Squircle Icon Badge */}
                      <div
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold font-mono text-xs border border-current/20 shadow-sm"
                      >
                        {item.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs group-hover:text-sky-300 transition-colors">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Item: {item.ticker} • {item.type}</div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 font-medium">
                      x{(item.weight * 10).toFixed(0)}
                    </td>

                    <td className="py-3 text-right font-mono text-slate-400">
                      <div>{item.price}</div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white">
                      ${(item.val / 1000).toLocaleString()}.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM RIGHT: Discounted Product Sales style chart (5 cols) */}
        <div className="lg:col-span-5 bg-[#181b2a] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Discounted Capital & Tail Risk</h3>
                <p className="text-xs text-slate-400 mt-0.5">Users and automated hedge channels</p>
              </div>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-medium">$</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">3,706</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  2.8%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Total Discounted Sales this month</p>
            </div>
          </div>

          {/* Smooth Cyan Line Chart */}
          <div className="mt-6">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2">
              <span>$362</span>
              <span>$357</span>
              <span>$351</span>
              <span>$346</span>
              <span>$340</span>
            </div>

            <div className="relative w-full aspect-[2.4/1]">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[30, 70, 110, 140].map((y) => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#22263d" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Cyan Area Fill */}
                <path
                  d="M 0,90 L 40,110 L 80,95 L 120,95 L 160,110 L 200,90 L 240,90 L 280,120 L 320,105 L 360,105 L 400,95 L 400,160 L 0,160 Z"
                  fill="url(#blueGrad)"
                />

                {/* Crisp Glowing Cyan Line matching reference */}
                <path
                  d="M 0,90 L 40,110 L 80,95 L 120,95 L 160,110 L 200,90 L 240,90 L 280,120 L 320,105 L 360,105 L 400,95"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="240" cy="90" r="4.5" fill="#0ea5e9" stroke="#181b2a" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Date Axis matching reference */}
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-3">
              <span>Jun 04</span>
              <span>Jun 07</span>
              <span>Jun 10</span>
              <span>Jun 13</span>
              <span>Jun 16</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
