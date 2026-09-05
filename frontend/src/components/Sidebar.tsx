"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
  Sliders,
  History,
  Bell,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
    },
    {
      title: "Portfolio Optimizer",
      href: "/optimize",
      icon: <Sliders className="w-[18px] h-[18px]" />,
    },
    {
      title: "Stress Testing",
      href: "/stress-test",
      icon: <TrendingUp className="w-[18px] h-[18px]" />,
    },
    {
      title: "Safeguard Controls",
      href: "/audit-log",
      icon: <ShieldAlert className="w-[18px] h-[18px]" />,
    },
    {
      title: "Execution Blotter",
      href: "/dashboard/trades",
      icon: <History className="w-[18px] h-[18px]" />,
    },
    {
      title: "War Room Alerts",
      href: "/dashboard/alerts",
      icon: <Bell className="w-[18px] h-[18px]" />,
    },
    {
      title: "Risk Parameters",
      href: "/dashboard/settings",
      icon: <Settings className="w-[18px] h-[18px]" />,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-white dark:bg-[#0E1526] border-r border-slate-100/90 dark:border-slate-800/80 z-40 flex flex-col justify-between py-6 px-4 select-none transition-colors duration-150">
      <div>
        {/* Brand Logo matching Hero Page */}
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8 group">
          <img
            src="/logo-icon.png"
            alt="CapitalAI"
            className="h-6 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0A1128] dark:text-white">
            Capital<span className="text-[#0066FF] dark:text-[#38BDF8]">AI</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? "text-[#0066FF] dark:text-[#38BDF8] bg-blue-50/80 dark:bg-blue-950/50 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-[#0066FF] dark:text-[#38BDF8]" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>

                {/* Active Indicator Bar on left edge */}
                {isActive && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#0066FF] dark:bg-[#38BDF8] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Bottom Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#131B2E] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">Sentinel Engine</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Active</span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>Documentation</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Exit Session</span>
        </Link>
      </div>
    </aside>
  );
}
