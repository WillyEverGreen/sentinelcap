"use client";

import React from "react";

interface AllocationItem {
  ticker: string;
  name: string;
  category: string;
  weight: number;
  dollarValue: number;
  liquidityDays: number;
}

interface AllocationChartProps {
  allocations: AllocationItem[];
  totalValue: number;
}

const CATEGORY_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Equity: { bar: "bg-sky-500", text: "text-sky-400", bg: "bg-sky-500/10" },
  "Fixed Income": { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  Commodity: { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  "Real Estate": { bar: "bg-purple-500", text: "text-purple-400", bg: "bg-purple-500/10" },
  Cash: { bar: "bg-cyan-400", text: "text-cyan-300", bg: "bg-cyan-400/10" },
};

export default function AllocationChart({ allocations, totalValue }: AllocationChartProps) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Multi-Asset Allocation & Liquidity Horizons</h3>
          <p className="text-xs text-zinc-400">Current balance sheet distribution across regulatory risk buckets</p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded border border-zinc-700/40">
          Total: ${(totalValue / 1_000_000).toFixed(1)}M
        </span>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-800 mb-5 p-[1px]">
        {allocations.map((item) => {
          const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Equity"];
          const widthPct = item.weight * 100;
          return (
            <div
              key={item.ticker}
              style={{ width: `${widthPct}%` }}
              title={`${item.ticker}: ${(item.weight * 100).toFixed(1)}% ($${(item.dollarValue / 1000).toFixed(0)}k)`}
              className={`h-full ${color.bar} transition-all duration-300 hover:brightness-125 cursor-pointer first:rounded-l-full last:rounded-r-full`}
            />
          );
        })}
      </div>

      {/* Asset Table Breakdown */}
      <div className="space-y-2">
        {allocations.map((item) => {
          const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Equity"];
          return (
            <div
              key={item.ticker}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800/60 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 font-bold font-mono text-white text-xs">{item.ticker}</span>
                <span className="text-zinc-400 text-xs hidden sm:inline">{item.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border border-current/20 ${color.bg} ${color.text}`}>
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-right">
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  LH: {item.liquidityDays}d
                </span>
                <div className="w-20 font-mono text-zinc-300">
                  ${(item.dollarValue / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
                </div>
                <div className="w-14 font-mono font-semibold text-white">
                  {(item.weight * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
