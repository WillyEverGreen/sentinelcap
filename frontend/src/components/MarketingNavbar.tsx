"use client"
import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

export default function MarketingNavbar() {
  return (
    <header className="relative z-30 w-full flex items-center justify-between px-8 md:px-14 lg:px-20 pt-6 pb-2 flex-shrink-0 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md transition-colors duration-150">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="flex items-end gap-[3px] h-6">
          <span className="w-[5px] h-3 bg-[#00D2FF] rounded-full transition-all group-hover:h-5 duration-300" />
          <span className="w-[5px] h-[18px] bg-[#0077FF] rounded-full transition-all group-hover:h-3.5 duration-300" />
          <span className="w-[5px] h-6 bg-[#0044FF] rounded-full transition-all group-hover:h-6 duration-300" />
        </div>
        <span className="text-[21px] font-extrabold tracking-[-0.03em] text-[#0A1128] dark:text-white">
          Capital<span className="text-[#0066FF] dark:text-[#38BDF8]">AI</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {["Product", "Resources", "Pricing", "About"].map((item) => (
          <Link
            key={item}
            href={`/#${item.toLowerCase()}`}
            className="text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {item}
          </Link>
        ))}
        <Link href="/#solutions" className="flex items-center gap-1 text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
          Solutions
          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {/* Quick theme toggle */}
        <ThemeToggle compact />

        <Link
          href="/sign-in"
          className="hidden sm:inline-flex text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white dark:text-[#0A1128] px-5 py-2.5 rounded-full bg-[#0A1128] dark:bg-white hover:bg-[#1a2540] dark:hover:bg-slate-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          Get Started
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
