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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
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
            className="p-2.5 rounded-xl bg-[#1c1e2d] hover:bg-[#25283b] text-zinc-300 border border-white/[0.06] transition-colors"
            title="Refresh log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setOverrideModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c1e2d] hover:bg-[#25283b] text-zinc-200 border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            CRO Manual Override
          </button>
        </div>
      </div>

      {/* Control Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/[0.06] bg-[#1c1e2d]">
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
          <div className="text-[10px] text-zinc-400 font-mono mt-1">3-Tier Circuit Breaker</div>
        </div>

        <div className="p-4 rounded-2xl border border-white/[0.06] bg-[#1c1e2d]">
          <div className="text-[10px] text-zinc-400 font-mono">OPERATIONAL MODE</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {status?.mode?.toUpperCase() || "AUTO"}
            </span>
            <button
              onClick={handleToggleMode}
              className="text-[10px] font-mono px-2.5 py-1 bg-[#151724] hover:bg-[#25283b] rounded-lg border border-white/[0.06] text-sky-400 cursor-pointer"
            >
              SWITCH
            </button>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            {status?.mode === "auto" ? "Autonomous Execution Active" : "Requires Human Approval"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/[0.06] bg-[#1c1e2d]">
          <div className="text-[10px] text-zinc-400 font-mono">TOTAL RECORDED EVENTS</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{entries.length}</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">Append-only audit ledger</div>
        </div>

        <div className="p-4 rounded-2xl border border-white/[0.06] bg-[#1c1e2d]">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                filterLevel === lvl
                  ? "bg-[#25283b] text-sky-400 border border-sky-500/30"
                  : "text-zinc-400 hover:text-zinc-300 bg-[#1c1e2d] border border-white/[0.04]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono text-zinc-400">
          Showing {filteredEntries.length} of {entries.length} events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#1c1e2d] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#141522] text-zinc-400 text-[11px] font-mono">
                <th className="py-3 px-4 font-medium">EVENT ID</th>
                <th className="py-3 px-4 font-medium">TIMESTAMP (UTC)</th>
                <th className="py-3 px-4 font-medium text-center">SEVERITY</th>
                <th className="py-3 px-4 font-medium">MODE</th>
                <th className="py-3 px-4 font-medium">TRIGGER & METRIC BREACH</th>
                <th className="py-3 px-4 font-medium">AUTONOMOUS ACTION EXECUTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEntries.map((item) => {
                const isFrozen = item.level === "FROZEN";
                const isRed = item.level === "RED";
                const isAmber = item.level === "AMBER";

                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{item.id}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isFrozen ? "text-red-400 bg-red-950/80 border-red-500 animate-pulse" :
                        isRed ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                        isAmber ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      }`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono uppercase text-zinc-400 text-[11px]">{item.mode}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      <div>{item.trigger}</div>
                      {item.metric_value > 0 && (
                        <div className="text-[10px] text-zinc-400 font-mono">
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
          <div className="max-w-md w-full rounded-2xl border border-white/[0.08] bg-[#1c1e2d] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
                  className="w-full rounded-xl bg-[#141522] border border-white/[0.08] px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-300 block mb-1">JUSTIFICATION REASON</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-[#141522] border border-white/[0.08] px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOverrideModal(false)}
                className="px-4 py-2 rounded-xl bg-[#25283b] hover:bg-[#2d3047] text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg cursor-pointer"
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
