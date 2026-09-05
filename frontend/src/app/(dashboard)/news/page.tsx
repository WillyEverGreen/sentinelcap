"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
  Globe,
  Landmark,
  Zap,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Filter,
  CheckCircle2,
  Coins,
  Layers
} from "lucide-react";
import { NewsArticle } from "@/app/api/news/route";

type CategoryFilter = "all" | "india" | "global" | "central_bank" | "commodities" | "high_impact";

export default function MarketNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchNews = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
          setLastUpdated(new Date(data.lastUpdated || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-refresh news feed every 3 minutes
    const interval = setInterval(() => fetchNews(), 180000);
    return () => clearInterval(interval);
  }, []);

  // Filtered news logic
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Category tab filtering
      if (activeCategory === "india" && article.category !== "india") return false;
      if (activeCategory === "global" && article.category !== "global") return false;
      if (activeCategory === "central_bank" && article.category !== "central_bank") return false;
      if (activeCategory === "commodities" && article.category !== "commodities") return false;
      if (activeCategory === "high_impact" && article.impact !== "HIGH") return false;

      // Keyword search filtering
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesHeadline = article.headline.toLowerCase().includes(query);
        const matchesSource = article.source.toLowerCase().includes(query);
        const matchesTags = article.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesHeadline && !matchesSource && !matchesTags) return false;
      }

      return true;
    });
  }, [articles, activeCategory, searchQuery]);

  // Top spotlight breaking article (highest impact recent story)
  const spotlightArticle = useMemo(() => {
    return articles.find((a) => a.impact === "HIGH") || articles[0] || null;
  }, [articles]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "india":
        return {
          label: "Indian Markets",
          icon: (
            <svg className="w-3 h-3 rounded-full shrink-0" viewBox="0 0 36 36">
              <rect width="36" height="12" fill="#FF9933" />
              <rect y="12" width="36" height="12" fill="#FFFFFF" />
              <rect y="24" width="36" height="12" fill="#138808" />
              <circle cx="18" cy="18" r="3.5" fill="#000080" />
            </svg>
          ),
          color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
        };
      case "global":
        return {
          label: "Global Macro",
          icon: <Globe className="w-3 h-3 shrink-0 text-blue-500" />,
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        };
      case "central_bank":
        return {
          label: "Central Bank Policy",
          icon: <Landmark className="w-3 h-3 shrink-0 text-purple-500" />,
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        };
      case "commodities":
        return {
          label: "Commodities & FX",
          icon: <Coins className="w-3 h-3 shrink-0 text-emerald-500" />,
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        };
      default:
        return {
          label: "Financial Wire",
          icon: <Newspaper className="w-3 h-3 shrink-0 text-slate-500" />,
          color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
        };
    }
  };

  const getSentimentBadge = (sentiment: "BULLISH" | "BEARISH" | "NEUTRAL") => {
    switch (sentiment) {
      case "BULLISH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-2.5 h-2.5" />
            Bullish
          </span>
        );
      case "BEARISH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-2.5 h-2.5" />
            Bearish
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold text-slate-600 dark:text-slate-400">
            Neutral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-text font-sans max-w-7xl mx-auto">
      
      {/* Top Banner & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Newspaper className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Market News & Macro Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time verified financial dispatches across NSE, BSE, Federal Reserve, RBI, and global energy markets with direct source links.
          </p>
        </div>

        {/* Live Controls & Refresh Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: <strong className="font-mono">{lastUpdated || "Live"}</strong></span>
          </div>
          
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131B2E] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0066FF] dark:text-[#38BDF8] ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
          </button>
        </div>
      </div>

      {/* Spotlight Breaking Story Hero (when available) */}
      {spotlightArticle && !loading && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-cyan-900/10 dark:from-blue-950/40 dark:via-[#131B2E] dark:to-cyan-950/30 border border-blue-200/80 dark:border-blue-900/40 p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                <Flame className="w-3 h-3 fill-current" />
                Spotlight Dispatch
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(spotlightArticle.category).color}`}>
                {getCategoryBadge(spotlightArticle.category).icon}
                <span>{getCategoryBadge(spotlightArticle.category).label}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="font-bold text-slate-700 dark:text-slate-300">{spotlightArticle.source}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">{spotlightArticle.relativeTime}</span>
            </div>
          </div>

          <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-snug mb-2">
            {spotlightArticle.headline}
          </h2>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-4xl">
            {spotlightArticle.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-1.5">
              {spotlightArticle.tags.map((tag) => (
                <span key={tag} className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href={`/chat`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/70 dark:border-blue-800/60 text-xs font-bold text-[#0066FF] dark:text-[#38BDF8] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask CapitalAI Copilot</span>
              </Link>

              <a
                href={spotlightArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Read Full Story</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#131B2E] p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Scope Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: "all", label: "All Stories", icon: <Layers className="w-3.5 h-3.5" /> },
            {
              id: "india",
              label: "India Markets",
              icon: (
                <svg className="w-3.5 h-3.5 rounded-full shrink-0" viewBox="0 0 36 36">
                  <rect width="36" height="12" fill="#FF9933" />
                  <rect y="12" width="36" height="12" fill="#FFFFFF" />
                  <rect y="24" width="36" height="12" fill="#138808" />
                  <circle cx="18" cy="18" r="3.5" fill="#000080" />
                </svg>
              )
            },
            { id: "global", label: "Global Macro", icon: <Globe className="w-3.5 h-3.5 text-blue-500" /> },
            { id: "central_bank", label: "Central Banks", icon: <Landmark className="w-3.5 h-3.5 text-purple-500" /> },
            { id: "commodities", label: "Commodities & FX", icon: <Coins className="w-3.5 h-3.5 text-emerald-500" /> },
            { id: "high_impact", label: "High Impact", icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as CategoryFilter)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? "bg-[#0066FF] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, ticker, source..."
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066FF] dark:focus:border-[#38BDF8] transition-all font-sans"
          />
        </div>

      </div>

      {/* News Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/80 dark:border-slate-800 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-3/4 h-8 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded-md mt-4" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => {
            const catBadge = getCategoryBadge(article.category);
            return (
              <div
                key={article.id}
                className="group flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800/90 hover:border-[#0066FF]/40 dark:hover:border-[#38BDF8]/40 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  {/* Card Meta Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${catBadge.color}`}>
                      {catBadge.icon}
                      <span>{catBadge.label}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {article.impact === "HIGH" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-[9.5px] font-extrabold text-amber-600 dark:text-amber-400">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          High Impact
                        </span>
                      )}
                      {getSentimentBadge(article.sentiment)}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#0066FF] dark:group-hover:text-[#38BDF8] transition-colors line-clamp-3">
                    {article.headline}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.map((t) => (
                      <span key={t} className="text-[9.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Source & Link */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {article.source}
                    </p>
                    <p className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500">
                      {article.relativeTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href="/chat"
                      title="Analyze with CapitalAI Copilot"
                      className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#0066FF] dark:text-[#38BDF8] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1E293B] hover:bg-[#0066FF] hover:text-white dark:hover:bg-[#38BDF8] dark:hover:text-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800">
          <Newspaper className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No intelligence dispatches found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            No articles match your current search query or filter selection.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="px-3 py-1.5 rounded-xl bg-[#0066FF] text-white text-xs font-semibold shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
