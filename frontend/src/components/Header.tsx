"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { 
  getLiveMarketOverview, 
  MarketOverviewResponse, 
  getPortfolio, 
  getAuditLog, 
  Asset, 
  AuditLogEntry 
} from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

const FALLBACK_ASSETS: Asset[] = [
  { ticker: "SPY", name: "SPDR S&P 500 ETF", asset_class: "Equity", category: "Large Cap", weight: 0.35, current_value: 3500000, liquidity_horizon_days: 1, expected_annual_return: 0.08, annual_volatility: 0.15 },
  { ticker: "QQQ", name: "Invesco QQQ Trust", asset_class: "Equity", category: "Technology", weight: 0.15, current_value: 1500000, liquidity_horizon_days: 1, expected_annual_return: 0.10, annual_volatility: 0.20 },
  { ticker: "GLD", name: "SPDR Gold Shares", asset_class: "Commodity", category: "Precious Metals", weight: 0.10, current_value: 1000000, liquidity_horizon_days: 2, expected_annual_return: 0.04, annual_volatility: 0.12 },
  { ticker: "AGG", name: "iShares Core US Aggregate Bond", asset_class: "Fixed Income", category: "Core Bond", weight: 0.25, current_value: 2500000, liquidity_horizon_days: 3, expected_annual_return: 0.03, annual_volatility: 0.05 },
  { ticker: "VNQ", name: "Vanguard Real Estate Index", asset_class: "Real Estate", category: "REITs", weight: 0.10, current_value: 1000000, liquidity_horizon_days: 5, expected_annual_return: 0.06, annual_volatility: 0.18 },
  { ticker: "BIL", name: "SPDR Bloomberg 1-3 Month T-Bill", asset_class: "Cash", category: "Cash Equivalent", weight: 0.05, current_value: 500000, liquidity_horizon_days: 1, expected_annual_return: 0.04, annual_volatility: 0.01 },
];

const FALLBACK_NOTIFICATIONS: AuditLogEntry[] = [
  {
    id: "cb-alert-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    level: "AMBER",
    mode: "auto",
    trigger: "cvar_breach",
    metric_name: "CVaR 99% (10d)",
    metric_value: 0.082,
    threshold_value: 0.08,
    action_taken: "Alert Generated",
    details: { msg: "Tail risk exposure exceeded 8% threshold." }
  },
  {
    id: "cb-alert-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    level: "NORMAL",
    mode: "manual",
    trigger: "rebalance",
    metric_name: "Turnover",
    metric_value: 0.045,
    threshold_value: 0.05,
    action_taken: "Optimization Applied",
    details: { msg: "Mean-CVaR strategy rebalanced successfully." }
  }
];

export default function Header() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [liveData, setLiveData] = useState<MarketOverviewResponse | null>(null);
  
  // Interactive element states
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(FALLBACK_ASSETS);
  const [notifications, setNotifications] = useState<AuditLogEntry[]>(FALLBACK_NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(true);
  const [demoUser, setDemoUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    // 1. Live Market Data
    getLiveMarketOverview()
      .then((data) => setLiveData(data))
      .catch((err) => console.error("Header live fetch error:", err));

    // 2. Portfolio Assets for Search
    getPortfolio()
      .then((data) => {
        if (data?.portfolio?.assets) setAssets(data.portfolio.assets);
      })
      .catch(() => setAssets(FALLBACK_ASSETS));

    // 3. System Notifications
    getAuditLog(5)
      .then((data) => {
        if (data?.entries?.length > 0) {
          setNotifications(data.entries);
          setHasUnread(true);
        }
      })
      .catch(() => {
        setNotifications(FALLBACK_NOTIFICATIONS);
        setHasUnread(true);
      });

    // 4. Demo User from localStorage
    try {
      const saved = localStorage.getItem("sentinel_demo_user");
      if (saved) {
        setDemoUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (hasUnread) {
      setHasUnread(false);
    }
  };

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

  const niftyPrice = liveData?.india?.benchmark?.price || 23897.70;
  const inVix = liveData?.india?.india_vix?.value || 10.68;
  const usdInr = liveData?.india?.usd_inr?.rate || 84.10;

  const searchResults = searchQuery.trim() === "" 
    ? [] 
    : assets.filter(a => 
        a.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 select-none font-sans border-b border-slate-100/90 dark:border-slate-800/80 transition-all">
      
      {/* Left: Clean Brand & Institutional Status */}
      <div className="flex items-center gap-3">
        <h1 className="text-[17px] font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          Capital Overview
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NSE • BSE • SEBI Regulated</span>
        </div>
      </div>

      {/* Right Controls: Streamlined & Balanced */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Live Market Micro-Ticker */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200/70 dark:border-slate-800 text-[11.5px] font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">NIFTY</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(niftyPrice).toLocaleString()}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">VIX</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{inVix}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">USD/INR</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{usdInr}</span>
          </div>
        </div>

        {/* Search Bar with Shortcut */}
        <div className="relative w-44 md:w-56 focus-within:w-64 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 text-[12px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#131B2E] focus:border-[#0066FF] dark:focus:border-[#38BDF8] focus:ring-2 focus:ring-[#0066FF]/10 transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            ⌘K
          </kbd>

          {/* Search Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#131B2E] rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {searchResults.map((asset) => (
                    <div key={asset.ticker} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#1E293B] cursor-pointer flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{asset.ticker}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{asset.name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {asset.price || `$${(asset.current_value / 1000000).toFixed(2)}M`}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase">
                          {asset.type || asset.asset_class}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No assets found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Theme Selector */}
        <ThemeToggle compact />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            title="Notifications"
            className={`relative w-8 h-8 rounded-lg ${showNotifications ? "bg-slate-200 dark:bg-slate-800" : "bg-slate-50 dark:bg-[#1E293B]"} hover:bg-slate-100 dark:hover:bg-[#2A374A] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer`}
          >
            <Bell className="w-3.5 h-3.5" />
            {hasUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] dark:bg-[#38BDF8] absolute top-1.5 right-1.5" />}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#131B2E] rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                {hasUnread && <span className="text-[10px] font-semibold text-[#0066FF] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">2 New</span>}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-[#1E293B] border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      {notif.level === "RED" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      ) : notif.level === "AMBER" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{notif.action_taken}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{notif.details?.msg || notif.trigger}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#1E293B] border-t border-slate-100 dark:border-slate-800 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2A374A] transition-colors">
                <Link href="/dashboard/alerts" className="text-[11px] font-bold text-[#0066FF] dark:text-[#38BDF8]">
                  View All Alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Authentication */}
        {isLoaded && isSignedIn ? (
          <div className="flex items-center gap-2 pl-1">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700",
                },
              }}
            />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.fullName || user?.firstName || "Aditya S."}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">{user?.primaryEmailAddress?.emailAddress || "Head of Treasury"}</p>
            </div>
          </div>
        ) : demoUser ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1C64F2] to-[#38BDF8] flex items-center justify-center text-white text-xs font-extrabold shadow-xs">
              {demoUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{demoUser.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">{demoUser.role}</p>
            </div>
            <button
              onClick={handleDemoSignOut}
              title="Sign out of demo session"
              className="ml-1 text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/70 dark:border-slate-700 transition-colors cursor-pointer"
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
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        )}

      </div>

    </header>
  );
}
