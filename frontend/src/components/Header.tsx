"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, Activity } from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#F8FAFC]/90 backdrop-blur-md px-8 flex items-center justify-between gap-6 select-none font-sans">
      
      {/* Left Title matching Problem Statement */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[25px] font-extrabold tracking-[-0.03em] text-[#0A1128]">
            Capital Overview
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-[11px] font-bold tracking-wide">
            PORT-INST-001
          </span>
        </div>
        <p className="text-[13px] text-slate-400 font-medium -mt-0.5">
          Autonomous Portfolio Optimization &amp; Dynamic Risk Engine
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Search input for tickers & assets */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SPY, GLD, VaR limits, or alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200/80 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all shadow-sm"
          />
        </div>

        {/* Live Rebalance Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-600">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Markov Regime: <strong className="text-slate-900 font-bold">Stable Growth</strong></span>
        </div>

        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm cursor-pointer">
          <Bell className="w-[18px] h-[18px]" />
          <span className="w-2 h-2 rounded-full bg-[#0066FF] absolute top-2.5 right-2.5 ring-2 ring-white" />
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] p-0.5 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Alex Vance"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">Alex Vance</p>
            <p className="text-[11px] text-slate-400 font-medium">Chief Investment Officer</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </div>

      </div>

    </header>
  );
}
