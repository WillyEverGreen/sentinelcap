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
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-white border-r border-slate-100/90 z-40 flex flex-col justify-between py-6 px-4 select-none">
      <div>
        {/* Brand Logo matching Hero Page */}
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8 group">
          <div className="flex items-end gap-[3px] h-6">
            <span className="w-[5px] h-3 bg-[#00D2FF] rounded-full transition-all group-hover:h-5 duration-300" />
            <span className="w-[5px] h-[18px] bg-[#0077FF] rounded-full transition-all group-hover:h-3.5 duration-300" />
            <span className="w-[5px] h-6 bg-[#0044FF] rounded-full transition-all group-hover:h-6 duration-300" />
          </div>
          <span className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0A1128]">
            Capital<span className="text-[#0066FF]">AI</span>
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
                    ? "text-[#0066FF] bg-blue-50/80 font-semibold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-[#0066FF]" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>

                {/* Active Indicator Bar on left edge */}
                {isActive && (
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#0066FF] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Bottom Actions */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-[11.5px] font-semibold text-slate-700">Sentinel Engine</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Active</span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Documentation</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Exit Session</span>
        </Link>
      </div>
    </aside>
  );
}
