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
      <div className="h-64 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 text-xs font-mono">
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

  const pathD = frontierPoints
    .slice()
    .sort((a, b) => a.volatility - b.volatility)
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${scaleX(p.volatility)} ${scaleY(p.expected_return)}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-[#0A1128] tracking-tight">Interactive Efficient Frontier</h3>
          <p className="text-xs text-slate-400">Risk (Annual Volatility) vs Reward (Expected Annual Return)</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] inline-block" /> Current
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Max Sharpe
          </div>
          <div className="flex items-center gap-1.5 text-violet-600 text-[11px] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" /> Min Variance
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden w-full aspect-[2/1] max-h-[340px] bg-[#F8FAFC] rounded-xl border border-slate-100 p-2">
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
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}
          {[0.25, 0.5, 0.75].map((frac) => {
            const x = padLeft + frac * (width - padLeft - padRight);
            return (
              <line
                key={frac}
                x1={x}
                y1={padTop}
                x2={x}
                y2={height - padBottom}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Axes labels */}
          <text x={padLeft} y={height - 12} fill="#94A3B8" fontSize="10" fontFamily="sans-serif">
            Vol: {(minX * 100).toFixed(0)}%
          </text>
          <text x={width - padRight} y={height - 12} fill="#94A3B8" fontSize="10" textAnchor="end" fontFamily="sans-serif">
            Vol: {(maxX * 100).toFixed(0)}%
          </text>
          <text x={padLeft - 8} y={padTop + 10} fill="#94A3B8" fontSize="10" textAnchor="end" fontFamily="sans-serif">
            {(maxY * 100).toFixed(0)}%
          </text>
          <text x={padLeft - 8} y={height - padBottom} fill="#94A3B8" fontSize="10" textAnchor="end" fontFamily="sans-serif">
            {(minY * 100).toFixed(0)}%
          </text>

          {/* Frontier Line */}
          <path d={pathD} fill="none" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

          {/* Frontier Point Dots */}
          {frontierPoints.map((p, i) => (
            <circle
              key={i}
              cx={scaleX(p.volatility)}
              cy={scaleY(p.expected_return)}
              r={3}
              fill="#0066FF"
              opacity="0.5"
              className="cursor-pointer hover:opacity-100 transition-opacity"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Current Portfolio Point */}
          {currentPortfolio && (
            <g>
              <circle cx={scaleX(currentPortfolio.volatility)} cy={scaleY(currentPortfolio.expected_return)} r={9} fill="#0066FF" opacity="0.2" className="animate-pulse" />
              <circle cx={scaleX(currentPortfolio.volatility)} cy={scaleY(currentPortfolio.expected_return)} r={5} fill="#0066FF" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}

          {/* Max Sharpe Portfolio Point */}
          {maxSharpePortfolio && (
            <g>
              <circle cx={scaleX(maxSharpePortfolio.volatility)} cy={scaleY(maxSharpePortfolio.expected_return)} r={9} fill="#10B981" opacity="0.2" />
              <circle cx={scaleX(maxSharpePortfolio.volatility)} cy={scaleY(maxSharpePortfolio.expected_return)} r={5} fill="#10B981" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}

          {/* Min Variance Portfolio Point */}
          {minVariancePortfolio && (
            <g>
              <circle cx={scaleX(minVariancePortfolio.volatility)} cy={scaleY(minVariancePortfolio.expected_return)} r={9} fill="#8B5CF6" opacity="0.2" />
              <circle cx={scaleX(minVariancePortfolio.volatility)} cy={scaleY(minVariancePortfolio.expected_return)} r={5} fill="#8B5CF6" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl text-xs shadow-lg space-y-1 font-mono pointer-events-none">
            <div className="text-slate-900 font-bold">Frontier Optimal Point</div>
            <div className="text-emerald-600">Return: {(hoveredPoint.expected_return * 100).toFixed(2)}%</div>
            <div className="text-blue-600">Volatility: {(hoveredPoint.volatility * 100).toFixed(2)}%</div>
            <div className="text-slate-500">Sharpe: {hoveredPoint.sharpe.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
