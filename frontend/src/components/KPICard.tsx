"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  badgeType?: "success" | "warning" | "danger" | "neutral";
  icon: LucideIcon;
  target?: string;
  progress?: number; // 0 - 100
}

export default function KPICard({
  title,
  value,
  subtitle,
  badge,
  badgeType = "neutral",
  icon: Icon,
  target,
  progress,
}: KPICardProps) {
  const badgeColors = {
    success: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
    warning: "text-amber-400 bg-amber-950/60 border-amber-500/30",
    danger: "text-rose-400 bg-rose-950/60 border-rose-500/30",
    neutral: "text-zinc-400 bg-zinc-800/60 border-zinc-700/30",
  };

  const progressColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-sky-500",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm backdrop-blur-sm hover:border-zinc-700/80 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-white font-mono">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/40">
          <Icon className="w-5 h-5 text-sky-400" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && <span className="text-zinc-400 text-[11px]">{subtitle}</span>}
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColors[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1">
            <span>BUDGET UTILIZATION</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors[badgeType]}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {target && (
        <div className="mt-2 text-[10px] text-zinc-500 font-mono">
          LIMIT: <span className="text-zinc-300">{target}</span>
        </div>
      )}
    </div>
  );
}
