"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Laptop, 
  User, 
  Bell, 
  Key, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Mail, 
  Volume2, 
  ExternalLink,
  Lock
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { theme, setTheme, isDark } = useTheme();
  const { user, isSignedIn, isLoaded } = useUser();

  // Local state for demo user fallback
  const [demoUser, setDemoUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // Preference states
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState("daily");
  const [primaryCurrency, setPrimaryCurrency] = useState("INR");
  const [marketFeedMode, setMarketFeedMode] = useState("realtime");
  const [finnhubKey, setFinnhubKey] = useState("••••••••••••••••••••");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/XXXX");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("sentinel_demo_user");
      if (savedUser) {
        setDemoUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const displayName = user?.fullName || demoUser?.name || "Aditya Sharma";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || demoUser?.email || "aditya.sharma@sentinelcap.ai";
  const displayRole = demoUser?.role || "Chief Investment Officer";

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0A1128] dark:text-white tracking-tight">Platform Settings &amp; Preferences</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900 text-[11px] font-bold">
              Institutional Terminal
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Customize appearance, institutional identity, notification feeds, and external market data connectivity.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white text-xs font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Settings Saved!" : "Save Settings"}</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Appearance & Display Theme */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Sun className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Appearance &amp; Display Theme</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your interface visual theme. Institutional dark mode uses high-contrast OLED black for reduced eye fatigue during market hours.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", sub: "Daytime high contrast", icon: Sun },
              { id: "dark", label: "Dark", sub: "Deep navy obsidian", icon: Moon },
              { id: "system", label: "System", sub: "Matches device OS", icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as "light" | "dark" | "system")}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0066FF] dark:border-[#38BDF8] bg-blue-50/70 dark:bg-blue-950/60 ring-2 ring-[#0066FF]/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B]"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2.5 ${isSelected ? "text-[#0066FF] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Current Active Mode:</span>
            <span className="font-mono font-bold text-[#0066FF] dark:text-[#38BDF8] uppercase">{theme}</span>
          </div>
        </div>

        {/* Card 2: User Profile & Institutional Identity */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
              <User className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <h3>Institutional User Profile</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md font-bold">
              {isSignedIn ? "CLERK AUTHENTICATED" : "DEMO SESSION"}
            </span>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1C64F2] to-[#38BDF8] flex items-center justify-center text-white text-sm font-extrabold shadow-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{displayEmail}</p>
              <p className="text-[10px] text-[#0066FF] dark:text-[#38BDF8] font-semibold mt-0.5">{displayRole}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Organization / Desk</label>
              <input
                type="text"
                defaultValue="Sentinel Capital Management Ltd."
                className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Trading Desk Region</label>
              <input
                type="text"
                defaultValue="Mumbai (NSE/BSE) / Gift City IFSC"
                className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Alert & Notification Feeds */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
            <h3>Notification &amp; War Room Feeds</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Audible Breach Siren</p>
                  <p className="text-[11px] text-slate-400">Play alert sound on RED circuit breaker trigger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                  soundAlerts ? "bg-[#0066FF] dark:bg-[#38BDF8]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${soundAlerts ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Executive Risk Digest Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "realtime", label: "Real-time" },
                  { id: "daily", label: "Daily Close" },
                  { id: "weekly", label: "Weekly Summary" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEmailDigest(item.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      emailDigest === item.id
                        ? "bg-blue-50 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] text-[#0066FF] dark:text-[#38BDF8]"
                        : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Trading Room Webhook (Slack / Teams)</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Market Data & API Gateway */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131B2E] p-6 shadow-xs dark:shadow-none space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-sm">
              <Globe className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <h3>Market Data &amp; Brokerage Gateway</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              FEED: ACTIVE
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Primary Display Currency</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "INR", label: "INR (₹) • National Stock Exchange" },
                  { id: "USD", label: "USD ($) • Institutional USD" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPrimaryCurrency(item.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      primaryCurrency === item.id
                        ? "bg-blue-50 dark:bg-blue-950/60 border-[#0066FF] dark:border-[#38BDF8] text-[#0066FF] dark:text-[#38BDF8]"
                        : "bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Finnhub Market Data API Token</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={finnhubKey}
                  onChange={(e) => setFinnhubKey(e.target.value)}
                  className="flex-1 h-8 px-3 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-[#0066FF]"
                />
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-900">
                  CONNECTED
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Execution Venue Tokens Encrypted (AES-256-GCM)</span>
              </div>
              <span className="text-[#0066FF] dark:text-[#38BDF8] font-bold cursor-pointer hover:underline">Manage Vault</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
