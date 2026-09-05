"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme, Theme } from "@/components/ThemeProvider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolvedTheme, setTheme, isDark } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { value: "system", label: "System", icon: <Laptop className="w-4 h-4 text-slate-400" /> },
  ];

  if (compact) {
    // Single click toggle button
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle dark mode"
        title={`Current: ${theme} (Click to toggle)`}
        className="relative w-8 h-8 rounded-lg bg-slate-50 dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400 animate-in spin-in-45 duration-200" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 animate-in spin-in-45 duration-200" />
        )}
      </button>
    );
  }

  // Segmented / Dropdown Selector
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Theme options"
        className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs cursor-pointer"
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="capitalize">{theme}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#131B2E] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 px-2.5 py-1">
            Appearance
          </div>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                theme === opt.value
                  ? "bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-blue-400 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              {theme === opt.value && <Check className="w-3.5 h-3.5 text-[#0066FF] dark:text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
