"use client";

import { useTheme } from "@/components/ThemeProvider";

import React, { useState, useEffect } from "react";
import { History, ArrowUpRight, ArrowDownRight, Filter, Search, CheckCircle2, Clock, ShieldCheck, Download, Plus, BarChart3, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

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

const HOURLY_VOLUME_DATA = [
  { hour: "09:30", volume: 145000, slippage: 0.6, orders: 4 },
  { hour: "10:30", volume: 210000, slippage: 1.0, orders: 6 },
  { hour: "11:30", volume: 85000, slippage: 0.7, orders: 3 },
  { hour: "12:30", volume: 65000, slippage: 0.4, orders: 2 },
  { hour: "13:30", volume: 95000, slippage: 0.5, orders: 3 },
  { hour: "14:30", volume: 380000, slippage: 1.2, orders: 9 },
  { hour: "15:30", volume: 180000, slippage: 0.9, orders: 5 },
];

export default function TradesPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [trades, setTrades] = useState<Trade[]>(SAMPLE_TRADES);
  const [filterSide, setFilterSide] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [hoveredHour, setHoveredHour] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = trades.filter((t) => {
    const matchesSide = filterSide === "ALL" || t.side === filterSide;
    const matchesSearch = t.ticker.toLowerCase().includes(search.toLowerCase()) || t.asset_name.toLowerCase().includes(search.toLowerCase());
    return matchesSide && matchesSearch;
  });

  const activeHour = hoveredHour || HOURLY_VOLUME_DATA[5]; // defaults to 14:30 peak window

  const CustomTradesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const vol = payload.find((p: any) => p.dataKey === "volume")?.value || 0;
      const item = HOURLY_VOLUME_DATA.find((h) => h.hour === label);

      return (
        <div className="bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 shadow-xl text-xs space-y-2 min-w-[210px] select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
            <span className="text-xs font-black uppercase">Window: {label} EST</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] font-mono text-[10.5px] font-bold border border-blue-200">
              {item?.orders} Orders
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0066FF]" />
                <span className="text-slate-500 font-medium">Executed Volume:</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">${vol.toLocaleString()} USD</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
            Smart routed via TWAP algorithm
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
            <h1 className="text-2xl font-bold text-[#0A1128] dark:text-white tracking-tight">Institutional Execution Blotter</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[11px] font-bold">
              Prime Custody
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time algorithmic rebalance fills, smart routing execution, and liquidity cost tracking.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1E293B] dark:bg-[#1E293B] transition-all cursor-pointer">
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export Blotter CSV</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-100 dark:border-slate-800/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Total Filled Volume (Today)</p>
          <h3 className="text-2xl font-extrabold text-[#0A1128] dark:text-white mt-1">$697,872 <span className="text-xs font-normal text-slate-400">USD</span></h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">6/6 Algorithmic Orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-100 dark:border-slate-800/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Average Execution Slippage</p>
          <h3 className="text-2xl font-extrabold text-[#0066FF] mt-1">0.88 bps</h3>
          <p className="text-xs text-slate-400 mt-1">Target: &lt; 2.5 bps</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-100 dark:border-slate-800/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Fill Completion Rate</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">100.0%</h3>
          <p className="text-xs text-slate-400 mt-1">Zero unfulfilled orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-100 dark:border-slate-800/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Primary Execution Venue</p>
          <h3 className="text-2xl font-extrabold text-[#0A1128] dark:text-white mt-1">Goldman Sachs</h3>
          <p className="text-xs text-slate-400 mt-1">Direct Prime Route</p>
        </div>
      </div>

      {/* Interactive Execution Volume Chart */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[#0A1128] dark:text-white tracking-tight">Intraday Execution Volume</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[10px] font-extrabold">
                TWAP / VWAP Routed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Executed dollar volume across trading intervals
            </p>
          </div>

          {/* Live Hover Readout Strip */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-[#1E293B] border border-slate-200/70 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Window:</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{activeHour.hour} EST</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#0066FF]" />
              <span className="text-slate-400 font-medium">Volume:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">${activeHour.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart & Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-1">
          {/* Chart Section */}
          <div className="lg:col-span-3 w-full h-[250px] min-w-0">
            {mounted && (
              <ResponsiveContainer width="100%" height={250} minWidth={100} minHeight={250}>
                <ComposedChart
                  data={HOURLY_VOLUME_DATA}
                  margin={{ top: 15, right: 25, left: 15, bottom: 5 }}
                  onMouseMove={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      setHoveredHour(e.activePayload[0].payload);
                    }
                  }}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#F1F5F9"} vertical={false} />
                  <XAxis dataKey="hour" stroke={isDark ? "#64748B" : "#94A3B8"} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    width={55}
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 450000]}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTradesTooltip />} cursor={{ fill: "rgba(0, 102, 255, 0.04)" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="volume"
                    fill="#0066FF"
                    radius={[5, 5, 0, 0]}
                    barSize={44}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Right Panel Section: Routing Venues */}
          <div className="lg:col-span-1 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Routing Venues</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Goldman Prime</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0066FF] w-[65%]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">IEX Direct</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">25%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0066FF] opacity-60 w-[25%]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Fed Liquidity</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">10%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0066FF] opacity-30 w-[10%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Dark Pool Routing</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">INACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker (SPY, GLD)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0066FF] dark:focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "BUY", "SELL"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setFilterSide(side)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterSide === side
                    ? "bg-[#0066FF] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2A374A]"
                }`}
              >
                {side}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Asset</th>
                <th className="pb-3 text-center">Side</th>
                <th className="pb-3 text-right">Shares</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Notional</th>
                <th className="pb-3 text-right">Slippage</th>
                <th className="pb-3">Venue</th>
                <th className="pb-3">Time</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.order_id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/80 transition-colors">
                  <td className="py-3 font-mono text-slate-500 font-semibold">{t.order_id}</td>
                  <td className="py-3">
                    <div className="font-bold text-[#0A1128] dark:text-white">{t.ticker}</div>
                    <div className="text-[10px] text-slate-400">{t.asset_name}</div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.side === "BUY" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">{t.shares.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-slate-700 dark:text-slate-300">${t.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">${t.notional.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-emerald-600 font-bold">{t.slippage_bps} bps</td>
                  <td className="py-3 text-slate-500">{t.venue}</td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">{t.time}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
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