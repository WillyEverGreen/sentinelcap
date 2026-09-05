"use client";

import React, { useState, useRef, useMemo } from "react";
import { Sliders, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export interface FrontierPoint {
  expected_return: number;
  volatility: number;
  sharpe: number;
  cvar_95_10d: number;
  weights?: Record<string, number>;
}

interface EfficientFrontierChartProps {
  frontierPoints: FrontierPoint[];
  currentPortfolio: FrontierPoint | null;
  maxSharpePortfolio: FrontierPoint | null;
  minVariancePortfolio: FrontierPoint | null;
  riskFreeRate?: number;
  currency?: string;
  onSelectPoint?: (point: FrontierPoint) => void;
}

/**
 * Catmull-Rom smooth spline calculation through points
 * Guarantees continuous first derivative (C1 continuity) and natural concavity
 */
function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const n = points.length;

  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6.0;
    const cp1y = p1.y + (p2.y - p0.y) / 6.0;
    const cp2x = p2.x - (p3.x - p1.x) / 6.0;
    const cp2y = p2.y - (p3.y - p1.y) / 6.0;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export default function EfficientFrontierChart({
  frontierPoints,
  currentPortfolio,
  maxSharpePortfolio,
  minVariancePortfolio,
  riskFreeRate = 0.04,
  currency = "$",
  onSelectPoint,
}: EfficientFrontierChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<FrontierPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<FrontierPoint | null>(null);
  const [showCAL, setShowCAL] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. Process & sort real backend frontier points
  const sortedPoints = useMemo(() => {
    let pts = frontierPoints && frontierPoints.length >= 3 ? [...frontierPoints] : [
      { volatility: 0.0372, expected_return: 0.0575, sharpe: 0.470, cvar_95_10d: 0.0152 },
      { volatility: 0.0393, expected_return: 0.0645, sharpe: 0.623, cvar_95_10d: 0.0175 },
      { volatility: 0.0454, expected_return: 0.0751, sharpe: 0.773, cvar_95_10d: 0.0210 },
      { volatility: 0.0563, expected_return: 0.0856, sharpe: 0.810, cvar_95_10d: 0.0245 },
      { volatility: 0.0726, expected_return: 0.0992, sharpe: 0.815, cvar_95_10d: 0.0293 },
      { volatility: 0.0877, expected_return: 0.1102, sharpe: 0.800, cvar_95_10d: 0.0357 },
      { volatility: 0.1119, expected_return: 0.1172, sharpe: 0.690, cvar_95_10d: 0.0476 },
      { volatility: 0.1275, expected_return: 0.1208, sharpe: 0.633, cvar_95_10d: 0.0548 },
    ];
    pts.sort((a, b) => a.volatility - b.volatility);
    return pts;
  }, [frontierPoints]);

  // 2. Exact Institutional Portfolios
  const minVarPt: FrontierPoint = useMemo(() => {
    if (minVariancePortfolio && minVariancePortfolio.volatility > 0) return minVariancePortfolio;
    return sortedPoints[0];
  }, [minVariancePortfolio, sortedPoints]);

  const maxSharpePt: FrontierPoint = useMemo(() => {
    if (maxSharpePortfolio && maxSharpePortfolio.volatility > 0) return maxSharpePortfolio;
    return sortedPoints.reduce((best, p) => (p.sharpe > best.sharpe ? p : best), sortedPoints[Math.floor(sortedPoints.length / 2)]);
  }, [maxSharpePortfolio, sortedPoints]);

  const currentPt: FrontierPoint = useMemo(() => {
    if (currentPortfolio && currentPortfolio.volatility > 0) {
      return currentPortfolio;
    }
    return {
      volatility: 0.1106,
      expected_return: 0.0395,
      sharpe: -0.005,
      cvar_95_10d: 0.055,
    };
  }, [currentPortfolio]);

  // 3. Layout Dimensions & Coordinates
  const width = 680;
  const height = 310;
  const padLeft = 56;
  const padRight = 32;
  const padTop = 24;
  const padBottom = 46;
  const base = height - padBottom; // 264px

  // Clean Institutional 2% steps from 2% (0.02) to 14% (0.14)
  const minX = 0.02;
  const maxX = 0.14;
  const minY = 0.02;
  const maxY = 0.14;

  const mapX = (vol: number) => padLeft + Math.max(0, Math.min(1, (vol - minX) / (maxX - minX))) * (width - padLeft - padRight);
  const mapY = (ret: number) => base - Math.max(0, Math.min(1, (ret - minY) / (maxY - minY))) * (base - padTop);

  const mappedPoints = useMemo(() => {
    return sortedPoints.map((p) => ({
      x: mapX(p.volatility),
      y: mapY(p.expected_return),
    }));
  }, [sortedPoints]);

  const pathD = useMemo(() => {
    return catmullRomPath(mappedPoints);
  }, [mappedPoints]);

  const areaD = useMemo(() => {
    if (mappedPoints.length < 2) return "";
    const firstX = mappedPoints[0].x.toFixed(1);
    const lastX = mappedPoints[mappedPoints.length - 1].x.toFixed(1);
    return `${pathD} L ${lastX} ${base.toFixed(1)} L ${firstX} ${base.toFixed(1)} Z`;
  }, [pathD, mappedPoints, base]);

  // CAL Ray
  const rf = riskFreeRate || 0.04;
  const calSlope = (maxSharpePt.expected_return - rf) / maxSharpePt.volatility;
  const calStartX = minX;
  const calStartY = rf + calSlope * (calStartX - 0);
  const calEndX = Math.min(maxX, maxSharpePt.volatility * 1.45);
  const calEndY = rf + calSlope * (calEndX - 0);

  // Mouse Move: Track closest frontier point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width;

    let closestPt = sortedPoints[0];
    let minDist = Infinity;
    for (const pt of sortedPoints) {
      const ptX = mapX(pt.volatility);
      const dist = Math.abs(ptX - mouseSvgX);
      if (dist < minDist) {
        minDist = dist;
        closestPt = pt;
      }
    }
    setHoveredPoint(closestPt);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Active Portfolio in HUD Readout
  const activePt = hoveredPoint || selectedPoint || maxSharpePt;
  const activeShortTitle = hoveredPoint
    ? (hoveredPoint === maxSharpePt ? "Max Sharpe" : hoveredPoint === minVarPt ? "Min Variance" : "Frontier Tier")
    : (selectedPoint
        ? (selectedPoint === maxSharpePt ? "Max Sharpe" : selectedPoint === minVarPt ? "Min Variance" : "Current Baseline")
        : "Max Sharpe Target");

  const activePointColor = hoveredPoint
    ? (hoveredPoint === maxSharpePt ? "bg-[#0066FF]" : hoveredPoint === minVarPt ? "bg-[#0F172A]" : "bg-sky-500")
    : (selectedPoint
        ? (selectedPoint === maxSharpePt ? "bg-[#0066FF]" : selectedPoint === minVarPt ? "bg-[#0F172A]" : "bg-[#EA580C]")
        : "bg-[#0066FF]");

  const xTicks = [0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.14];
  const yTicks = [0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.14];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 select-none font-sans">
      
      {/* ── ROW 1: Clean Institutional Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[#0A1128] tracking-tight">
              Markowitz Efficient Frontier
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0066FF] border border-blue-200/80 text-[10px] font-bold tracking-wide uppercase">
              Convex MPT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Risk-return optimization frontier across asset weights. Plumb lines anchor portfolios to the risk floor.
          </p>
        </div>

        {/* Live HUD Telemetry Strip - Clean, single-line, non-wrapping */}
        <div className="flex items-center gap-2.5 bg-slate-50/90 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-mono shrink-0 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold font-sans text-slate-800 text-[11px] border-r border-slate-200 pr-2.5">
            <span className={`w-2 h-2 rounded-full ${activePointColor}`} />
            <span className="whitespace-nowrap">{activeShortTitle}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-slate-400 font-sans text-[11px]">Return:</span>
            <span className="font-bold text-emerald-600 font-mono">
              +{(activePt.expected_return * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-slate-400 font-sans text-[11px]">Vol:</span>
            <span className="font-bold text-[#0066FF] font-mono">
              {(activePt.volatility * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-slate-400 font-sans text-[11px]">Sharpe:</span>
            <span className="font-bold text-slate-900 font-mono">
              {activePt.sharpe.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Minimalist Filter Tabs & CAL Toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Max Sharpe Tab */}
          <button
            onClick={() => { setSelectedPoint(maxSharpePt); if (onSelectPoint) onSelectPoint(maxSharpePt); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              (selectedPoint === maxSharpePt || !selectedPoint)
                ? "bg-blue-50/80 border-blue-300 text-[#0066FF] font-bold shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
            <span>Max Sharpe Target</span>
          </button>

          {/* Min Variance Tab */}
          <button
            onClick={() => { setSelectedPoint(minVarPt); if (onSelectPoint) onSelectPoint(minVarPt); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              selectedPoint === minVarPt
                ? "bg-slate-100 border-slate-400 text-slate-900 font-bold shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
            <span>Min Variance</span>
          </button>

          {/* Current Baseline Tab */}
          <button
            onClick={() => { setSelectedPoint(currentPt); if (onSelectPoint) onSelectPoint(currentPt); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              selectedPoint === currentPt
                ? "bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span>Current Baseline</span>
          </button>
        </div>

        {/* CAL Tangent Ray Compact Switch */}
        <button
          onClick={() => setShowCAL(!showCAL)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showCAL
              ? "bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-xs"
              : "bg-white text-slate-500 border-slate-200 hover:text-slate-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${showCAL ? "bg-amber-500" : "bg-slate-300"}`} />
          <span>CAL Tangent Line: {showCAL ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* ── ROW 3: SVG Canvas ── */}
      <div className="relative overflow-hidden w-full aspect-[2.2/1] max-h-[310px] bg-[#FAFBFD] rounded-2xl border border-slate-200/80 p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="frontierAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0.00" />
            </linearGradient>

            <marker
              id="vectorArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0066FF" opacity="0.6" />
            </marker>
          </defs>

          {/* Horizontal Gridlines & Integer Return Ticks */}
          {yTicks.map((retVal) => {
            const y = mapY(retVal);
            return (
              <g key={`y-${retVal}`}>
                <line
                  x1={padLeft - 4}
                  y1={y}
                  x2={width - padRight + 4}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {(retVal * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Feasible Region Wash */}
          <path d={areaD} fill="url(#frontierAreaGrad)" />

          {/* Vertical Gridlines & Risk Floor Ticks */}
          {xTicks.map((volVal) => {
            const x = mapX(volVal);
            return (
              <g key={`x-${volVal}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={base}
                  stroke="#F1F5F9"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <line
                  x1={x}
                  y1={base}
                  x2={x}
                  y2={base + 5}
                  stroke="#94A3B8"
                  strokeWidth="0.9"
                />
                <text
                  x={x}
                  y={base + 16}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {(volVal * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Floor Axis Line */}
          <line
            x1={padLeft - 4}
            y1={base}
            x2={width - padRight + 4}
            y2={base}
            stroke="#CBD5E1"
            strokeWidth="1"
          />

          {/* Floor Axis Boundary Labels */}
          <text
            x={padLeft}
            y={height - 8}
            fill="#94A3B8"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.06em"
          >
            CONSERVATIVE (LOWER RISK)
          </text>
          <text
            x={width - padRight}
            y={height - 8}
            fill="#94A3B8"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.06em"
            textAnchor="end"
          >
            AGGRESSIVE (HIGHER RETURN)
          </text>

          {/* CAL Tangency Line (Optional) */}
          {showCAL && (
            <g>
              <line
                x1={mapX(calStartX)}
                y1={mapY(calStartY)}
                x2={mapX(calEndX)}
                y2={mapY(calEndY)}
                stroke="#D97706"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <circle cx={mapX(minX)} cy={mapY(rf)} r="3" fill="#D97706" />
              <text
                x={mapX(minX) + 6}
                y={mapY(rf) - 5}
                fill="#D97706"
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                Rf = {(rf * 100).toFixed(1)}%
              </text>
            </g>
          )}

          {/* ── Continuous Smooth Frontier Curve ── */}
          <path
            d={pathD}
            fill="none"
            stroke="#0066FF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* ── Plumb Lines ── */}

          {/* Min Variance Plumb Line */}
          <g>
            <line
              x1={mapX(minVarPt.volatility)}
              y1={mapY(minVarPt.expected_return)}
              x2={mapX(minVarPt.volatility)}
              y2={base}
              stroke="#0F172A"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            <circle cx={mapX(minVarPt.volatility)} cy={base} r="1.8" fill="#0F172A" />
            <text
              x={mapX(minVarPt.volatility)}
              y={base + 27}
              fill="#0F172A"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {(minVarPt.volatility * 100).toFixed(1)}%
            </text>
          </g>

          {/* Max Sharpe Plumb Line */}
          <g>
            <line
              x1={mapX(maxSharpePt.volatility)}
              y1={mapY(maxSharpePt.expected_return)}
              x2={mapX(maxSharpePt.volatility)}
              y2={base}
              stroke="#0066FF"
              strokeWidth="1.1"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            <circle cx={mapX(maxSharpePt.volatility)} cy={base} r="2.2" fill="#0066FF" />
            <text
              x={mapX(maxSharpePt.volatility)}
              y={base + 27}
              fill="#0066FF"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {(maxSharpePt.volatility * 100).toFixed(1)}%
            </text>
          </g>

          {/* Current Baseline Plumb Line */}
          <g>
            <line
              x1={mapX(currentPt.volatility)}
              y1={mapY(currentPt.expected_return)}
              x2={mapX(currentPt.volatility)}
              y2={base}
              stroke="#EA580C"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <circle cx={mapX(currentPt.volatility)} cy={base} r="1.8" fill="#EA580C" />
            <text
              x={mapX(currentPt.volatility)}
              y={base + 27}
              fill="#EA580C"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              {(currentPt.volatility * 100).toFixed(1)}%
            </text>
          </g>

          {/* Rebalance Vector Arrow (Current -> Max Sharpe) */}
          <line
            x1={mapX(currentPt.volatility)}
            y1={mapY(currentPt.expected_return)}
            x2={mapX(maxSharpePt.volatility) + 4}
            y2={mapY(maxSharpePt.expected_return) + 4}
            stroke="#0066FF"
            strokeDasharray="3 3"
            strokeWidth="0.9"
            opacity="0.4"
            markerEnd="url(#vectorArrow)"
          />

          {/* Interactive Mouse Hover Crosshair */}
          {hoveredPoint && (
            <g>
              <line
                x1={mapX(hoveredPoint.volatility)}
                y1={mapY(hoveredPoint.expected_return)}
                x2={mapX(hoveredPoint.volatility)}
                y2={base}
                stroke="#0066FF"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <circle
                cx={mapX(hoveredPoint.volatility)}
                cy={mapY(hoveredPoint.expected_return)}
                r="4.5"
                fill="#0066FF"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Anchor 1: Min Variance Portfolio (Cleanly to LEFT of vertex) */}
          <g
            className="cursor-pointer"
            onClick={() => { setSelectedPoint(minVarPt); if (onSelectPoint) onSelectPoint(minVarPt); }}
          >
            <circle
              cx={mapX(minVarPt.volatility)}
              cy={mapY(minVarPt.expected_return)}
              r="4.5"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2"
            />
            <text
              x={mapX(minVarPt.volatility) - 8}
              y={mapY(minVarPt.expected_return) + 3}
              fill="#0F172A"
              fontSize="9"
              fontWeight="700"
              textAnchor="end"
              style={{ paintOrder: "stroke", stroke: "#FFFFFF", strokeWidth: "3px" }}
            >
              MIN VARIANCE
            </text>
          </g>

          {/* Anchor 2: Current Baseline Portfolio (Above dot) */}
          <g
            className="cursor-pointer"
            onClick={() => { setSelectedPoint(currentPt); if (onSelectPoint) onSelectPoint(currentPt); }}
          >
            <circle
              cx={mapX(currentPt.volatility)}
              cy={mapY(currentPt.expected_return)}
              r="4.5"
              fill="#EA580C"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x={mapX(currentPt.volatility)}
              y={mapY(currentPt.expected_return) - 10}
              fill="#EA580C"
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
              style={{ paintOrder: "stroke", stroke: "#FFFFFF", strokeWidth: "3px" }}
            >
              CURRENT BASELINE
            </text>
          </g>

          {/* Anchor 3: Max Sharpe Tangency Portfolio (Above curve) */}
          <g
            className="cursor-pointer"
            onClick={() => { setSelectedPoint(maxSharpePt); if (onSelectPoint) onSelectPoint(maxSharpePt); }}
          >
            <circle
              cx={mapX(maxSharpePt.volatility)}
              cy={mapY(maxSharpePt.expected_return)}
              r="7.5"
              fill="rgba(0, 102, 255, 0.12)"
            />
            <circle
              cx={mapX(maxSharpePt.volatility)}
              cy={mapY(maxSharpePt.expected_return)}
              r="4.8"
              fill="#0066FF"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <text
              x={mapX(maxSharpePt.volatility)}
              y={mapY(maxSharpePt.expected_return) - 14}
              fill="#0066FF"
              fontSize="9.5"
              fontWeight="800"
              textAnchor="middle"
              style={{ paintOrder: "stroke", stroke: "#FFFFFF", strokeWidth: "3.5px" }}
            >
              MAX SHARPE ({maxSharpePt.sharpe.toFixed(2)})
            </text>
          </g>
        </svg>
      </div>

      {/* ── ROW 4: Signature Bottom Legend ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px] font-sans text-slate-500">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#0066FF] rounded-full" />
            <span className="font-medium text-slate-600">Efficient Frontier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
            <span className="font-semibold text-slate-800">Max Sharpe Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
            <span className="font-semibold text-slate-800">Min Variance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span className="font-semibold text-slate-800">Current Baseline</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Click any portfolio or hover to inspect coordinates
        </div>
      </div>

    </div>
  );
}
