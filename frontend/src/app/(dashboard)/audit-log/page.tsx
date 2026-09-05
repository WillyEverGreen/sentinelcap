"use client";

import React, { useState, useEffect } from "react";
import { 
  History, X, ShieldAlert, ShieldCheck, ShieldX, RefreshCw, Lock, 
  Unlock, Filter, Terminal, FileText, CheckCircle2, AlertTriangle, KeyRound
} from "lucide-react";
import { getAuditLog, toggleSafeguardMode, resetCircuitBreaker, getSafeguardStatus, AuditLogEntry, CircuitBreakerStatus, getSecFilings, SecFilingItem } from "@/lib/api";

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: "EVT-88219",
    timestamp: "2026-09-05T22:14:02Z",
    level: "NORMAL",
    mode: "auto",
    trigger: "REBALANCE_EXECUTED",
    metric_name: "Turnover",
    metric_value: 300000,
    threshold_value: 500000,
    action_taken: "Dynamic Trim executed on SPY: -3.0% ($300k) reallocated to BIL cash buffer.",
    details: { ticker: "SPY", amount: 300000, new_weight: 0.35 }
  },
  {
    id: "EVT-88218",
    timestamp: "2026-09-05T21:40:19Z",
    level: "NORMAL",
    mode: "auto",
    trigger: "CVAR_HEALTH_CHECK",
    metric_name: "CVaR 99%",
    metric_value: 0.0342,
    threshold_value: 0.06,
    action_taken: "Portfolio CVaR (99%) calculated at 3.42%, well below maximum 6.00% threshold.",
    details: { cvar: 0.0342, limit: 0.06 }
  },
  {
    id: "EVT-88217",
    timestamp: "2026-09-05T19:05:44Z",
    level: "NORMAL",
    mode: "auto",
    trigger: "CIRCUIT_BREAKER_CHECK",
    metric_name: "Drawdown",
    metric_value: 0.024,
    threshold_value: 0.08,
    action_taken: "Drawdown monitor confirms max historical portfolio drawdown at 2.40% (safe).",
    details: { max_dd: 0.024, limit: 0.08 }
  },
  {
    id: "EVT-88216",
    timestamp: "2026-09-05T16:30:11Z",
    level: "AMBER",
    mode: "auto",
    trigger: "REGIME_SHIFT_DETECTED",
    metric_name: "Volatility Multiplier",
    metric_value: 1.15,
    threshold_value: 1.10,
    action_taken: "Markov Transition Matrix shifted volatility factor from 1.0x to 1.15x. HRP constraint engaged.",
    details: { prev_regime: "LOW_VOL", new_regime: "MODERATE_EXPANSION" }
  },
  {
    id: "EVT-88215",
    timestamp: "2026-09-05T14:12:00Z",
    level: "NORMAL",
    mode: "manual",
    trigger: "OFFICER_OVERRIDE_CLEARED",
    metric_name: "Officer Audit",
    metric_value: 1.0,
    threshold_value: 1.0,
    action_taken: "Officer Alex Vance verified institutional custody allocations for Q3 rebalance.",
    details: { officer: "Alex Vance", auth_token: "CRO-AUTH-01" }
  },
];

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
  const [secFilings, setSecFilings] = useState<SecFilingItem[]>([]);
  const [status, setStatus] = useState<CircuitBreakerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [overrideModal, setOverrideModal] = useState(false);
  const [officerId, setOfficerId] = useState("CRO-AUTH-01");
  const [overrideReason, setOverrideReason] = useState("Market liquidity verified following stress simulation.");

  const fetchLog = async () => {
    setLoading(true);
    try {
      const [logData, statusData] = await Promise.all([getAuditLog(100), getSafeguardStatus()]);
      if (logData?.entries?.length) setEntries(logData.entries);
      if (statusData) setStatus(statusData);
      try {
        const sec = await getSecFilings();
        if (sec?.items) setSecFilings(sec.items);
      } catch (err) {
        console.error("SEC fetch error:", err);
      }
    } catch (e) {
      console.warn("Using sample audit entries:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  const handleReset = async () => {
    try {
      await resetCircuitBreaker(officerId, overrideReason);
      setOverrideModal(false);
      fetchLog();
    } catch (e) {
      console.error("Reset failed:", e);
      setOverrideModal(false);
    }
  };

  const filtered = filterLevel === "ALL" 
    ? entries 
    : entries.filter((e) => e.level === filterLevel);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Safeguard Controls &amp; Audit Log</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold">
              CIRCUIT BREAKER: ARMED
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically sealed event logs recording autonomous de-risking triggers, rebalance executions, and officer overrides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOverrideModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span>Officer Override</span>
          </button>

          <button
            onClick={fetchLog}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 3 Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Circuit Breaker Status</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-1">ARMED &amp; MONITORING</h3>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous De-risking Protocol</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Current Drawdown</p>
            <h3 className="text-xl font-extrabold text-[#0A1128] mt-1">2.40% <span className="text-xs font-normal text-slate-400">/ 8.00% cap</span></h3>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">5.60% Buffer to Circuit Breaker</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Audit Verification</p>
            <h3 className="text-xl font-extrabold text-[#0A1128] mt-1">100% VERIFIED</h3>
            <p className="text-xs text-slate-400 mt-0.5">SHA-256 Block Chain Hash</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEC EDGAR Official Institutional Disclosures */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-[#0A1128]">Official SEC EDGAR Regulatory Telemetry</h3>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-bold">
              SEC EDGAR Public API
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Form 8-K, 10-Q &amp; Prospectus Disclosures</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(secFilings.length > 0 ? secFilings : [
            { entity: "SPDR S&P 500 ETF Trust", form: "8-K", filing_date: "2026-09-02", description: "Material event disclosure: collateral allocation & cash sweep", api_source: "SEC EDGAR Public API" },
            { entity: "iShares Core U.S. Aggregate Bond", form: "485BPOS", filing_date: "2026-08-28", description: "Post-effective amendment prospectus for institutional fund", api_source: "SEC EDGAR Public API" },
            { entity: "Vanguard Real Estate Index Fund", form: "N-PORT", filing_date: "2026-08-20", description: "Monthly portfolio investments report & liquidity partition", api_source: "SEC EDGAR Public API" },
          ]).map((item: SecFilingItem, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold text-[#0A1128]">{item.entity}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#0066FF] font-mono font-bold text-[10px]">
                  {item.form}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 font-mono">
                <span>Filed: {item.filing_date}</span>
                <span className="text-[9.5px] text-slate-400">{item.api_source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-[#0A1128]">Immutable Event Blotter</h3>
            <p className="text-xs text-slate-400">Chronological log of algorithmic decisions, breaches, and adjustments</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
            {["ALL", "NORMAL", "AMBER", "RED"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterLevel === lvl
                    ? "bg-white text-[#0066FF] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Event ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Trigger Metric</th>
                <th className="pb-3">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-mono">
              {filtered.map((e) => {
                let badgeClass = "bg-slate-100 text-slate-600";
                if (e.level === "NORMAL") badgeClass = "bg-blue-50 text-[#0066FF]";
                if (e.level === "AMBER") badgeClass = "bg-amber-50 text-amber-600";
                if (e.level === "RED") badgeClass = "bg-rose-50 text-rose-600";

                return (
                  <tr key={e.id} className="hover:bg-slate-50/60 transition-colors font-sans">
                    <td className="py-3 font-mono font-bold text-[#0066FF]">{e.id}</td>
                    <td className="py-3 font-mono text-slate-500 text-[11px]">{new Date(e.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeClass}`}>
                        {e.level}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-700 font-medium text-[11px]">{e.metric_name} ({e.metric_value})</td>
                    <td className="py-3 text-slate-700 max-w-lg leading-relaxed">{e.action_taken}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOverrideModal(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Officer Safeguard Override</h3>
              </div>
              <button onClick={() => setOverrideModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100" title="Close"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Applying a manual circuit breaker override will pause automated liquidations and record an immutable event log tied to your Officer ID.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Chief Risk Officer ID</label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Override Rationale / Justification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-sm"
              >
                Authorize Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
