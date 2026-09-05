import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface PortfolioContext {
  portfolioId?: string;
  totalValue?: number;
  currency?: string;
  cvar99?: number;
  var99?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  assets?: Array<{
    ticker: string;
    name: string;
    weight: number;
    value: number;
    assetClass: string;
  }>;
  safeguardStatus?: {
    level: string;
    isBreached: boolean;
    circuitBreaker: string;
  };
  market?: {
    nifty?: number;
    sp500?: number;
    vix?: number;
    usdInr?: number;
  };
}

function buildSystemPrompt(persona: string = "quant", context?: PortfolioContext): string {
  let personaInstruction = "";
  if (persona === "cro") {
    personaInstruction = `
ROLE & PERSONA: Chief Risk Officer (CRO)
- Emphasize tail-risk protection, downside preservation, and regulatory compliance (SEBI, RBI, Basel III / institutional risk budgets).
- Focus primarily on 99% CVaR (Expected Shortfall), Cornish-Fisher VaR, liquidity horizons, and circuit breaker trip thresholds (AMBER / RED).
- Strictly flag excessive leverage, concentration risks, and illiquid exposure.
- Recommend explicit hedging instruments and defensive capital preservation protocols.`;
  } else if (persona === "executive") {
    personaInstruction = `
ROLE & PERSONA: Executive Brief / Investment Committee
- Deliver high-level, clear, decision-oriented summaries for C-suite leadership and Managing Directors.
- Emphasize strategic asset allocation, capital preservation vs alpha trade-offs, and macro resilience.
- Keep explanations crisp, structured, and action-ready with high-level takeaways.`;
  } else {
    personaInstruction = `
ROLE & PERSONA: Senior Quantitative Strategist & Portfolio Manager
- Deliver rigorous quantitative analysis covering Mean-CVaR portfolio optimization, efficient frontier tradeoffs, covariance dynamics, and factor models.
- Contrast modern portfolio theory (Markowitz mean-variance) with tail-risk aware Mean-CVaR optimization.
- Provide tactical rebalancing recommendations, turnover limits, and Sharpe/Sortino/Calmar ratio optimization.`;
  }

  let contextSnippet = "";
  if (context && context.totalValue) {
    const formattedAum = (context.totalValue / 1000000).toFixed(2);
    const assetList = context.assets
      ? context.assets.map((a) => `• ${a.ticker} (${a.name}): ${(a.weight * 100).toFixed(1)}% | $${(a.value / 1000000).toFixed(2)}M [${a.assetClass}]`).join("\n")
      : "• SPY (35%), AGG (25%), QQQ (15%), GLD (10%), VNQ (10%), BIL (5%)";

    contextSnippet = `
ACTIVE INSTITUTIONAL PORTFOLIO CONTEXT:
- Portfolio ID: ${context.portfolioId || "SENTINEL-MAIN-01"}
- Total AUM: $${formattedAum}M (${context.currency || "USD"})
- Key Risk Metrics:
  * 99% CVaR (10d): ${(context.cvar99 ? (context.cvar99 * 100).toFixed(2) : "8.20")}% (Budget: 8.00%)
  * 99% VaR (10d): ${(context.var99 ? (context.var99 * 100).toFixed(2) : "5.40")}%
  * Max Drawdown: ${(context.maxDrawdown ? (context.maxDrawdown * 100).toFixed(1) : "7.8")}% (Limit: 12.0%)
  * Sharpe Ratio: ${context.sharpeRatio?.toFixed(2) || "1.84"}
  * Safeguard State: ${context.safeguardStatus?.level || "AMBER"} (Circuit Breaker: ${context.safeguardStatus?.circuitBreaker || "Active Monitored"})
- Current Asset Allocation:
${assetList}
${context.market ? `- Live Benchmark Context: NIFTY ~${Math.round(context.market.nifty || 23897)} | India VIX ~${context.market.vix || 10.7} | USD/INR ~₹${context.market.usdInr || 84.1}` : ""}
`;
  } else {
    contextSnippet = `
DEFAULT BENCHMARK PORTFOLIO CONTEXT:
- Total AUM: $10.00M USD
- Allocations: SPY (35%), AGG (25%), QQQ (15%), GLD (10%), VNQ (10%), BIL (5%)
- Current Risk Budget: 8.00% 99% CVaR threshold. Current reading is slightly elevated in AMBER state due to equity volatility.
`;
  }

  return `You are CapitalAI Copilot, an elite Institutional Quantitative Risk & Investment Strategy AI developed for CapitalAI.

${personaInstruction}

${contextSnippet}

CORE CAPABILITIES & DOMAIN KNOWLEDGE:
1. Mean-CVaR Optimization: Rockafellar & Uryasev linear programming formulation for minimizing Conditional Value at Risk subject to target returns.
2. Tail-Risk Diagnostics: Cornish-Fisher expansion, historical empirical distribution, and Monte Carlo multi-asset stress testing.
3. Automated Safeguards & Circuit Breakers:
   - NORMAL: Operating within all risk budgets.
   - AMBER: CVaR or Drawdown within 90-100% of ceiling. Halts automated rebalancing expansion and notifies desk.
   - RED: Hard breach. Automated derisking protocols engage, liquidating to cash equivalents (BIL/Treasuries).
4. Cross-Market & Macro: Global equities (US, Europe, India NSE/BSE), currency hedging (USD/INR), yield curve shifts, and commodity hedges (Gold).

RESPONSE GUIDELINES:
- Formatting: Format responses cleanly with Markdown headers (###), bullet points, and quantitative comparison tables where appropriate.
- Tables: Always format comparison tables using strict GitHub-Flavored Markdown (GFM) syntax with explicit pipes and separator dashes (e.g.:
  | Asset | Current Weight | Target Weight | Action |
  |---|---|---|---|
  | SPY | 35.0% | 30.2% | Sell $0.55M |
  Ensure tables have empty lines before and after them.
- Numbers: Bold key financial figures, percentages, and metrics.
- Mathematical precision: Explain formulas clearly (e.g. Rockafellar-Uryasev LP, Sharpe ratio).
- Be articulate, mathematically precise, objective, and institutional. Avoid generic disclaimer disavowals in every sentence; assume the user is a professional portfolio manager or risk analyst.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      model = "openai/gpt-oss-120b",
      persona = "quant",
      portfolioContext,
    } = body;

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt(persona, portfolioContext);

    // Sanitize and prepare conversation history
    const conversationMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-12).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      })),
    ];

    // Supported models on Groq
    const allowedModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "groq/compound",
    ];
    const selectedModel = allowedModels.includes(model) ? model : "openai/gpt-oss-120b";

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: conversationMessages,
        temperature: persona === "cro" ? 0.3 : persona === "executive" ? 0.5 : 0.6,
        max_tokens: 2500,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", groqResponse.status, errorText);
      return NextResponse.json(
        { error: `Groq API Error (${groqResponse.status}): ${errorText}` },
        { status: groqResponse.status }
      );
    }

    // Stream the SSE response through ReadableStream to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!groqResponse.body) {
          controller.close();
          return;
        }

        const reader = groqResponse.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") {
                if (trimmed === "data: [DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
                continue;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const jsonStr = trimmed.substring(6);
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        } catch (err: any) {
          console.error("Stream reading error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Chat API handler exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
