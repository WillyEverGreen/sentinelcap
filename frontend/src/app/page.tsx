"use client"

import { useState } from "react"
import Link from "next/link"
import { Globe } from "@/components/ui/globe"
import ThemeToggle from "@/components/ThemeToggle"

export default function HeroPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 select-none flex flex-col font-sans transition-colors duration-150">

      {/* ── Navbar ── */}
      <header className="relative z-30 w-full flex items-center justify-between px-8 md:px-14 lg:px-20 pt-6 pb-2 flex-shrink-0 bg-white/90 dark:bg-[#0A0F1D]/90 backdrop-blur-md transition-colors duration-150">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo-icon.png"
            alt="CapitalAI"
            className="h-6 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-[21px] font-extrabold tracking-[-0.03em] text-[#0A1128] dark:text-white">
            Capital<span className="text-[#0066FF] dark:text-[#38BDF8]">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Product", "Resources", "Pricing", "About"].map((item) => (
            <button
              key={item}
              className="text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
          <div className="flex items-center gap-1 text-[14px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            Solutions
            <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
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

      {/* ── LEFT FLANK: Concentric Oval Rays (No cards) ── */}
      <div className="absolute left-0 top-0 bottom-0 w-[360px] md:w-[460px] lg:w-[540px] pointer-events-none z-10 overflow-hidden">
        <svg
          className="absolute -left-20 sm:-left-12 top-1/2 -translate-y-1/2 w-full h-[760px]"
          viewBox="0 0 540 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="leftRayGrad1" x1="0%" y1="10%" x2="100%" y2="90%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#00D2FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="leftRayGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.38" />
              <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="leftRayGrad3" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#0044FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#0066FF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ray 1 (Inner Oval Arc) */}
          <path
            d="M-60,180 C80,210 200,280 180,390 C160,490 50,540 -60,580"
            stroke="url(#leftRayGrad1)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Ray 2 */}
          <path
            d="M-50,130 C120,165 260,250 240,400 C215,520 70,590 -50,640"
            stroke="url(#leftRayGrad2)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Ray 3 */}
          <path
            d="M-40,80 C160,120 320,220 300,410 C270,550 90,640 -40,700"
            stroke="url(#leftRayGrad3)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Ray 4 */}
          <path
            d="M-30,30 C200,75 380,190 360,420 C325,580 110,690 -30,760"
            stroke="url(#leftRayGrad1)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          {/* Ray 5 */}
          <path
            d="M-20,-20 C240,30 440,160 420,430 C380,610 130,740 -20,820"
            stroke="url(#leftRayGrad2)"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          {/* Ray 6 (Faintest Outer Glow) */}
          <path
            d="M-10,-70 C280,-15 500,130 480,440 C435,640 150,790 -10,880"
            stroke="url(#leftRayGrad1)"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Accent Glowing Nodes along the rays */}
          <circle cx="180" cy="390" r="3.5" fill="#0066FF" />
          <circle cx="180" cy="390" r="8" stroke="#0066FF" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="240" cy="400" r="3" fill="#00D2FF" />
          <circle cx="300" cy="410" r="4.5" fill="#0044FF" />
          <circle cx="300" cy="410" r="10" stroke="#0044FF" strokeOpacity="0.2" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── RIGHT FLANK: Concentric Oval Rays (No cards) ── */}
      <div className="absolute right-0 top-0 bottom-0 w-[360px] md:w-[460px] lg:w-[540px] pointer-events-none z-10 overflow-hidden">
        <svg
          className="absolute -right-20 sm:-right-12 top-1/2 -translate-y-1/2 w-full h-[760px]"
          viewBox="0 0 540 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rightRayGrad1" x1="100%" y1="10%" x2="0%" y2="90%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#00D2FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rightRayGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.38" />
              <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rightRayGrad3" x1="100%" y1="20%" x2="0%" y2="80%">
              <stop offset="0%" stopColor="#0044FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#0066FF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ray 1 */}
          <path
            d="M600,180 C460,210 340,280 360,390 C380,490 490,540 600,580"
            stroke="url(#rightRayGrad1)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Ray 2 */}
          <path
            d="M590,130 C420,165 280,250 300,400 C325,520 470,590 590,640"
            stroke="url(#rightRayGrad2)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Ray 3 */}
          <path
            d="M580,80 C380,120 220,220 240,410 C270,550 450,640 580,700"
            stroke="url(#rightRayGrad3)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Ray 4 */}
          <path
            d="M570,30 C340,75 160,190 180,420 C215,580 430,690 570,760"
            stroke="url(#rightRayGrad1)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          {/* Ray 5 */}
          <path
            d="M560,-20 C300,30 100,160 120,430 C160,610 410,740 560,820"
            stroke="url(#rightRayGrad2)"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          {/* Ray 6 (Faintest Outer Glow) */}
          <path
            d="M550,-70 C260,0 40,130 60,440 C85,660 390,790 550,880"
            stroke="url(#rightRayGrad1)"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Accent Glowing Nodes along the rays */}
          <circle cx="360" cy="390" r="3.5" fill="#0066FF" />
          <circle cx="360" cy="390" r="8" stroke="#0066FF" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="300" cy="400" r="3" fill="#38BDF8" />
          <circle cx="240" cy="410" r="4.5" fill="#0066FF" />
          <circle cx="240" cy="410" r="10" stroke="#0066FF" strokeOpacity="0.2" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── Hero Center Section ── */}
      <section className="relative z-20 flex flex-col items-center text-center px-6 pt-8 sm:pt-10 md:pt-12 flex-shrink-0 max-w-4xl mx-auto bg-transparent">
        <p className="text-[11.5px] md:text-[12.5px] font-bold tracking-[0.22em] uppercase text-slate-400 mb-2.5">
          AI FOR ASSET &amp; CAPITAL MANAGEMENT
        </p>

        <h1 className="text-[40px] sm:text-[52px] md:text-[60px] lg:text-[66px] font-extrabold tracking-[-0.04em] leading-[1.07] text-[#0A1128] dark:text-white mb-3.5">
          Smarter Capital<br />
          for a <span className="text-[#0066FF] dark:text-[#38BDF8]">Stronger Tomorrow</span>
        </h1>

        <p className="max-w-[500px] text-[15px] md:text-[16px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Optimize asset allocation, enforce risk controls, and adapt in real time
          to a changing market — all in one intelligent platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0A1128] dark:bg-white hover:bg-[#1a2540] dark:hover:bg-slate-200 text-white dark:text-[#0A1128] text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Get Started Free
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <button
            onClick={() => setDemoOpen(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[14px] font-semibold shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#0066FF] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 fill-white ml-0.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
            Watch Demo
          </button>
        </div>
      </section>

      {/* ── Globe Area ── */}
      <div className="relative flex-1 w-full overflow-hidden min-h-0 flex items-center justify-center bg-transparent">
        <Globe className="top-0 sm:top-2 md:top-4 max-w-[700px] sm:max-w-[800px] md:max-w-[900px]" />
      </div>

      {/* ── Demo Modal ── */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDemoOpen(false)}>
          <div className="w-full max-w-3xl bg-white dark:bg-[#131B2E] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Walkthrough</h3>
              <button onClick={() => setDemoOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold transition-colors cursor-pointer">✕</button>
            </div>
            <div className="mt-4 aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0066FF] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/40 animate-pulse">
                <svg className="w-7 h-7 fill-white ml-1" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Automated Capital Optimization Engine</h4>
              <p className="text-slate-400 text-sm max-w-md">Continuous dynamic risk rebalancing, Markov regime shifts, and autonomous safeguard circuit breakers.</p>
              <Link href="/dashboard" className="mt-6 px-6 py-2.5 rounded-full bg-white text-slate-950 text-sm font-semibold hover:bg-slate-100 transition-colors">Launch Live Dashboard →</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
