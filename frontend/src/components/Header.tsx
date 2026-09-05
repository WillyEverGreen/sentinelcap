"use client";

import React, { useState, useEffect } from "react";
import { getSafeguardStatus, toggleSafeguardMode, CircuitBreakerStatus } from "@/lib/api";

export default function Header() {
  const [status, setStatus] = useState<CircuitBreakerStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(true);

  const refreshStatus = async () => {
    try {
      const s = await getSafeguardStatus();
      setStatus(s);
    } catch {
      setStatus({ status: "NORMAL", mode: "auto" });
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = async () => {
    if (!status) return;
    const newMode = status.mode === "auto" ? "manual" : "auto";
    try {
      await toggleSafeguardMode(newMode);
      await refreshStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const isNormal = status?.status === "NORMAL";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/[0.05] bg-[#131522]/95 backdrop-blur-md px-7 flex items-center justify-between gap-6 select-none font-sans">
      
      {/* Search Input - Rounded Pill matching reference image */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search assets, risk factors, or safeguards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 rounded-full bg-[#1a1d2e] border border-white/[0.06] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Circuit Breaker Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isNormal
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-sm shadow-emerald-500/10"
              : "text-rose-400 bg-rose-500/15 border-rose-500/30 animate-pulse"
          }`}
        >
          {isNormal ? (
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
          <span className="font-mono">{status?.status || "NORMAL"}</span>
        </div>

        {/* Safeguard Mode Switch */}
        <button
          onClick={handleToggleMode}
          title="Toggle Auto / Manual Safeguard Mode"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1d2e] hover:bg-[#22263d] border border-white/[0.06] text-xs font-mono text-slate-300 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-slate-400 text-[11px]">MODE:</span>
          <span className={status?.mode === "auto" ? "text-sky-400 font-bold" : "text-amber-400 font-bold"}>
            {status?.mode?.toUpperCase() || "AUTO"}
          </span>
        </button>

        {/* Notification Bell with indicator */}
        <div
          className="relative p-2 rounded-full bg-[#1a1d2e] text-slate-400 hover:text-white cursor-pointer border border-white/[0.06] hover:border-white/[0.12] transition-all"
          title="Notifications"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 ring-2 ring-[#131522]" />
        </div>

        {/* Theme Toggle Pill matching reference image */}
        <div className="flex items-center gap-1.5 bg-[#1a1d2e] py-1 px-2 rounded-full border border-white/[0.06]">
          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>

          <div
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-4 bg-[#2b304c] rounded-full p-0.5 flex items-center cursor-pointer transition-colors"
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm ${isDark ? "translate-x-4" : "translate-x-0"}`} />
          </div>

          <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* User Profile Avatar with dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06] cursor-pointer group">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md ring-1 ring-white/10">
              CR
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#131522]" />
          </div>
          <svg
            className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

      </div>

    </header>
  );
}
