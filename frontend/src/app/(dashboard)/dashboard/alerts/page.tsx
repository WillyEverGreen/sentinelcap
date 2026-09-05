"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, ShieldCheck, Flame, Zap, RefreshCw, Sliders, ExternalLink } from "lucide-react";

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  timestamp: string;
  desc: string;
  actionTitle: string;
  actionHref: string;
}

const SAMPLE_ALERTS: AlertItem[] = [
  {
    id: "ALT-1092",
    severity: "CRITICAL",
    title: "Drawdown Buffer Warning: SPY Intraday Drop -2.1%",
    timestamp: "10 mins ago",
    desc: "S&P 500 equity allocation dropped 2.1% following Fed rate statements. Portfolio drawdown reached 2.40%, approaching the 8.00% Circuit Breaker ceiling.",
    actionTitle: "Trigger Rebalance",
    actionHref: "/optimize",
  },
  {
    id: "ALT-1091",
    severity: "WARNING",
    title: "Markov Regime Shift: Moderate Volatility Engaged",
    timestamp: "1 hour ago",
    desc: "Cross-asset correlation between Equities and Bonds increased from -0.15 to +0.22. HRP risk budget reallocated 2.0% to Gold (GLD) safe haven.",
    actionTitle: "View Regime",
    actionHref: "/stress-test",
  },
  {
    id: "ALT-1090",
    severity: "INFO",
    title: "Autonomous Cash Sweep Completed: $45,000 BIL",
    timestamp: "3 hours ago",
    desc: "Collateral cash buffer topped up to maintain 10-day liquidity horizon ratio above 90%. All institutional requirements met.",
    actionTitle: "Audit Blotter",
    actionHref: "/audit-log",
  },
  {
    id: "ALT-1089",
    severity: "INFO",
    title: "Mean-CVaR Optimization Frontier Re-computed",
    timestamp: "6 hours ago",
    desc: "Daily Sharpe-maximizing frontier points regenerated across 500 historical trading days with alpha=0.95 tail-risk constraint.",
    actionTitle: "View Frontier",
    actionHref: "/optimize",
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(SAMPLE_ALERTS);

  const clearAll = () => {
    setAlerts([]);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">War Room Alerts &amp; Incident Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold">
              Autonomous Monitor
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time threshold breaches, market dislocation warnings, and safeguard circuit breaker activations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearAll}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Acknowledge All
          </button>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Run Scenario Simulation</span>
          </Link>
        </div>
      </div>

      {/* Status Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-slate-50 border border-blue-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A1128]">All Autonomous Safeguards Armed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Circuit breaker standing by at 8.00% max portfolio drawdown threshold.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Active Alerts</p>
            <p className="text-base font-extrabold text-[#0A1128]">{alerts.length}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <p className="text-slate-400 font-medium">Circuit State</p>
            <p className="text-base font-extrabold text-emerald-600">NORMAL</p>
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">All Alerts Cleared</h4>
            <p className="text-xs text-slate-400">All risk parameters and asset allocations are within institutional bounds.</p>
          </div>
        ) : (
          alerts.map((a) => {
            let borderColor = "border-slate-100";
            let badgeBg = "bg-blue-50 text-[#0066FF]";
            let Icon = Bell;

            if (a.severity === "CRITICAL") {
              borderColor = "border-rose-200 bg-rose-50/20";
              badgeBg = "bg-rose-50 text-rose-600 border border-rose-200";
              Icon = Flame;
            } else if (a.severity === "WARNING") {
              borderColor = "border-amber-200 bg-amber-50/20";
              badgeBg = "bg-amber-50 text-amber-600 border border-amber-200";
              Icon = AlertTriangle;
            }

            return (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${badgeBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeBg}`}>
                        {a.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-medium">{a.id}</span>
                      <span className="text-xs text-slate-400">• {a.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0A1128]">{a.title}</h4>
                    <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{a.desc}</p>
                  </div>
                </div>

                <Link
                  href={a.actionHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0066FF] hover:underline self-end md:self-center flex-shrink-0"
                >
                  <span>{a.actionTitle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
