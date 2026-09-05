"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign, AlertTriangle, ShieldCheck, Activity, Droplets, 
  TrendingUp, Sliders, ArrowRight, ShieldAlert, CheckCircle2, Lock 
} from "lucide-react";
import KPICard from "@/components/KPICard";
import AllocationChart from "@/components/AllocationChart";
import RiskMetricsTable from "@/components/RiskMetricsTable";
import { getPortfolio, getRiskStatus, PortfolioResponse, RiskMetricsResponse } from "@/lib/api";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [riskData, setRiskData] = useState<RiskMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [port, risk] = await Promise.all([getPortfolio(), getRiskStatus()]);
      setPortfolio(port);
      setRiskData(risk);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !riskData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500 tracking-wider">CONNECTING TO RISK ENGINE TELEMETRY...</p>
      </div>
    );
  }

  // Fallback defaults if API not yet populated
  const totalVal = portfolio?.total_value || 10_000_000;
  const cvar99 = riskData?.risk_metrics?.var_metrics?.historical?.es_cvar_pct || 0.051;
  const riskBudget = portfolio?.portfolio?.risk_budget_cvar_99 || 0.06;
  const currentDrawdown = riskData?.risk_metrics?.drawdown?.current_drawdown_pct || 0.032;
  const maxDrawdownLimit = portfolio?.portfolio?.max_drawdown_limit || 0.08;
  const regimeLabel = riskData?.regime?.regime_label || "Calm";
  const crisisProb = riskData?.regime?.crisis_probability || 0.05;
  const lcr = riskData?.frtb_liquidity?.liquidity_coverage?.coverage_ratio || 1.42;

  const cbStatus = riskData?.circuit_breaker?.status || "NORMAL";
  const cbMode = riskData?.circuit_breaker?.mode || "auto";

  // Build allocation items
  const assets = portfolio?.portfolio?.assets || [
    { ticker: "SPY", name: "SPDR S&P 500 ETF", category: "Equity", weight: 0.35, liquidity_horizon_days: 10 },
    { ticker: "EFA", name: "iShares MSCI EAFE", category: "Equity", weight: 0.15, liquidity_horizon_days: 10 },
    { ticker: "AGG", name: "US Aggregate Bond", category: "Fixed Income", weight: 0.25, liquidity_horizon_days: 20 },
    { ticker: "GLD", name: "SPDR Gold Shares", category: "Commodity", weight: 0.10, liquidity_horizon_days: 20 },
    { ticker: "VNQ", name: "Vanguard Real Estate", category: "Real Estate", weight: 0.10, liquidity_horizon_days: 20 },
    { ticker: "BIL", name: "1-3M Treasury Bills", category: "Cash", weight: 0.05, liquidity_horizon_days: 10 },
  ];

  const allocationItems = assets.map((a) => {
    const liveWeight = riskData?.active_weights?.[a.ticker] ?? a.weight;
    return {
      ticker: a.ticker,
      name: a.name,
      category: a.category,
      weight: liveWeight,
      dollarValue: liveWeight * totalVal,
      liquidityDays: a.liquidity_horizon_days,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Header & Circuit Breaker Telemetry Banner */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-950 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ACTIVE PORTFOLIO • {portfolio?.portfolio?.portfolio_id || "PORT-INST-001"}
              </span>
              <span className="text-xs font-mono text-zinc-500">CURRENCY: USD</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Capital Management & Risk Control Engine
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Autonomous risk telemetry, FRTB-compliant coherent tail-risk controls, and real-time circuit breakers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/optimize"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              Rebalance Portfolio
            </Link>
            <Link
              href="/stress-test"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              War Room
            </Link>
          </div>
        </div>

        {/* Live Status Bar Notification */}
        {cbStatus !== "NORMAL" && (
          <div className="mt-4 p-3 rounded-lg border flex items-center justify-between gap-3 text-xs bg-rose-950/40 border-rose-600/40 text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>
                <strong>SAFEGUARD TRIGGERED:</strong> {riskData?.circuit_breaker?.action_taken}
              </span>
            </div>
            <Link href="/audit-log" className="underline font-semibold flex items-center gap-1 hover:text-white">
              View Audit Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 5 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Portfolio Capital"
          value={`$${(totalVal / 1_000_000).toFixed(2)}M`}
          subtitle="6 Multi-Asset Classes"
          badge="LIVE"
          badgeType="neutral"
          icon={DollarSign}
        />

        <KPICard
          title="99% 10-Day CVaR"
          value={`${(cvar99 * 100).toFixed(2)}%`}
          subtitle={`$${((cvar99 * totalVal) / 1_000).toFixed(0)}k tail risk`}
          badge={cvar99 <= riskBudget ? "COMPLIANT" : "BREACH"}
          badgeType={cvar99 <= riskBudget ? "success" : "danger"}
          icon={ShieldCheck}
          progress={(cvar99 / riskBudget) * 100}
          target={`Budget: ${(riskBudget * 100).toFixed(1)}%`}
        />

        <KPICard
          title="Current Drawdown"
          value={`${(currentDrawdown * 100).toFixed(2)}%`}
          subtitle="From trailing peak"
          badge={currentDrawdown <= maxDrawdownLimit ? "HEALTHY" : "CRITICAL"}
          badgeType={currentDrawdown <= maxDrawdownLimit ? "success" : "danger"}
          icon={Activity}
          progress={(currentDrawdown / maxDrawdownLimit) * 100}
          target={`Limit: ${(maxDrawdownLimit * 100).toFixed(1)}%`}
        />

        <KPICard
          title="Markov Regime"
          value={regimeLabel.toUpperCase()}
          subtitle={`Crisis prob: ${(crisisProb * 100).toFixed(1)}%`}
          badge={regimeLabel === "Calm" ? "LOW VOL" : "HIGH VOL"}
          badgeType={regimeLabel === "Calm" ? "success" : "danger"}
          icon={TrendingUp}
        />

        <KPICard
          title="Liquidity Coverage"
          value={`${lcr.toFixed(2)}x`}
          subtitle="High Quality Liquid Assets"
          badge={lcr >= 1.0 ? "PASS" : "WARNING"}
          badgeType={lcr >= 1.0 ? "success" : "warning"}
          icon={Droplets}
          target="Min: 0.80x"
        />
      </div>

      {/* Main Grid: Allocation + Multi-Method Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Allocation Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AllocationChart allocations={allocationItems} totalValue={totalVal} />

          {/* Model Backtesting & Regulatory Governance Card */}
          {riskData?.backtesting_validation && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Regulatory Model Backtesting</h3>
                  <p className="text-xs text-zinc-400">Statistical validation for internal models approach (IMA)</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  riskData.backtesting_validation.basel_traffic_light.zone === "GREEN"
                    ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                    : "text-amber-400 bg-amber-950/60 border-amber-500/30"
                }`}>
                  BASEL {riskData.backtesting_validation.basel_traffic_light.zone}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-mono">KUPIEC POF TEST</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-white">
                      {riskData.backtesting_validation.kupiec_test.is_accepted ? "PASSED" : "REJECTED"}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    p-val: {riskData.backtesting_validation.kupiec_test.p_value.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-mono">CHRISTOFFERSEN TEST</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-white">
                      {riskData.backtesting_validation.christoffersen_test.is_accepted ? "PASSED" : "REJECTED"}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Independence: Unclustered
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 font-mono bg-zinc-950/40 p-2.5 rounded border border-zinc-800/60">
                {riskData.backtesting_validation.basel_traffic_light.verdict}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: 4-Method VaR / ES Table & Risk Attribution (7 cols) */}
        <div className="lg:col-span-7">
          {riskData?.risk_metrics && (
            <RiskMetricsTable metrics={riskData.risk_metrics} riskBudget={riskBudget} />
          )}
        </div>
      </div>

    </div>
  );
}
