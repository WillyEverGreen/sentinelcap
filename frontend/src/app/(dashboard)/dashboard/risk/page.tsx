"use client";

import React, { useState } from "react";
import { 
  Shield, 
  CheckCircle2, 
  Save, 
  AlertTriangle, 
  Sliders, 
  Flame, 
  Lock, 
  Layers, 
  Activity,
  ArrowRight
} from "lucide-react";

export default function RiskParametersPage() {
  const [maxDrawdown, setMaxDrawdown] = useState(8.0);
  const [cvarAlpha, setCvarAlpha] = useState(99);
  const [minCash, setMinCash] = useState(5.0);
  const [assetCap, setAssetCap] = useState(40.0);
  const [turnoverBps, setTurnoverBps] = useState(10);
  const [autoHedge, setAutoHedge] = useState(true);
  const [executionMode, setExecutionMode] = useState<"TWAP" | "VWAP" | "SNIPER">("VWAP");
  const [liquidityDays, setLiquidityDays] = useState(2);
  const [circuitBreakerTriggered, setCircuitBreakerTriggered] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] dark:text-white tracking-tight">Risk Parameters &amp; Engine Governance</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[11px] font-bold">
              Institutional Limits
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Define quantitative portfolio risk ceilings, circuit breaker trigger triggers, and automated safeguard policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Parameters Saved!" : "Save Parameters"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Safeguard Circuit Breaker Ceilings */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <h3>Safeguard Circuit Breakers</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900">
              STATUS: ARMED
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Max Portfolio Drawdown Ceiling</span>
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
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Triggers automated cash sweep and halts discretionary order flow if breached.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">CVaR Tail-Risk Confidence Level (α)</span>
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
                    CVaR {val}% (Tail Risk)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Autonomous De-risking Protocol</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">Rebalance into T-Bills automatically during extreme volatility spikes.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoHedge(!autoHedge)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  autoHedge ? "bg-[#0066FF] dark:bg-[#38BDF8]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoHedge ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Asset Allocation & Concentration Limits */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <h3>Asset Allocation &amp; Concentration Caps</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              UCITS / SEBI
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Max Single-Asset Concentration Cap</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{assetCap.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="15.0"
                max="60.0"
                step="1.0"
                value={assetCap}
                onChange={(e) => setAssetCap(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Prevents over-allocation into high-weight index funds (e.g. SPY, NIFTY).</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Minimum Cash &amp; T-Bill Reserve (BIL)</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{minCash.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="20.0"
                step="0.5"
                value={minCash}
                onChange={(e) => setMinCash(parseFloat(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Mandatory liquid treasury reserve kept free of collateral encumbrance.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Minimum Liquidity Horizon</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">T+{liquidityDays} Days</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLiquidityDays(d)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      liquidityDays === d
                        ? "bg-blue-50 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] text-[#0066FF] dark:text-[#38BDF8]"
                        : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    T+{d} Max
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Execution Blotter & Slippage Safeguards */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
              <Activity className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <h3>Execution &amp; Slippage Thresholds</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              SMART ROUTING
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Max Allowable Execution Slippage</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{turnoverBps} bps</span>
              </div>
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={turnoverBps}
                onChange={(e) => setTurnoverBps(parseInt(e.target.value))}
                className="w-full accent-[#0066FF] dark:accent-[#38BDF8] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Orders exceeding this tolerance are converted to passive limit orders.</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Algorithmic Order Slicing Strategy</span>
                <span className="font-mono text-[#0066FF] dark:text-[#38BDF8] font-bold">{executionMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["TWAP", "VWAP", "SNIPER"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExecutionMode(mode)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      executionMode === mode
                        ? "bg-blue-50 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] text-[#0066FF] dark:text-[#38BDF8]"
                        : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Emergency Controls & Governance Audit */}
        <div className="rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <Flame className="w-4 h-4" />
              <h3>Emergency Fail-Safe &amp; Policy Audit</h3>
            </div>
            <span className="text-[10.5px] font-mono text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md font-bold">
              RESTRICTED
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Triggering an emergency halt immediately revokes all active algo order tokens, cancels open routing legs on Goldman Prime &amp; IEX, and forces full portfolio cash hedge.
            </p>

            <div className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Compliance Framework:</span>
                <span className="font-bold text-slate-800 dark:text-white">SEBI Cir/MRD/2026/04</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Last Audited By:</span>
                <span className="font-mono text-slate-800 dark:text-white">Treasury Risk Committee</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCircuitBreakerTriggered(!circuitBreakerTriggered)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  circuitBreakerTriggered
                    ? "bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/30"
                    : "bg-white dark:bg-[#1E293B] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900"
                }`}
              >
                {circuitBreakerTriggered ? "⚠ EMERGENCY SYSTEM HALTED (CLICK TO RESUME)" : "Trigger Manual Emergency Halt"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
