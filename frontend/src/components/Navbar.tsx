"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, ShieldCheck, ShieldX, Activity, Cpu, Sliders, AlertTriangle, 
  RefreshCw, History, ExternalLink, Lock 
} from "lucide-react";
import { getSafeguardStatus, toggleSafeguardMode, resetCircuitBreaker, CircuitBreakerStatus } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<CircuitBreakerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  const refreshStatus = async () => {
    try {
      const s = await getSafeguardStatus();
      setStatus(s);
    } catch {
      // Offline fallback
      setStatus({
        status: "NORMAL",
        mode: "auto",
      });
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 6000);
    const timeInterval = setInterval(() => {
      setTimeStr(new Date().toUTCString().slice(17, 25) + " UTC");
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleToggleMode = async () => {
    if (!status) return;
    setLoading(true);
    const newMode = status.mode === "auto" ? "manual" : "auto";
    try {
      await toggleSafeguardMode(newMode);
      await refreshStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetCircuitBreaker("CRO-DASH-01", "Manual supervisor clear");
      await refreshStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Risk Command", icon: Activity },
    { href: "/optimize", label: "Capital Rebalancer", icon: Sliders },
    { href: "/stress-test", label: "War Room Stress", icon: AlertTriangle },
    { href: "/audit-log", label: "Safeguard Audit", icon: History },
  ];

  const statusColor = 
    status?.status === "NORMAL" ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40" :
    status?.status === "AMBER" ? "text-amber-400 bg-amber-950/60 border-amber-500/40" :
    status?.status === "RED" ? "text-rose-400 bg-rose-950/60 border-rose-500/40 animate-pulse" :
    "text-red-500 bg-red-950/80 border-red-600 animate-bounce";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-500/10">
              <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                <Cpu className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base">SENTINEL</span>
                <span className="font-bold tracking-tight text-sky-400 text-base">CAP</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">v1.0</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider">INSTITUTIONAL CAPITAL CONTROL</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-sky-400" : "text-zinc-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Telemetry & Safeguard Controls */}
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="hidden sm:block text-[11px] font-mono text-zinc-500 bg-zinc-900/60 px-2.5 py-1 rounded border border-zinc-800">
            {timeStr || "TELEMETRY LIVE"}
          </div>

          {/* Circuit Breaker Status Badge */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-semibold ${statusColor}`}>
            {status?.status === "NORMAL" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {status?.status === "AMBER" && <ShieldAlert className="w-4 h-4 text-amber-400" />}
            {status?.status === "RED" && <ShieldAlert className="w-4 h-4 text-rose-400" />}
            {status?.status === "FROZEN" && <ShieldX className="w-4 h-4 text-red-500" />}
            <span className="tracking-wide">
              {status?.status || "NORMAL"}
            </span>
          </div>

          {/* Auto / Manual Mode Switch */}
          <button
            onClick={handleToggleMode}
            disabled={loading}
            title="Click to toggle Autonomous vs Manual Mode"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <span className="text-zinc-500">MODE:</span>
            <span className={`font-semibold ${status?.mode === "auto" ? "text-sky-400" : "text-amber-400"}`}>
              {status?.mode?.toUpperCase() || "AUTO"}
            </span>
          </button>

          {/* CRO Emergency Override when Frozen */}
          {status?.status === "FROZEN" && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg animate-pulse"
            >
              <Lock className="w-3.5 h-3.5" />
              CRO RESET
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={refreshStatus}
            title="Poll fresh risk telemetry"
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

      </div>
    </header>
  );
}
