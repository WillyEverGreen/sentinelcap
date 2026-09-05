"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/components/ThemeProvider";
import {
  Sparkles,
  Send,
  Square,
  RotateCcw,
  Download,
  Copy,
  Check,
  Bot,
  User,
  ShieldAlert,
  TrendingUp,
  Cpu,
  ChevronDown,
  ArrowRight,
  Sliders,
  Zap,
  HelpCircle,
  Activity
} from "lucide-react";
import {
  getPortfolio,
  getRiskStatus,
  getSafeguardStatus,
  getLiveMarketOverview,
  PortfolioResponse,
  RiskMetricsResponse,
  CircuitBreakerStatus,
  MarketOverviewResponse
} from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
  persona?: string;
}

const STARTER_PROMPTS = [
  {
    category: "Tail-Risk & CVaR",
    icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    title: "Assess 99% CVaR & Tech Shock",
    prompt: "Evaluate our portfolio's 99% CVaR under a 30% tech drawdown (QQQ). What hedge with gold (GLD) or treasuries (BIL) would restore risk budget to below 8.0%?"
  },
  {
    category: "Mean-CVaR Optimization",
    icon: <Sliders className="w-3.5 h-3.5 text-blue-500" />,
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    title: "Mean-CVaR Rebalance Plan",
    prompt: "Explain how CapitalAI's Mean-CVaR optimization algorithm differs from classic Markowitz Mean-Variance, and recommend tactical rebalance trades for our 6 assets."
  },
  {
    category: "Macro & Rate Shocks",
    icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    title: "Simulate 50 bps Rate Hike",
    prompt: "Simulate the portfolio impact of a 50 bps Fed/RBI interest rate hike on our fixed income (AGG) and real estate (VNQ) allocations. How will duration risk behave?"
  },
  {
    category: "Safeguard Controls",
    icon: <Zap className="w-3.5 h-3.5 text-purple-500" />,
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    title: "AMBER vs RED Circuit Breakers",
    prompt: "Detail the exact mechanical criteria that differentiate an AMBER warning from a hard RED circuit breaker shutdown in CapitalAI's automated safeguard architecture."
  }
];

const QUICK_CHIPS = [
  "Explain Cornish-Fisher vs Historical VaR",
  "How should we hedge USD/INR currency risk?",
  "Recommend target asset weights for minimum variance",
  "Audit our current liquidity horizon"
];

// Helper to sanitize & normalize tables, tabs, LaTeX math, and emoji headers
function preprocessMarkdown(text: string): string {
  if (!text) return "";
  let processed = text;

  // Convert LaTeX inline math \\( ... \\) into inline code `...`
  processed = processed.replace(/\\\((.*?)\\\)/g, "`$1`");
  // Convert LaTeX block math \\[ ... \\] into code blocks
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, "\n```math\n$1\n```\n");

  // Normalize numbered emoji headers (e.g. '1️⃣ Title' or '2. Title' at start of line)
  processed = processed.replace(/^([0-9]+[️⃣\.]\s*)([^\n]+)/gm, (_, p1, p2) => `\n### ${p1}${p2}\n`);

  // Step 1: Normalize lines with tabs into pipe-delimited table rows, and ensure trailing pipes
  const lines = processed.split("\n");
  const normalizedLines = lines.map((line) => {
    let clean = line.trim();
    if (clean.includes("\t") && clean.split("\t").filter(Boolean).length >= 2) {
      const cells = clean.split("\t").map((c) => c.trim());
      return "| " + cells.join(" | ") + " |";
    }
    if (clean.startsWith("|") && !clean.endsWith("|")) {
      clean += " |";
    }
    return clean;
  });

  // Step 2: Group consecutive pipe lines into tables and ensure valid GFM syntax
  const finalLines: string[] = [];
  let tableRows: string[] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    if (tableRows.length === 1) {
      finalLines.push(tableRows[0]);
      tableRows = [];
      return;
    }
    // Check if second line is a separator row
    const hasSeparator =
      tableRows.length > 1 &&
      /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(tableRows[1]);

    finalLines.push("");
    finalLines.push(tableRows[0]);
    if (!hasSeparator) {
      const colCount =
        tableRows[0].split("|").filter((s) => s.trim().length > 0).length || 2;
      finalLines.push("| " + Array(colCount).fill("---").join(" | ") + " |");
      for (let j = 1; j < tableRows.length; j++) {
        finalLines.push(tableRows[j]);
      }
    } else {
      for (let j = 1; j < tableRows.length; j++) {
        finalLines.push(tableRows[j]);
      }
    }
    finalLines.push("");
    tableRows = [];
  }

  for (let i = 0; i < normalizedLines.length; i++) {
    const l = normalizedLines[i];
    if (l.startsWith("|") && l.endsWith("|")) {
      tableRows.push(l);
    } else {
      flushTable();
      finalLines.push(normalizedLines[i]);
    }
  }
  flushTable();

  return finalLines.join("\n");
}

