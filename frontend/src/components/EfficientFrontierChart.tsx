"use client";

import React, { useState } from "react";
import { TrendingUp, Award, Shield, Target } from "lucide-react";

interface FrontierPoint {
  expected_return: number;
  volatility: number;
  sharpe: number;
  cvar_95_10d: number;
}

interface EfficientFrontierChartProps {
  frontierPoints: FrontierPoint[];
  currentPortfolio: FrontierPoint | null;
  maxSharpePortfolio: FrontierPoint | null;
  minVariancePortfolio: FrontierPoint | null;
}

export default function EfficientFrontierChart({
  frontierPoints,
  currentPortfolio,
  maxSharpePortfolio,
  minVariancePortfolio,
}: EfficientFrontierChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<FrontierPoint | null>(null);

  if (!frontierPoints || frontierPoints.length === 0) {
    return (
      <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-zinc-500 text-xs font-mono">
        Optimizing frontier points...
      </div>
    );
  }

  // Calculate scales
  const allVols = frontierPoints.map((p) => p.volatility);
  const allRets = frontierPoints.map((p) => p.expected_return);

  if (currentPortfolio) {
    allVols.push(currentPortfolio.volatility);
    allRets.push(currentPortfolio.expected_return);
  }

  const minX = Math.max(0.02, Math.min(...allVols) * 0.85);
  const maxX = Math.max(...allVols) * 1.15;
  const minY = Math.min(...allRets) * 0.85;
  const maxY = Math.max(...allRets) * 1.15;

  const width = 600;
  const height = 300;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const scaleX = (vol: number) => padLeft + ((vol - minX) / (maxX - minX)) * (width - padLeft - padRight);
  const scaleY = (ret: number) => height - padBottom - ((ret - minY) / (maxY - minY)) * (height - padTop - padBottom);

  // Generate SVG path for the curve
  const pathD = frontierPoints
    .slice()
    .sort((a, b) => a.volatility - b.volatility)
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(p.volatility)} ${scaleY(p.expected_return)}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">Interactive Efficient Frontier & Capital Allocation Line</h3>
          <p className="text-xs text-zinc-400">Risk (Annual Volatility) vs Reward (Expected Annual Return)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-cyan-400 text-[11px] font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Current
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Max Sharpe
          </div>
          <div className="flex items-center gap-1 text-purple-400 text-[11px] font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Min Variance
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden w-full aspect-[2/1] max-h-[340px] bg-zinc-950/60 rounded-lg border border-zinc-800/80 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => {
            const y = padTop + frac * (height - padTop - padBottom);
            return (
              <line
                key={frac}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#27272a"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Frontier Curve Line */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" className="opacity-80" />

          {/* Frontier Discrete Points */}
          {frontierPoints.map((p, i) => (
            <circle
              key={i}
              cx={scaleX(p.volatility)}
              cy={scaleY(p.expected_return)}
              r="3.5"
              fill="#0284c7"
              className="hover:r-5 cursor-pointer transition-all"
              onMouseEnter={() => setHoveredPoint(p)}
            />
          ))}

          {/* Current Portfolio (Cyan Circle) */}
          {currentPortfolio && (
            <g transform={`translate(${scaleX(currentPortfolio.volatility)}, ${scaleY(currentPortfolio.expected_return)})`}>
              <circle r="7" fill="#06b6d4" className="animate-ping opacity-75" />
              <circle r="5.5" fill="#22d3ee" stroke="#083344" strokeWidth="2" />
              <text x="9" y="3" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">
                CURRENT
              </text>
            </g>
          )}

          {/* Max Sharpe Portfolio (Emerald Star/Diamond) */}
          {maxSharpePortfolio && (
            <g transform={`translate(${scaleX(maxSharpePortfolio.volatility)}, ${scaleY(maxSharpePortfolio.expected_return)})`}>
              <polygon points="0,-7 6,0 0,7 -6,0" fill="#10b981" stroke="#022c22" strokeWidth="1.5" />
              <text x="9" y="3" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                MAX SHARPE
              </text>
            </g>
          )}

          {/* Min Variance Portfolio (Purple Square) */}
          {minVariancePortfolio && (
            <g transform={`translate(${scaleX(minVariancePortfolio.volatility)}, ${scaleY(minVariancePortfolio.expected_return)})`}>
              <rect x="-4.5" y="-4.5" width="9" height="9" fill="#a855f7" stroke="#3b0764" strokeWidth="1.5" />
              <text x="9" y="3" fill="#c084fc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                MIN VAR
              </text>
            </g>
          )}

          {/* Axis Labels */}
          <text x={width / 2} y={height - 8} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
            Annual Volatility (Risk)
          </text>
          <text
            x={-height / 2}
            y={18}
            fill="#71717a"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            Expected Return
          </text>
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-zinc-900/90 border border-zinc-700 p-2.5 rounded-lg text-xs font-mono text-white shadow-xl pointer-events-none">
            <div className="text-[10px] text-zinc-400 font-semibold mb-1">FRONTIER CANDIDATE</div>
            <div>Exp Return: <span className="text-sky-400 font-bold">{(hoveredPoint.expected_return * 100).toFixed(2)}%</span></div>
            <div>Volatility: <span className="text-zinc-300">{(hoveredPoint.volatility * 100).toFixed(2)}%</span></div>
            <div>Sharpe: <span className="text-emerald-400 font-bold">{hoveredPoint.sharpe.toFixed(2)}</span></div>
            <div>CVaR (10d): <span className="text-rose-400">{(hoveredPoint.cvar_95_10d * 100).toFixed(2)}%</span></div>
          </div>
        )}
      </div>

      {/* Benchmark Comparisons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[11px]">CURRENT PORTFOLIO</span>
          </div>
          <div className="text-base font-bold font-mono text-white">
            {currentPortfolio ? `${(currentPortfolio.expected_return * 100).toFixed(1)}% / ${(currentPortfolio.volatility * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Sharpe: {currentPortfolio?.sharpe.toFixed(2) || "—"} | CVaR: {currentPortfolio ? `${(currentPortfolio.cvar_95_10d * 100).toFixed(1)}%` : "—"}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">MAX SHARPE TARGET</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {maxSharpePortfolio ? `${(maxSharpePortfolio.expected_return * 100).toFixed(1)}% / ${(maxSharpePortfolio.volatility * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Sharpe: {maxSharpePortfolio?.sharpe.toFixed(2) || "—"} | CVaR: {maxSharpePortfolio ? `${(maxSharpePortfolio.cvar_95_10d * 100).toFixed(1)}%` : "—"}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-[11px]">MIN VARIANCE TARGET</span>
          </div>
          <div className="text-base font-bold font-mono text-purple-300">
            {minVariancePortfolio ? `${(minVariancePortfolio.expected_return * 100).toFixed(1)}% / ${(minVariancePortfolio.volatility * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Sharpe: {minVariancePortfolio?.sharpe.toFixed(2) || "—"} | CVaR: {minVariancePortfolio ? `${(minVariancePortfolio.cvar_95_10d * 100).toFixed(1)}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
