"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, AlertTriangle, ShieldAlert, CheckCircle2, ShieldCheck, 
  Flame, Zap, RefreshCw, Sliders, ExternalLink, Globe, Newspaper, Radio
} from "lucide-react";
import { getLiveNews, LiveNewsItem } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState<"incidents" | "news">("incidents");
  const [alerts, setAlerts] = useState<AlertItem[]>(SAMPLE_ALERTS);
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await getLiveNews();
      setNews(res.items);
    } catch (e) {
      console.error("News fetch failed:", e);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const clearAll = () => {
    setAlerts([]);
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">War Room Incident Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold">
              High Priority
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time threshold breaches, market shocks, and live financial wire intelligence.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("incidents")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "incidents"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Risk Incidents ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "news"
                ? "bg-white text-[#0066FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#0066FF] animate-pulse" />
            <span>Finnhub Live Wire ({news.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Risk Incidents */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Safeguard Alerts ({alerts.length})
            </span>
            {alerts.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
              >
                Dismiss All Incidents
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All Safeguard Systems Clear</h3>
              <p className="text-xs text-slate-400 mt-1">
                No active threshold breaches or liquidity stress alerts detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-5 bg-white shadow-sm transition-all hover:shadow-md ${
                    alert.severity === "CRITICAL"
                      ? "border-rose-200/90"
                      : alert.severity === "WARNING"
                      ? "border-amber-200/90"
                      : "border-blue-200/90"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          alert.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-600"
                            : alert.severity === "WARNING"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-[#0066FF]"
                        }`}
                      >
                        {alert.severity === "CRITICAL" ? (
                          <Flame className="w-4 h-4" />
                        ) : alert.severity === "WARNING" ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#0A1128]">{alert.title}</h3>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              alert.severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : alert.severity === "WARNING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.desc}</p>
                        <span className="text-[11px] text-slate-400 font-mono mt-2 block">
                          Detected: {alert.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Link
                        href={alert.actionHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <span>{alert.actionTitle}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Finnhub Live Financial Wire */}
      {activeTab === "news" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Breaking Financial Wire
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-bold">
                Finnhub API Connected
              </span>
            </div>
            <button
              onClick={fetchNews}
              disabled={loadingNews}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066FF] hover:underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? "animate-spin" : ""}`} />
              <span>{loadingNews ? "Syncing Wire..." : "Refresh News"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded">
                      {item.source || "Market Wire"}
                    </span>
                    <span className="font-mono">{item.timestamp}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0A1128] leading-snug line-clamp-2 mb-2">
                    {item.headline}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Category: {item.category}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0066FF] hover:underline"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
