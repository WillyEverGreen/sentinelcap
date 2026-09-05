"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { getLiveMarketOverview, MarketOverviewResponse } from "@/lib/api";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<MarketOverviewResponse | null>(null);

  useEffect(() => {
    getLiveMarketOverview()
      .then((data) => setLiveData(data))
      .catch((err) => console.error("Header live fetch error:", err));
  }, []);

  const niftyPrice = liveData?.india?.benchmark?.price || 23897.70;
  const inVix = liveData?.india?.india_vix?.value || 10.68;
  const usdInr = liveData?.india?.usd_inr?.rate || 84.10;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none font-sans border-b border-slate-100/90 transition-all">
      
      {/* Left: Clean Brand & Institutional Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-[17px] font-extrabold tracking-tight text-[#0A1128]">
          Capital Overview
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[11px] font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NSE • BSE • SEBI Regulated</span>
        </div>
      </div>

      {/* Right Controls: Streamlined & Balanced */}
      <div className="flex items-center gap-3">
        
        {/* Live Market Micro-Ticker */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-[11.5px] font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">NIFTY</span>
            <span className="font-mono font-bold text-slate-900">{Math.round(niftyPrice).toLocaleString()}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">VIX</span>
            <span className="font-mono font-bold text-emerald-600">{inVix}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">USD/INR</span>
            <span className="font-mono font-bold text-slate-800">₹{usdInr}</span>
          </div>
        </div>

        {/* Search Bar with Shortcut */}
        <div className="relative w-44 md:w-56 focus-within:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-slate-50 border border-slate-200/80 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] p-0.5 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Aditya Sharma"
              className="w-full h-full object-cover rounded-[6px]"
            />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800">Aditya S.</p>
            <p className="text-[10px] text-slate-400 font-medium">Head of Treasury</p>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </div>

      </div>

    </header>
  );
}