export default function ChatPage() {
  const { isDark } = useTheme();

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Model & Persona Configuration
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-oss-120b");
  const [selectedPersona, setSelectedPersona] = useState<string>("quant");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Real-Time Portfolio & Market Context
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetricsResponse | null>(null);
  const [safeguards, setSafeguards] = useState<CircuitBreakerStatus | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverviewResponse | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);

  // Refs for scrolling and abortion
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load portfolio data to provide live context to Groq
  useEffect(() => {
    Promise.allSettled([
      getPortfolio(),
      getRiskStatus(),
      getSafeguardStatus(),
      getLiveMarketOverview()
    ]).then(([portRes, riskRes, safeRes, mktRes]) => {
      if (portRes.status === "fulfilled" && portRes.value) setPortfolio(portRes.value);
      if (riskRes.status === "fulfilled" && riskRes.value) setRiskMetrics(riskRes.value);
      if (safeRes.status === "fulfilled" && safeRes.value) setSafeguards(safeRes.value);
      if (mktRes.status === "fulfilled" && mktRes.value) setMarketOverview(mktRes.value);
      setContextLoaded(true);
    });
  }, []);

  // Auto-scroll to bottom on new message / streaming update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Compile active portfolio context for the API
  const buildContextPayload = () => {
    const assets = portfolio?.portfolio?.assets?.map((a) => ({
      ticker: a.ticker,
      name: a.name,
      weight: a.weight,
      value: a.current_value,
      assetClass: a.asset_class
    })) || [
      { ticker: "SPY", name: "SPDR S&P 500", weight: 0.35, value: 3500000, assetClass: "Equity" },
      { ticker: "AGG", name: "Core US Aggregate Bond", weight: 0.25, value: 2500000, assetClass: "Fixed Income" },
      { ticker: "QQQ", name: "Invesco QQQ Trust", weight: 0.15, value: 1500000, assetClass: "Equity" },
      { ticker: "GLD", name: "SPDR Gold Shares", weight: 0.10, value: 1000000, assetClass: "Commodity" },
      { ticker: "VNQ", name: "Vanguard Real Estate", weight: 0.10, value: 1000000, assetClass: "Real Estate" },
      { ticker: "BIL", name: "1-3 Month T-Bill", weight: 0.05, value: 500000, assetClass: "Cash" }
    ];

    return {
      portfolioId: portfolio?.portfolio?.portfolio_id || "CAPITALAI-INST-01",
      totalValue: portfolio?.total_value || 10000000,
      currency: portfolio?.currency || "USD",
      cvar99: riskMetrics?.risk_metrics?.var_metrics?.historical?.es_cvar_pct || 0.082,
      var99: riskMetrics?.risk_metrics?.var_metrics?.historical?.var_pct || 0.054,
      maxDrawdown: riskMetrics?.risk_metrics?.drawdown?.max_drawdown_pct || 0.078,
      sharpeRatio: riskMetrics?.risk_metrics?.performance_ratios?.sharpe_ratio || 1.84,
      safeguardStatus: {
        level: safeguards?.status || "AMBER",
        isBreached: safeguards?.status === "RED" || safeguards?.status === "AMBER",
        circuitBreaker: safeguards?.trigger_reason || "cvar_breach"
      },
      assets,
      market: {
        nifty: marketOverview?.india?.benchmark?.price || 23897,
        vix: marketOverview?.india?.india_vix?.value || 10.68,
        usdInr: marketOverview?.india?.usd_inr?.rate || 84.10
      }
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `asst-${Date.now()}`;

    const newUserMsg: Message = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newAssistantMsg: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model: selectedModel,
      persona: selectedPersona
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages([...updatedMessages, newAssistantMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          persona: selectedPersona,
          portfolioContext: buildContextPayload()
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body received from chat endpoint");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === "data: [DONE]") {
            break;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    `⚠️ **Advisory Connection Interrupted**: ${err.message || "Failed to stream response from Groq LPU."}`
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleResetChat = () => {
    if (isStreaming) handleStopStreaming();
    setMessages([]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(
        (m) =>
          `### ${m.role === "user" ? "User" : "CapitalAI Copilot"} (${m.timestamp})\n\n${m.content}\n\n---\n`
      )
      .join("\n");
    const blob = new Blob([transcript], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capitalai-copilot-brief-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="-m-6 md:-m-8 p-4 md:p-5 h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col overflow-hidden select-text font-sans bg-[#F8FAFC] dark:bg-[#0A0F1D]">
      
      {/* Top Advisory Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        
        {/* Identity with Robot Mascot Thumbnail */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/headface.png"
              alt="CapitalAI Copilot"
              width={40}
              height={40}
              className="object-contain drop-shadow-sm hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                CapitalAI Copilot
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Groq LPU Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Autonomous Quantitative Strategy & Tail-Risk Diagnostics
            </p>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2">
          
          {/* Persona Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-[#131B2E] p-1 border border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setSelectedPersona("quant")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPersona === "quant"
                  ? "bg-white dark:bg-[#1E293B] text-[#0066FF] dark:text-[#38BDF8] shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Quant Strategist
            </button>
            <button
              onClick={() => setSelectedPersona("cro")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPersona === "cro"
                  ? "bg-white dark:bg-[#1E293B] text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Risk Officer
            </button>
            <button
              onClick={() => setSelectedPersona("executive")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPersona === "executive"
                  ? "bg-white dark:bg-[#1E293B] text-purple-600 dark:text-purple-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Executive
            </button>
          </div>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-[11.5px] font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38BDF8]" />
              <span className="font-semibold">{selectedModel.replace("openai/", "").replace("qwen/", "")}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showModelDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131B2E] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                {[
                  { id: "openai/gpt-oss-120b", name: "gpt-oss-120b", note: "Deep Quant Reasoning (High Precision)" },
                  { id: "openai/gpt-oss-20b", name: "gpt-oss-20b", note: "Ultra-Fast Execution (< 300ms)" },
                  { id: "qwen/qwen3.8-27b", name: "qwen3.8-27b", note: "Macro & Multi-Asset Analytics" },
                  { id: "groq/compound", name: "groq/compound", note: "Multi-Step Compound Reasoning" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex flex-col cursor-pointer ${
                      selectedModel === m.id
                        ? "bg-blue-50 dark:bg-blue-950/40 text-[#0066FF] dark:text-[#38BDF8] font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{m.note}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Transcript */}
          {messages.length > 0 && (
            <button
              onClick={handleExportChat}
              title="Export conversation as Markdown"
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Reset / New Chat */}
          {messages.length > 0 && (
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Main Conversation Stream / Zero State (Scrollable inside, page never scrolls) */}
      <div className="flex-1 overflow-y-auto min-h-0 py-3 pr-1 space-y-3.5 sidebar-scrollbar">
        
        {/* Zero-State: Perfectly fitted within viewport */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-4xl mx-auto py-1">
            
            {/* 3D Robot Mascot Feature - Small & Stunning */}
            <div className="relative mb-2.5 flex items-center justify-center">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-blue-600/20 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 select-none drop-shadow-xl hover:scale-105 transition-transform duration-300">
                <Image
                  src="/headface.png"
                  alt="CapitalAI Robot AI Mascot"
                  width={120}
                  height={120}
                  priority
                  className="object-contain w-full h-full filter drop-shadow-md"
                />
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              How can CapitalAI Copilot assist your investment desk today?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mb-3 leading-relaxed">
              Real-time portfolio intelligence, Rockafellar-Uryasev Mean-CVaR optimization, dynamic circuit breakers, and macro stress tests backed by Groq LPU inference.
            </p>

            {/* Context Active Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] font-semibold text-[#0066FF] dark:text-[#38BDF8] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] dark:bg-[#38BDF8] animate-pulse" />
              <span>Live Context Connected: $10.0M AUM • 6 Assets • AMBER Safeguard State</span>
            </div>

            {/* Starter Prompt Cards Grid (Compact, fits all screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full text-left max-w-3xl">
              {STARTER_PROMPTS.map((card, i) => (
                <div
                  key={i}
                  onClick={() => handleSendMessage(card.prompt)}
                  className="group p-3 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800/80 hover:border-[#0066FF]/40 dark:hover:border-[#38BDF8]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {card.category}
                      </span>
                      <div className="text-slate-400 group-hover:text-[#0066FF] dark:group-hover:text-[#38BDF8] transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {card.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              {/* Bot Mascot Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 select-none">
                  <Image
                    src="/headface.png"
                    alt="Copilot"
                    width={32}
                    height={32}
                    className="object-contain drop-shadow-xs"
                  />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] md:max-w-[82%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? "bg-[#0066FF] text-white rounded-tr-xs"
                    : "bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs"
                }`}
              >
                {/* Header info for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-3 pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800/80 text-[10.5px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">CapitalAI Copilot</span>
                      {msg.persona && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono uppercase text-slate-500">
                          {msg.persona}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9.5px]">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        title="Copy response"
                        className="hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content with rich markdown support */}
                <div className="text-[13px] leading-relaxed">
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                  ) : msg.content ? (
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-2" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 flex items-center gap-1.5" {...props}>
                              <span className="w-1.5 h-3 bg-[#0066FF] dark:bg-[#38BDF8] rounded-full inline-block" />
                              {props.children}
                            </h3>
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-1.5 text-slate-800 dark:text-slate-200 leading-relaxed text-[13px]" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="my-2 space-y-1 list-disc list-inside text-slate-800 dark:text-slate-200" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="my-2 space-y-1 list-decimal list-inside text-slate-800 dark:text-slate-200" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-[13px] leading-relaxed" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="my-2 pl-3 py-1 border-l-2 border-[#0066FF] dark:border-[#38BDF8] bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg text-xs italic text-slate-700 dark:text-slate-300" {...props} />
                          ),
                          hr: ({ node, ...props }) => (
                            <hr className="my-3 border-slate-200 dark:border-slate-800" {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                              <table className="w-full text-left text-xs font-sans divide-y divide-slate-200 dark:divide-slate-800" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-slate-100/90 dark:bg-slate-900/80 font-bold text-slate-800 dark:text-slate-200" {...props} />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0E1526]/50" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-3 py-2 text-[11.5px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-2 text-[12px] text-slate-800 dark:text-slate-200 font-mono" {...props} />
                          ),
                          code: ({ node, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match && !String(children).includes("\n");
                            if (isInline) {
                              return (
                                <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0066FF] dark:text-[#38BDF8] font-mono text-[11.5px]" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <div className="my-2.5 rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 text-xs">
                                <div className="flex items-center justify-between px-3 py-1 bg-slate-800/80 text-[10.5px] font-mono text-slate-400">
                                  <span>{match?.[1] || "code"}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(String(children))}
                                    className="hover:text-white cursor-pointer"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <pre className="p-3 font-mono overflow-x-auto leading-relaxed">
                                  <code>{children}</code>
                                </pre>
                              </div>
                            );
                          }
                        }}
                      >
                        {preprocessMarkdown(msg.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-1.5 text-slate-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#0066FF] dark:bg-[#38BDF8] animate-ping" />
                      <span>Synthesizing quant models on Groq LPU...</span>
                    </div>
                  )}
                </div>

                {/* Streaming indicator */}
                {!isUser && isStreaming && msg.id === messages[messages.length - 1]?.id && msg.content && (
                  <span className="inline-block w-1.5 h-3.5 bg-[#0066FF] dark:bg-[#38BDF8] ml-1 animate-pulse align-middle" />
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Docked Input Bar (Always pinned, zero page scroll) */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
        
        {/* Quick Suggestion Chips (when conversation is active) */}
        {messages.length > 0 && !isStreaming && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1 no-scrollbar">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#131B2E] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-[#0066FF] dark:hover:text-[#38BDF8] border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Box Container */}
        <div className="relative rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-xs focus-within:border-[#0066FF] dark:focus-within:border-[#38BDF8] focus-within:ring-2 focus-within:ring-[#0066FF]/10 transition-all p-1.5 flex items-end gap-2">
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask CapitalAI Copilot about CVaR, portfolio optimization, risk budgets, or macro shocks..."
            className="flex-1 max-h-28 bg-transparent resize-none outline-none text-[12.5px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-1 px-2 font-sans"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {isStreaming ? (
              <button
                onClick={handleStopStreaming}
                title="Stop response"
                className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                title="Send query (Enter)"
                className="w-7 h-7 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Footer Disclaimer */}
        <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for newline</span>
          <span>Groq LPU Acceleration • Institutional Decision Support</span>
        </div>

      </div>

    </div>
  );
}
