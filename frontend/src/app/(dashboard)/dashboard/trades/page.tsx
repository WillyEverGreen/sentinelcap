"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Layers,
  Building2
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { getExecutionTrades, ExecutionTrade, TradesResponse } from "@/lib/api";

const INITIAL_TRADES_DATA: TradesResponse = {
  summary: {
    total_filled_volume: 697872.0,
    total_orders: 6,
    filled_orders: 6,
    fill_rate_pct: 100.0,
    avg_slippage_bps: 0.90,
    slippage_target_bps: 2.5,
    primary_venue: "Goldman Sachs Prime",
    currency: "USD",
  },
  intraday_curve: [
    { hour: "09:30", volume: 145000, slippage: 0.65, orders: 4 },
    { hour: "10:30", volume: 210000, slippage: 1.05, orders: 6 },
    { hour: "11:30", volume: 85000, slippage: 0.72, orders: 3 },
    { hour: "12:30", volume: 65000, slippage: 0.41, orders: 2 },
    { hour: "13:30", volume: 95000, slippage: 0.54, orders: 3 },
    { hour: "14:30", volume: 380000, slippage: 1.18, orders: 9 },
    { hour: "15:30", volume: 180000, slippage: 0.89, orders: 5 },
  ],
  trades: [
    {
      order_id: "ORD-99014",
      ticker: "SPY",
      asset_name: "S&P 500 ETF Trust",
      side: "SELL",
      shares: 643,
      price: 543.78,
      notional: 350000.0,
      slippage_bps: 0.82,
      venue: "Goldman Sachs Prime",
      time: "14:28:10",
      status: "FILLED",
    },
    {
      order_id: "ORD-99013",
      ticker: "GLD",
      asset_name: "SPDR Gold Shares",
      side: "BUY",
      shares: 424,
      price: 282.56,
      notional: 120000.0,
      slippage_bps: 1.10,
      venue: "IEX Direct",
      time: "14:26:45",
      status: "FILLED",
    },
    {
      order_id: "ORD-99012",
      ticker: "BIL",
      asset_name: "1-3M Treasury Bills",
      side: "BUY",
      shares: 434,
      price: 103.59,
      notional: 45000.0,
      slippage_bps: 0.21,
      venue: "Fed Liquidity Gateway",
      time: "13:50:02",
      status: "FILLED",
    },
    {
      order_id: "ORD-99011",
      ticker: "AGG",
      asset_name: "Core US Aggregate Bond",
      side: "SELL",
      shares: 825,
      price: 103.62,
      notional: 85500.0,
      slippage_bps: 0.94,
      venue: "Goldman Sachs Prime",
      time: "12:15:33",
      status: "FILLED",
    },
    {
      order_id: "ORD-99010",
      ticker: "VNQ",
      asset_name: "Vanguard Real Estate",
      side: "BUY",
      shares: 648,
      price: 57.02,
      notional: 37000.0,
      slippage_bps: 1.42,
      venue: "IEX Direct",
      time: "11:04:19",
      status: "FILLED",
    },
    {
      order_id: "ORD-99009",
      ticker: "EFA",
      asset_name: "iShares MSCI EAFE",
      side: "BUY",
      shares: 664,
      price: 90.79,
      notional: 60372.0,
      slippage_bps: 1.05,
      venue: "Goldman Sachs Prime",
      time: "10:22:40",
      status: "FILLED",
    },
  ],
};

