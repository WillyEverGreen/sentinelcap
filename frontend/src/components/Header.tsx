"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { getLiveMarketOverview, MarketOverviewResponse } from "@/lib/api";

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<MarketOverviewResponse | null>(null);
  const [demoUser, setDemoUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    getLiveMarketOverview()
      .then((data) => setLiveData(data))
      .catch((err) => console.error("Header live fetch error:", err));

    try {
      const saved = localStorage.getItem("sentinel_demo_user");
      if (saved) {
        setDemoUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const niftyPrice = liveData?.india?.benchmark?.price || 23897.70;
  const inVix = liveData?.india?.india_vix?.value || 10.68;
  const usdInr = liveData?.india?.usd_inr?.rate || 84.10;

  const handleDemoSignOut = () => {
    try {
      localStorage.removeItem("sentinel_demo_user");
      document.cookie = "sentinel_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {
      // ignore
    }
    setDemoUser(null);
    window.location.href = "/sign-in";
  };

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

        {/* Search Bar */}
        <div className="relative w-44 md:w-56 focus-within:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-4 rounded-lg bg-slate-50 border border-slate-200/80 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] absolute top-1.5 right-1.5" />
        </button>

        {/* User Profile / Authentication */}
        {isLoaded && isSignedIn ? (
          <div className="flex items-center gap-2 pl-1">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-lg shadow-sm border border-slate-200",
                },
              }}
            />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || user?.firstName || "Aditya S."}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user?.primaryEmailAddress?.emailAddress || "Head of Treasury"}</p>
            </div>
          </div>
        ) : demoUser ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1C64F2] to-[#38BDF8] flex items-center justify-center text-white text-xs font-extrabold shadow-xs">
              {demoUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-800">{demoUser.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{demoUser.role}</p>
            </div>
            <button
              onClick={handleDemoSignOut}
              title="Sign out of demo session"
              className="ml-1 text-[10.5px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md bg-slate-100 hover:bg-rose-50 border border-slate-200/70 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : isLoaded && !isSignedIn ? (
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        )}

      </div>

    </header>
  );
}
