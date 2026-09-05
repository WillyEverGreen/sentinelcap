"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { getLiveMarketOverview, MarketOverviewResponse } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<MarketOverviewResponse | null>(null);

  useEffect(() => {
    getLiveMarketOverview()
      .then((data) => setLiveData(data))
      .catch((err) => console.error("Header live fetch error:", err));
  }, []);

  const niftyPrice = liveData?.india?.benchmark?.price || 23898;
  const inVix = liveData?.india?.india_vix?.value || 10.68;
  const usdInr = liveData?.india?.usd_inr?.rate || 94.49;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none font-sans border-b border-slate-100/90 dark:border-slate-800/80 transition-all">
      
      {/* Left: Clean Brand & Institutional Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-[17px] font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          Capital Overview
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NSE • BSE • SEBI Regulated</span>
        </div>
      </div>

      {/* Right Controls: Streamlined & Balanced */}
      <div className="flex items-center gap-3">
        
        {/* Live Market Micro-Ticker */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#131B2E] border border-slate-200/70 dark:border-slate-800 text-[11.5px] font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">NIFTY</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{Math.round(niftyPrice).toLocaleString()}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">VIX</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{inVix}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">USD/INR</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{usdInr}</span>
          </div>
        </div>

        {/* Search Bar with Shortcut */}
        <div className="relative w-44 md:w-56 focus-within:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 text-[12px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#131B2E] focus:border-[#0066FF] dark:focus:border-[#38BDF8] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Compact Theme Selector */}
        <ThemeToggle compact />

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#2A374A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] dark:bg-[#38BDF8] absolute top-1.5 right-1.5" />
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
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Aditya S.</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Head of Treasury</p>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
        </div>

      </div>

    </header>
  );
}
