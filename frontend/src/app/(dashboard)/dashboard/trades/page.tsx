"use client";

import React, { useState } from "react";
import { History, ArrowUpRight, ArrowDownRight, Filter, Search, CheckCircle2, Clock, ShieldCheck, Download, Plus } from "lucide-react";

interface Trade {
  order_id: string;
  ticker: string;
  asset_name: string;
  side: "BUY" | "SELL";
  shares: number;
  price: number;
  notional: number;
  slippage_bps: number;
  venue: string;
  time: string;
  status: "FILLED" | "SETTLING" | "ROUTED";
}

const SAMPLE_TRADES: Trade[] = [
  { order_id: "ORD-99014", ticker: "SPY", asset_name: "S&P 500 ETF Trust", side: "SELL", shares: 620, price: 564.50, notional: 350000, slippage_bps: 0.8, venue: "Goldman Prime", time: "14:28:10", status: "FILLED" },
  { order_id: "ORD-99013", ticker: "GLD", asset_name: "SPDR Gold Shares", side: "BUY", shares: 512, price: 234.20, notional: 120000, slippage_bps: 1.1, venue: "IEX Direct", time: "14:26:45", status: "FILLED" },
  { order_id: "ORD-99012", ticker: "BIL", asset_name: "1-3M Treasury Bills", side: "BUY", shares: 485, price: 92.78, notional: 45000, slippage_bps: 0.2, venue: "Fed Liquidity", time: "13:50:02", status: "FILLED" },
  { order_id: "ORD-99011", ticker: "AGG", asset_name: "Core US Aggregate Bond", side: "SELL", shares: 870, price: 98.27, notional: 85500, slippage_bps: 0.9, venue: "Goldman Prime", time: "12:15:33", status: "FILLED" },
  { order_id: "ORD-99010", ticker: "VNQ", asset_name: "Vanguard Real Estate", side: "BUY", shares: 420, price: 88.10, notional: 37000, slippage_bps: 1.4, venue: "IEX Direct", time: "11:04:19", status: "FILLED" },
  { order_id: "ORD-99009", ticker: "EFA", asset_name: "iShares MSCI EAFE", side: "BUY", shares: 780, price: 77.40, notional: 60372, slippage_bps: 1.0, venue: "Goldman Prime", time: "10:22:40", status: "FILLED" },
];

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>(SAMPLE_TRADES);
  const [filterSide, setFilterSide] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = trades.filter((t) => {
    const matchesSide = filterSide === "ALL" || t.side === filterSide;
    const matchesSearch = t.ticker.toLowerCase().includes(search.toLowerCase()) || t.asset_name.toLowerCase().includes(search.toLowerCase());
    return matchesSide && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Institutional Execution Blotter</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[11px] font-bold">
              Prime Custody
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time algorithmic rebalance fills, smart routing execution, and liquidity cost tracking.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export Blotter CSV</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Total Filled Volume (Today)</p>
          <h3 className="text-2xl font-extrabold text-[#0A1128] mt-1">$697,872 <span className="text-xs font-normal text-slate-400">USD</span></h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">6/6 Algorithmic Orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Average Execution Slippage</p>
          <h3 className="text-2xl font-extrabold text-[#0066FF] mt-1">0.88 bps</h3>
          <p className="text-xs text-slate-400 mt-1">Target: &lt; 2.5 bps</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Fill Completion Rate</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">100.0%</h3>
          <p className="text-xs text-slate-400 mt-1">Zero unfulfilled orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Primary Execution Venue</p>
          <h3 className="text-2xl font-extrabold text-[#0A1128] mt-1">Goldman Sachs</h3>
          <p className="text-xs text-slate-400 mt-1">Direct Prime Route</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker (SPY, GLD)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0066FF]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            {["ALL", "BUY", "SELL"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSide(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterSide === s
                    ? "bg-white text-[#0066FF] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Ticker</th>
                <th className="pb-3">Side</th>
                <th className="pb-3 text-right">Shares</th>
                <th className="pb-3 text-right">Fill Price</th>
                <th className="pb-3 text-right">Notional</th>
                <th className="pb-3 text-right">Slippage</th>
                <th className="pb-3">Venue</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.order_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-600">{t.order_id}</td>
                  <td className="py-3 font-semibold text-slate-900">
                    <span className="font-bold text-[#0066FF] mr-1.5">{t.ticker}</span>
                    <span className="text-slate-500 font-normal">{t.asset_name}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      t.side === "BUY" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-700">{t.shares.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-slate-700">${t.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">${t.notional.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-slate-500">{t.slippage_bps} bps</td>
                  <td className="py-3 text-slate-600">{t.venue}</td>
                  <td className="py-3 font-mono text-slate-400">{t.time}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
