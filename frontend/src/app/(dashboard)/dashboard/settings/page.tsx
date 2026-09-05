"use client";

import React, { useState } from "react";
import { Settings, Sliders, Shield, Lock, Bell, CheckCircle2, Save, Key, Database, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [maxDrawdown, setMaxDrawdown] = useState(8.0);
  const [cvarAlpha, setCvarAlpha] = useState(99);
  const [minCash, setMinCash] = useState(5.0);
  const [assetCap, setAssetCap] = useState(40.0);
  const [turnoverBps, setTurnoverBps] = useState(10);
  const [autoHedge, setAutoHedge] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] tracking-tight">Risk Parameters &amp; Engine Governance</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[11px] font-bold">
              Institutional Limits
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
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
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-sm">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            <h3>Safeguard Circuit Breakers</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Max Drawdown Limit</span>
                <span className="font-mono text-slate-900 font-bold">{maxDrawdown.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.5"
                value={maxDrawdown}
                onChange={(e) => setMaxDrawdown(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers automated 25% cash buffer liquidation when breached.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">CVaR Tail-Risk Confidence (α)</span>
                <span className="font-mono text-slate-900 font-bold">{cvarAlpha}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[95, 99].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCvarAlpha(val)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      cvarAlpha === val
                        ? "bg-blue-50 border-[#0066FF] text-[#0066FF]"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    CVaR {val}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Autonomous De-risking Protocol</p>
                <p className="text-[11px] text-slate-400">Execute emergency liquidity rebalance automatically</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoHedge(!autoHedge)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  autoHedge ? "bg-[#0066FF]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoHedge ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Optimization & Asset Caps */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-sm">
            <Sliders className="w-4 h-4 text-[#0066FF]" />
            <h3>Asset Allocation Constraints</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Max Single-Asset Concentration Cap</span>
                <span className="font-mono text-slate-900 font-bold">{assetCap.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="60.0"
                step="5.0"
                value={assetCap}
                onChange={(e) => setAssetCap(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Prevents portfolio overexposure to individual tickers (e.g. SPY).</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Minimum Cash &amp; T-Bill Reserve (BIL)</span>
                <span className="font-mono text-slate-900 font-bold">{minCash.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="25.0"
                step="1.0"
                value={minCash}
                onChange={(e) => setMinCash(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Guarantees immediate liquidity for margin calls and sweeps.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Turnover Penalty (Friction Model)</span>
                <span className="font-mono text-slate-900 font-bold">{turnoverBps} bps</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={turnoverBps}
                onChange={(e) => setTurnoverBps(parseInt(e.target.value))}
                className="w-full accent-[#0066FF] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Penalizes excessive churn to minimize institutional execution costs.</p>
            </div>
          </div>
        </div>

        {/* Card 3: Custody & Engine Integrations */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-[#0A1128] font-bold text-sm">
            <Database className="w-4 h-4 text-[#0066FF]" />
            <h3>Institutional Custody &amp; Execution Feeds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Prime Custody Partner</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">Goldman Sachs Prime</h4>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Connected &amp; Synced</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Smart Routing DMA</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">IEX &amp; Direct Dark Pools</h4>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Sub-millisecond Latency</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Markov Regime Sensor</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">Eigenfactor Covariance</h4>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Real-Time Continuous Feed</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
