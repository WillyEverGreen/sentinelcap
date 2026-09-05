"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSub = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 h-screen w-[250px] z-40 bg-[#131522] border-r border-white/[0.05] flex flex-col justify-between py-4 px-3 select-none overflow-y-auto sidebar-scrollbar font-sans text-slate-400">
      <div>
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 px-2 mb-4">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
              <circle cx="15" cy="15" r="2" fill="currentColor" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#131522] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-semibold text-white text-[14px] tracking-tight">Sentinel</span>
              <span className="font-bold text-sky-400 text-[14px] tracking-tight">Cap</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">Capital & Risk Engine</p>
          </div>
        </div>

        {/* Section 1: Manage capital */}
        <div className="px-2 mb-1">
          <p className="text-[11px] font-medium text-slate-400/80 tracking-wide">Manage capital</p>
        </div>

        {/* Primary Navigation Items */}
        <nav className="space-y-0.5 mb-3">
          {/* Dashboard */}
          <Link
            href="/"
            className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 ${
              pathname === "/"
                ? "bg-[#1e2338] text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg
                className={`w-4 h-4 transition-colors ${
                  pathname === "/" ? "text-sky-400" : "text-slate-400 group-hover:text-white"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
              </svg>
              <span>Dashboard</span>
            </div>
          </Link>

          {/* Capital Rebalancer */}
          <div>
            <div
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                pathname === "/optimize"
                  ? "bg-[#1e2338] text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Link href="/optimize" className="flex items-center gap-2.5 flex-1">
                <svg
                  className={`w-4 h-4 transition-colors ${
                    pathname === "/optimize" ? "text-sky-400" : "text-slate-400 group-hover:text-white"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>Capital Rebalancer</span>
              </Link>
              <button
                type="button"
                onClick={(e) => toggleSub("rebalance", e)}
                className="p-1 text-slate-500 hover:text-white transition-colors bg-transparent border-0 outline-none cursor-pointer"
                title="Toggle sub-menu"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedSection === "rebalance" ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            {expandedSection === "rebalance" && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px] text-slate-400 animate-in fade-in duration-150">
                <Link
                  href="/optimize"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • Rockafellar Mean-CVaR
                </Link>
                <Link
                  href="/optimize"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • Hierarchical Risk Parity
                </Link>
                <Link
                  href="/optimize"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • LCR Liquidity Caps
                </Link>
              </div>
            )}
          </div>

          {/* Crisis War Room */}
          <div>
            <div
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
                pathname === "/stress-test"
                  ? "bg-[#1e2338] text-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Link href="/stress-test" className="flex items-center gap-2.5 flex-1">
                <svg
                  className={`w-4 h-4 transition-colors ${
                    pathname === "/stress-test" ? "text-sky-400" : "text-slate-400 group-hover:text-white"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <span>Crisis War Room</span>
              </Link>
              <button
                type="button"
                onClick={(e) => toggleSub("warroom", e)}
                className="p-1 text-slate-500 hover:text-white transition-colors bg-transparent border-0 outline-none cursor-pointer"
                title="Toggle sub-menu"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedSection === "warroom" ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            {expandedSection === "warroom" && (
              <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px] text-slate-400 animate-in fade-in duration-150">
                <Link
                  href="/stress-test"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • 2008 Lehman Crunch
                </Link>
                <Link
                  href="/stress-test"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • 2020 COVID Panic
                </Link>
                <Link
                  href="/stress-test"
                  className="block py-1 px-2 rounded-lg hover:text-sky-300 hover:bg-white/[0.03] transition-colors"
                >
                  • Stagflation Shock
                </Link>
              </div>
            )}
          </div>

          {/* Safeguard Audit */}
          <div
            className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 cursor-pointer ${
              pathname === "/audit-log"
                ? "bg-[#1e2338] text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Link href="/audit-log" className="flex items-center gap-2.5 flex-1">
              <svg
                className={`w-4 h-4 transition-colors ${
                  pathname === "/audit-log" ? "text-sky-400" : "text-slate-400 group-hover:text-white"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Safeguard Audit</span>
            </Link>
            <svg
              className="w-3.5 h-3.5 text-slate-500"
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
        </nav>

        {/* Section 2: Risk telemetry */}
        <div className="px-2 mb-1">
          <p className="text-[11px] font-medium text-slate-400/80 tracking-wide">Risk telemetry</p>
        </div>

        <nav className="space-y-0.5 mb-3">
          {/* Risk Telemetry */}
          <Link
            href="/"
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Risk Telemetry</span>
            </div>
          </Link>

          {/* Euler Attribution */}
          <Link
            href="/"
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Euler Attribution</span>
            </div>
          </Link>

          {/* FRTB Horizons */}
          <Link
            href="/"
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>FRTB Horizons</span>
            </div>
          </Link>

          {/* Model Validation */}
          <Link
            href="/"
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Model Validation</span>
            </div>
          </Link>
        </nav>

        {/* Section 3: Appearance & Preferences */}
        <div className="space-y-0.5 border-t border-white/[0.04] pt-2.5">
          <div className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12l4 6-10 12L2 9z" />
                <path d="M12 21 2 9h20z" />
              </svg>
              <span>Appearance</span>
            </div>
            <svg
              className="w-3.5 h-3.5 text-slate-500"
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

          <Link
            href="/audit-log"
            className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Telemetry Card: Autonomous Safeguard Node */}
      <div className="pt-2 border-t border-white/[0.04]">
        <div className="p-2.5 rounded-xl bg-[#181b2a] border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AUTONOMOUS LP
            </span>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
              ACTIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
            Rockafellar-Uryasev LP Engine • Basel III
          </p>
        </div>
      </div>
    </aside>
  );
}