export default function TradesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tradesData, setTradesData] = useState<TradesResponse>(INITIAL_TRADES_DATA);
  const [filterSide, setFilterSide] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [hoveredHour, setHoveredHour] = useState<any | null>(null);

  const fetchTrades = async () => {
    try {
      setRefreshing(true);
      const data = await getExecutionTrades();
      setTradesData(data);
    } catch (e) {
      console.error("Failed to load execution trades:", e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTrades();
  }, []);

  const trades = tradesData?.trades || [];
  const summary = tradesData?.summary || {
    total_filled_volume: trades.reduce((acc, t) => acc + t.notional, 0),
    total_orders: trades.length,
    filled_orders: trades.filter((t) => t.status === "FILLED").length,
    fill_rate_pct: trades.length ? (trades.filter((t) => t.status === "FILLED").length / trades.length) * 100 : 100,
    avg_slippage_bps: 0.88,
    slippage_target_bps: 2.5,
    primary_venue: "Goldman Sachs Prime",
    currency: "USD",
  };

  const hourlyVolumeData = tradesData?.intraday_curve || [
    { hour: "09:30", volume: 145000, slippage: 0.65, orders: 4 },
    { hour: "10:30", volume: 210000, slippage: 1.05, orders: 6 },
    { hour: "11:30", volume: 85000, slippage: 0.72, orders: 3 },
    { hour: "12:30", volume: 65000, slippage: 0.41, orders: 2 },
    { hour: "13:30", volume: 95000, slippage: 0.54, orders: 3 },
    { hour: "14:30", volume: 380000, slippage: 1.18, orders: 9 },
    { hour: "15:30", volume: 180000, slippage: 0.89, orders: 5 },
  ];

  const filteredTrades = trades.filter((t) => {
    const matchesSide = filterSide === "ALL" || t.side === filterSide;
    const matchesSearch =
      t.ticker.toLowerCase().includes(search.toLowerCase()) ||
      t.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      t.venue.toLowerCase().includes(search.toLowerCase()) ||
      t.order_id.toLowerCase().includes(search.toLowerCase());
    return matchesSide && matchesSearch;
  });

  const activeHour = hoveredHour || hourlyVolumeData[hourlyVolumeData.length - 2] || hourlyVolumeData[0];

  // Export real CSV function
  const handleExportCSV = () => {
    if (!trades.length) return;
    const headers = ["Order ID", "Ticker", "Asset Name", "Side", "Shares", "Price (USD)", "Notional (USD)", "Slippage (bps)", "Execution Venue", "Execution Time", "Status"];
    const rows = filteredTrades.map((t) => [
      t.order_id,
      t.ticker,
      `"${t.asset_name}"`,
      t.side,
      t.shares,
      t.price.toFixed(2),
      t.notional.toFixed(2),
      t.slippage_bps.toFixed(2),
      `"${t.venue}"`,
      t.time,
      t.status
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sentinel_execution_blotter_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTradesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const vol = payload.find((p: any) => p.dataKey === "volume")?.value || 0;
      const slip = payload.find((p: any) => p.dataKey === "slippage")?.value || 0;
      const item = hourlyVolumeData.find((h) => h.hour === label);

      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl text-xs space-y-2 min-w-[210px] select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-slate-800">
            <span className="text-xs font-black uppercase">Window: {label} EST</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] font-mono text-[10.5px] font-bold border border-blue-200">
              {item?.orders || 0} Orders
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0066FF]" />
                <span className="text-slate-500 font-medium">Executed Volume:</span>
              </div>
              <span className="font-mono font-bold text-slate-900">${vol.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500 font-medium">Realized Slippage:</span>
              </div>
              <span className="font-mono font-bold text-emerald-600">{slip} bps</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTrades}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Real-time Blotter"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin text-[#0066FF]" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Blotter CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 Dynamic KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Total Filled Volume (Today)</p>
          <h3 className="text-2xl font-extrabold text-[#0A1128] mt-1">
            ${Math.round(summary.total_filled_volume).toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            {summary.filled_orders}/{summary.total_orders} Algorithmic Orders
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Average Execution Slippage</p>
          <h3 className="text-2xl font-extrabold text-[#0066FF] mt-1">
            {summary.avg_slippage_bps.toFixed(2)} bps
          </h3>
          <p className="text-xs text-slate-400 mt-1">Target: &lt; {summary.slippage_target_bps} bps</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Fill Completion Rate</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            {summary.fill_rate_pct.toFixed(1)}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {summary.total_orders - summary.filled_orders === 0 ? "Zero unfulfilled orders" : `${summary.total_orders - summary.filled_orders} pending`}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Primary Execution Venue</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 truncate">
            {summary.primary_venue}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Direct Prime Route</p>
        </div>
      </div>

      {/* Intraday Execution Volume & Slippage Curve */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[#0A1128] tracking-tight">
                Intraday Execution Volume & Slippage Curve
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-extrabold">
                TWAP / VWAP Routed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Executed dollar volume alongside realized market impact slippage across trading intervals
            </p>
          </div>

          {/* Active window readout strip */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-500 font-medium">Window: <strong className="text-slate-800">{activeHour.hour} EST</strong></span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#0066FF]" />
              <span className="text-slate-500">Volume:</span>
              <strong className="text-slate-800 font-bold">${activeHour.volume.toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Slippage:</span>
              <strong className="text-emerald-600 font-bold">{activeHour.slippage} bps</strong>
            </div>
          </div>
        </div>

        <div className="w-full h-[240px] min-w-0">
          {mounted && (
            <ResponsiveContainer width="100%" height={240} minWidth={100} minHeight={240}>
              <ComposedChart
                data={hourlyVolumeData}
                margin={{ top: 15, right: 25, left: 15, bottom: 5 }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setHoveredHour(e.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredHour(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10B981"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(val) => `${val} bps`}
                />
                <Tooltip content={<CustomTradesTooltip />} cursor={{ fill: "rgba(0, 102, 255, 0.04)" }} />
                <Bar
                  yAxisId="left"
                  dataKey="volume"
                  fill="#0066FF"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="slippage"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filter Toolbar & Orders Blotter Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker, asset, venue, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Filter Side:</span>
            {(["ALL", "BUY", "SELL"] as const).map((s) => {
              const count = s === "ALL" ? trades.length : trades.filter((t) => t.side === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilterSide(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterSide === s
                      ? s === "BUY"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                        : s === "SELL"
                        ? "bg-rose-50 text-rose-700 border border-rose-300 shadow-xs"
                        : "bg-[#0066FF] text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s} <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 px-3">Asset</th>
                <th className="pb-3 px-3">Side</th>
                <th className="pb-3 px-3 text-right">Shares</th>
                <th className="pb-3 px-3 text-right">Fill Price</th>
                <th className="pb-3 px-3 text-right">Notional</th>
                <th className="pb-3 px-4 text-right">Slippage</th>
                <th className="pb-3 px-4">Execution Venue</th>
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 pl-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-mono">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No algorithmic orders matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isBuy = t.side === "BUY";
                  return (
                    <tr key={t.order_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-slate-700 font-mono">{t.order_id}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-sans font-bold text-[#0066FF]">{t.ticker}</div>
                        <div className="text-[10.5px] font-sans text-slate-400 font-normal">{t.asset_name}</div>
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            isBuy
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {t.side}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700">{t.shares.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right text-slate-900 font-bold">${t.price.toFixed(2)}</td>
                      <td className="py-3.5 px-3 text-right text-slate-900 font-bold">${Math.round(t.notional).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-semibold ${t.slippage_bps > 1.0 ? "text-amber-600" : "text-emerald-600"}`}>
                          {t.slippage_bps.toFixed(2)} bps
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-600 font-medium">{t.venue}</td>
                      <td className="py-3.5 px-3 text-slate-400">{t.time} EST</td>
                      <td className="py-3.5 pl-3 text-center font-sans">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-400 font-sans">
          <span>Showing {filteredTrades.length} of {trades.length} algorithmic rebalance executions</span>
          <span className="font-mono text-emerald-600 font-medium">All orders settled via institutional smart routing engine</span>
        </div>
      </div>
    </div>
  );
}
