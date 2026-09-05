"use client";

import React, { useState } from "react";
import { Settings, Sliders, Shield, Lock, Bell, CheckCircle2, Save, Key, Database, RefreshCw, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const [maxDrawdown, setMaxDrawdown] = useState(8.0);
  const [cvarAlpha, setCvarAlpha] = useState(99);
  const [minCash, setMinCash] = useState(5.0);
  const [assetCap, setAssetCap] = useState(40.0);
  const [turnoverBps, setTurnoverBps] = useState(10);
  const [autoHedge, setAutoHedge] = useState(true);
  const [saved, setSaved] = useState(false);

  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] dark:text-white tracking-tight">Risk Parameters &amp; Engine Governance</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[11px] font-bold">
              Institutional Limits
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Define institutional risk limits, circuit breaker trigger ceilings, and automated optimization constraints.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Parameters Saved!" : "Save Parameters"}</span>
        </button>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Safeguard Circuit Breaker Limits */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Safeguard Circuit Breakers</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Max Drawdown Limit</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{maxDrawdown.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.5"
                value={maxDrawdown}
                onChange={(e) => setMaxDrawdown(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Triggers automated 25% cash buffer liquidation when breached.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">CVaR Tail-Risk Confidence (α)</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{cvarAlpha}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[95, 99].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCvarAlpha(val)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      cvarAlpha === val
                        ? "bg-blue-50 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] text-[#0066FF] dark:text-[#38BDF8]"
                        : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    CVaR {val}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Autonomous De-risking Protocol</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">Execute emergency liquidity rebalance automatically</p>
              </div>
              <input
                type="checkbox"
                checked={autoHedge}
                onChange={(e) => setAutoHedge(e.target.checked)}
                className="w-4 h-4 accent-[#0066FF] dark:accent-[#38BDF8] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Appearance & Theme Settings */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Sun className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Appearance &amp; Display Theme</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose your interface color mode. System mode automatically adapts to your operating system day/night preferences.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: <Sun className="w-5 h-5 text-amber-500" />, desc: "High contrast daytime" },
                { id: "dark", label: "Dark", icon: <Moon className="w-5 h-5 text-blue-400" />, desc: "Eye comfort obsidian" },
                { id: "system", label: "System", icon: <Laptop className="w-5 h-5 text-slate-400" />, desc: "Auto OS sync" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id as any)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    theme === opt.id
                      ? "bg-blue-50/60 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] shadow-xs"
                      : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-[#131B2E] shadow-2xs">
                    {opt.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${theme === opt.id ? "text-[#0066FF] dark:text-[#38BDF8]" : "text-slate-800 dark:text-slate-200"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between font-semibold">
                <span>Active Theme Mode</span>
                <span className="font-mono uppercase text-[#0066FF] dark:text-[#38BDF8]">{theme}</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">
                Persisted in localStorage with instant pre-render theme stamping (zero screen flash).
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Portfolio Constraints */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Portfolio Bounds</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Max Single Asset Allocation</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{assetCap.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="60.0"
                step="5.0"
                value={assetCap}
                onChange={(e) => setAssetCap(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Minimum Cash Buffer</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{minCash.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="20.0"
                step="1.0"
                value={minCash}
                onChange={(e) => setMinCash(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Execution & Friction */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Database className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Execution &amp; Prime Brokerage</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Turnover Friction Cost</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{turnoverBps} bps</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={turnoverBps}
                onChange={(e) => setTurnoverBps(parseInt(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Primary Execution Venue</span>
              <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">Goldman Sachs Prime Custody (Automated DMA routing)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
