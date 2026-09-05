"use client";

import React, { useState, useEffect } from "react";
import { 
  History, ShieldAlert, ShieldCheck, ShieldX, RefreshCw, Lock, 
  Unlock, Filter, Terminal, FileText, CheckCircle2 
} from "lucide-react";
import { getAuditLog, toggleSafeguardMode, resetCircuitBreaker, getSafeguardStatus, AuditLogEntry, CircuitBreakerStatus } from "@/lib/api";

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [status, setStatus] = useState<CircuitBreakerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [overrideModal, setOverrideModal] = useState(false);
  const [officerId, setOfficerId] = useState("CRO-AUTH-01");
  const [overrideReason, setOverrideReason] = useState("Market liquidity restored following stress test simulation.");

  const fetchLog = async () => {
    setLoading(true);
    try {
      const [logData, statusData] = await Promise.all([getAuditLog(100), getSafeguardStatus()]);
      setEntries(logData.entries);
      setStatus(statusData);
    } catch (e) {
      console.error("Audit fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = async () => {
    if (!status) return;
    const nextMode = status.mode === "auto" ? "manual" : "auto";
    try {
      await toggleSafeguardMode(nextMode);
      await fetchLog();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteOverride = async () => {
    try {
      await resetCircuitBreaker(officerId, overrideReason);
      setOverrideModal(false);
      await fetchLog();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredEntries = filterLevel === "ALL" 
    ? entries 
    : entries.filter((e) => e.level === filterLevel);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-sky-400" />
            Autonomous Safeguard Audit Trail & Governance Log
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable regulatory telemetry record of risk threshold breaches, circuit breaker interventions, and CRO overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLog}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Refresh log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setOverrideModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            CRO Manual Override
          </button>
        </div>
      </div>

      {/* Control Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-[10px] text-zinc-400 font-mono">CURRENT STATUS</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${
              status?.status === "NORMAL" ? "text-emerald-400" :
              status?.status === "AMBER" ? "text-amber-400" :
              status?.status === "RED" ? "text-rose-400" : "text-red-500"
            }`}>
              {status?.status || "NORMAL"}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">3-Tier Circuit Breaker</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-[10px] text-zinc-400 font-mono">OPERATIONAL MODE</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {status?.mode?.toUpperCase() || "AUTO"}
            </span>
            <button
              onClick={handleToggleMode}
              className="text-[10px] font-mono px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 text-sky-400"
            >
              SWITCH
            </button>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">
            {status?.mode === "auto" ? "Autonomous Execution Active" : "Requires Human Approval"}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-[10px] text-zinc-400 font-mono">TOTAL RECORDED EVENTS</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{entries.length}</div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Append-only audit ledger</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="text-[10px] text-zinc-400 font-mono">LAST TELEMETRY EVAL</div>
          <div className="text-xs font-mono text-zinc-300 mt-2 truncate">
            {status?.last_evaluated ? new Date(status.last_evaluated).toLocaleTimeString() : "Live Active"}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> System Synchronized
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "NORMAL", "AMBER", "RED", "FROZEN"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                filterLevel === lvl
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300 bg-zinc-900/40"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Showing {filteredEntries.length} of {entries.length} events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 text-[11px] font-mono">
                <th className="py-3 px-4 font-medium">EVENT ID</th>
                <th className="py-3 px-4 font-medium">TIMESTAMP (UTC)</th>
                <th className="py-3 px-4 font-medium text-center">SEVERITY</th>
                <th className="py-3 px-4 font-medium">MODE</th>
                <th className="py-3 px-4 font-medium">TRIGGER & METRIC BREACH</th>
                <th className="py-3 px-4 font-medium">AUTONOMOUS ACTION EXECUTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredEntries.map((item) => {
                const isFrozen = item.level === "FROZEN";
                const isRed = item.level === "RED";
                const isAmber = item.level === "AMBER";
                const isNormal = item.level === "NORMAL";

                return (
                  <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{item.id}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isFrozen ? "text-red-400 bg-red-950/80 border-red-500 animate-pulse" :
                        isRed ? "text-rose-400 bg-rose-950/60 border-rose-500/40" :
                        isAmber ? "text-amber-400 bg-amber-950/60 border-amber-500/40" :
                        "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
                      }`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono uppercase text-zinc-400 text-[11px]">{item.mode}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      <div>{item.trigger}</div>
                      {item.metric_value > 0 && (
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Value: {(item.metric_value * 100).toFixed(1)}% | Limit: {(item.threshold_value * 100).toFixed(1)}%
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-200 font-medium font-mono text-[11px]">
                      {item.action_taken}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRO Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chief Risk Officer Override</h3>
                <p className="text-xs text-zinc-400">Clear emergency freezes or reset circuit breaker state</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-zinc-300 block mb-1">CRO OFFICER CREDENTIAL</label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-300 block mb-1">JUSTIFICATION REASON</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
              >
                CONFIRM OVERRIDE & RESET
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
