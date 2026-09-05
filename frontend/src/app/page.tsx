"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { Globe } from "@/components/ui/globe";

export default function HeroPage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white text-slate-900 select-none flex flex-col font-sans">

      {/* ── Navbar ── */}
      <header className="relative z-30 w-full flex items-center justify-between px-8 md:px-14 lg:px-20 pt-6 pb-2 flex-shrink-0 bg-white">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-end gap-[3px] h-6">
            <span className="w-[5px] h-3 bg-[#00D2FF] rounded-full transition-all group-hover:h-5 duration-300" />
            <span className="w-[5px] h-[18px] bg-[#0077FF] rounded-full transition-all group-hover:h-3.5 duration-300" />
            <span className="w-[5px] h-6 bg-[#0044FF] rounded-full transition-all group-hover:h-6 duration-300" />
          </div>
          <span className="text-[21px] font-extrabold tracking-[-0.03em] text-[#0A1128]">
            Capital<span className="text-[#0066FF]">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Product", "Resources", "Pricing", "About"].map((item) => (
            <button
              key={item}
              className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
          <div className="flex items-center gap-1 text-[14px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer">
            Solutions
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-[13.5px] font-semibold text-slate-600 hover:text-slate-900 px-5 py-2 rounded-full border border-slate-200 hover:border-slate-300 transition-all"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white px-5 py-2.5 rounded-full bg-[#0A1128] hover:bg-[#1a2540] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
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
            strokeDasharray="5 7"
          />
          {/* Ray 3 (Main Bold Sweeping Oval) */}
          <path
            d="M-40,80 C160,120 320,220 300,410 C275,555 90,640 -40,700"
            stroke="url(#leftRayGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Ray 4 */}
          <path
            d="M-30,30 C200,80 380,190 360,420 C335,590 110,690 -30,760"
            stroke="url(#leftRayGrad3)"
            strokeWidth="1.6"
          />
          {/* Ray 5 (Outer Fine Oval) */}
          <path
            d="M-20,-20 C240,40 440,160 420,430 C395,625 130,740 -20,820"
            stroke="url(#leftRayGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 5"
          />
          {/* Ray 6 (Faintest Outer Glow) */}
          <path
            d="M-10,-70 C280,0 500,130 480,440 C455,660 150,790 -10,880"
            stroke="url(#leftRayGrad1)"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Accent Glowing Nodes along the rays */}
          <circle cx="180" cy="390" r="3.5" fill="#0066FF" />
          <circle cx="180" cy="390" r="8" stroke="#0066FF" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="240" cy="400" r="3" fill="#00D2FF" />
          <circle cx="300" cy="410" r="4.5" fill="#0066FF" />
          <circle cx="300" cy="410" r="10" stroke="#0066FF" strokeOpacity="0.2" strokeWidth="1.5" />
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
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rightRayGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.38" />
              <stop offset="65%" stopColor="#00D2FF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rightRayGrad3" x1="100%" y1="20%" x2="0%" y2="80%">
              <stop offset="0%" stopColor="#0044FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#0066FF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ray 1 (Inner Oval Arc) */}
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
            strokeDasharray="5 7"
          />
          {/* Ray 3 (Main Bold Sweeping Oval) */}
          <path
            d="M580,80 C380,120 220,220 240,410 C265,555 450,640 580,700"
            stroke="url(#rightRayGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Ray 4 */}
          <path
            d="M570,30 C340,80 160,190 180,420 C205,590 430,690 570,760"
            stroke="url(#rightRayGrad3)"
            strokeWidth="1.6"
          />
          {/* Ray 5 (Outer Fine Oval) */}
          <path
            d="M560,-20 C300,40 100,160 120,430 C145,625 410,740 560,820"
            stroke="url(#rightRayGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 5"
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

        <h1 className="text-[40px] sm:text-[52px] md:text-[60px] lg:text-[66px] font-extrabold tracking-[-0.04em] leading-[1.07] text-[#0A1128] mb-3.5">
          Smarter Capital<br />
          for a <span className="text-[#0066FF]">Stronger Tomorrow</span>
        </h1>

        <p className="max-w-[500px] text-[15px] md:text-[16px] text-slate-500 leading-relaxed mb-6">
          Optimize asset allocation, enforce risk controls, and adapt in real time
          to a changing market — all in one intelligent platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0A1128] hover:bg-[#1a2540] text-white text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Get Started Free
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <button
            onClick={() => setDemoOpen(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 text-[14px] font-semibold shadow-sm hover:border-slate-300 hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer"
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
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Platform Walkthrough</h3>
              <button onClick={() => setDemoOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer" title="Close"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0066FF] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/40 animate-pulse">
                <svg className="w-7 h-7 fill-white ml-1" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <h4 className="text-xl font-bold mb-2">Automated Capital Optimization Engine</h4>
              <p className="text-slate-400 text-sm max-w-md">Continuous dynamic risk rebalancing, Markov regime shifts, and autonomous safeguard circuit breakers.</p>
              <Link href="/dashboard" className="mt-6 px-6 py-2.5 rounded-full bg-white text-slate-950 text-sm font-semibold hover:bg-slate-100 transition-colors">Launch Live Dashboard <ArrowRight className="w-4 h-4 inline ml-1.5" /></Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}