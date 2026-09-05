/**
 * SentinelCap API Client
 * Typed REST interface to FastAPI backend with offline fallback resilience.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    throw err;
  }
}

export interface Asset {
  ticker: string;
  name: string;
  asset_class: string;
  category: string;
  weight: number;
  current_value: number;
  liquidity_horizon_days: number;
  expected_annual_return: number;
  annual_volatility: number;
}

export interface PortfolioData {
  portfolio_id: string;
  total_value: number;
  currency: string;
  risk_budget_cvar_99: number;
  max_drawdown_limit: number;
  critical_drawdown_limit: number;
  min_liquidity_ratio: number;
  assets: Asset[];
}

export interface PortfolioResponse {
  portfolio: PortfolioData;
  recent_prices: Array<{ date: string; [ticker: string]: any }>;
  asset_count: number;
  total_value: number;
  currency: string;
}

export interface RiskMetricsResponse {
  portfolio_id: string;
  total_value: number;
  active_weights: Record<string, number>;
  risk_metrics: {
    confidence_level: number;
    horizon_days: number;
    portfolio_value: number;
    var_metrics: {
      historical: { var_pct: number; var_dollar: number; es_cvar_pct: number; es_cvar_dollar: number };
      parametric: { var_pct: number; var_dollar: number; es_cvar_pct: number; es_cvar_dollar: number };
      cornish_fisher: { var_pct: number; var_dollar: number };
      monte_carlo: { var_pct: number; var_dollar: number; es_cvar_pct: number; es_cvar_dollar: number };
    };
    moments: {
      annual_expected_return: number;
      annual_volatility: number;
      skewness: number;
      excess_kurtosis: number;
    };
    performance_ratios: {
      sharpe_ratio: number;
      sortino_ratio: number;
      calmar_ratio: number;
    };
    drawdown: {
      max_drawdown_pct: number;
      current_drawdown_pct: number;
      max_drawdown_dollar: number;
    };
    risk_attribution: Record<string, {
      weight: number;
      component_var_pct: number;
      component_var_dollar: number;
      pct_of_total_risk: number;
    }>;
  };
  regime: {
    current_regime: number;
    regime_label: string;
    crisis_probability: number;
    calm_probability: number;
    transition_matrix: number[][];
    regime_volatilities?: { calm_annual_vol: number; crisis_annual_vol: number };
    model_status: string;
  };
  volatility_forecast: {
    current_annual_vol: number;
    forecast_vol_path: number[];
    vol_regime: string;
    persistence: number;
  };
  frtb_liquidity: {
    base_horizon_days: number;
    weighted_average_lh_days: number;
    liquidity_scaling_multiplier: number;
    base_cvar_pct: number;
    liquidity_adjusted_cvar_pct: number;
    liquidity_adjusted_cvar_dollar: number;
    liquidity_coverage: {
      hqla_weight: number;
      hqla_dollar: number;
      stressed_30d_outflow: number;
      coverage_ratio: number;
      status: string;
    };
    asset_horizons: Record<string, {
      weight: number;
      liquidity_horizon_days: number;
      scaling_factor: number;
      allocated_value: number;
    }>;
  };
  backtesting_validation: {
    total_observations: number;
    confidence_level: number;
    expected_exceptions: number;
    observed_exceptions: number;
    expected_failure_rate: number;
    observed_failure_rate: number;
    kupiec_test: {
      test_statistic_lr: number;
      p_value: number;
      null_hypothesis: string;
      is_accepted: boolean;
    };
    christoffersen_test: {
      test_statistic_lr: number;
      p_value: number;
      null_hypothesis: string;
      is_accepted: boolean;
    };
    basel_traffic_light: {
      zone: string;
      trailing_250_scaled_exceptions: number;
      capital_multiplier: number;
      verdict: string;
    };
  };
  circuit_breaker: CircuitBreakerStatus;
}

export interface CircuitBreakerStatus {
  status: "NORMAL" | "AMBER" | "RED" | "FROZEN";
  mode: "auto" | "manual";
  trigger_reason?: string;
  action_taken?: string;
  recommended_weights?: Record<string, number> | null;
  current_weights?: Record<string, number>;
  timestamp?: string;
  last_evaluated?: string;
  thresholds?: {
    risk_budget_cvar_99: number;
    amber_cvar_threshold: number;
    red_cvar_threshold: number;
    max_drawdown_limit: number;
    critical_drawdown_limit: number;
    min_liquidity_ratio: number;
  };
}

export interface OptimizeRequest {
  strategy: "mean_cvar" | "hrp" | "markowitz_max_sharpe" | "markowitz_min_variance";
  risk_tolerance: number;
  max_weight: number;
  min_cash_buffer: number;
  turnover_penalty: number;
  current_weights?: Record<string, number>;
}

export interface TradeItem {
  ticker: string;
  current_weight: number;
  optimal_weight: number;
  delta_weight: number;
  dollar_change: number;
  action: "BUY" | "SELL" | "HOLD";
}

export interface OptimizeResponse {
  optimization_result: {
    strategy: string;
    weights: Record<string, number>;
    expected_annual_return: number;
    annual_volatility: number;
    sharpe_ratio: number;
    cvar_95_10d: number;
    var_95_10d: number;
    turnover?: number;
    status: string;
  };
  current_weights: Record<string, number>;
  trade_list: TradeItem[];
  total_turnover_pct: number;
  total_turnover_dollar: number;
  efficient_frontier: {
    frontier_points: Array<{ expected_return: number; volatility: number; sharpe: number; cvar_95_10d: number }>;
    current_portfolio: { expected_return: number; volatility: number; sharpe: number; cvar_95_10d: number } | null;
    max_sharpe_portfolio: { expected_return: number; volatility: number; sharpe: number; cvar_95_10d: number; weights: Record<string, number> };
    min_variance_portfolio: { expected_return: number; volatility: number; sharpe: number; cvar_95_10d: number; weights: Record<string, number> };
  };
}

export interface StressTestResponse {
  scenario_id: string;
  scenario_name: string;
  scenario_description: string;
  volatility_multiplier: number;
  pre_shock: {
    portfolio_value: number;
    cvar_99_10d: number;
    var_99_10d: number;
    weights: Record<string, number>;
  };
  post_shock: {
    portfolio_value: number;
    capital_shortfall_dollar: number;
    portfolio_loss_pct: number;
    stressed_cvar_99_10d: number;
    post_shock_weights: Record<string, number>;
  };
  asset_breakdown: Record<string, {
    initial_weight: number;
    initial_value: number;
    shock_pct: number;
    dollar_impact: number;
    post_shock_value: number;
  }>;
  circuit_breaker_result: CircuitBreakerStatus;
  recommended_defensive_weights: Record<string, number>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: "NORMAL" | "AMBER" | "RED" | "FROZEN";
  mode: "auto" | "manual";
  trigger: string;
  metric_name: string;
  metric_value: number;
  threshold_value: number;
  action_taken: string;
  details: Record<string, any>;
}

export interface AuditLogResponse {
  count: number;
  entries: AuditLogEntry[];
}

// API Methods
export async function getPortfolio(): Promise<PortfolioResponse> {
  return fetchJSON<PortfolioResponse>("/api/portfolio");
}

export async function getRiskStatus(): Promise<RiskMetricsResponse> {
  return fetchJSON<RiskMetricsResponse>("/api/risk/status");
}

export async function runOptimization(req: OptimizeRequest): Promise<OptimizeResponse> {
  return fetchJSON<OptimizeResponse>("/api/optimize", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getStressScenarios(): Promise<Record<string, any>> {
  return fetchJSON<Record<string, any>>("/api/stress-test/scenarios");
}

export async function runStressTest(req: {
  scenario_id: string;
  custom_shocks?: Record<string, number>;
  custom_vol_multiplier?: number;
  current_weights?: Record<string, number>;
}): Promise<StressTestResponse> {
  return fetchJSON<StressTestResponse>("/api/stress-test", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getSafeguardStatus(): Promise<CircuitBreakerStatus> {
  return fetchJSON<CircuitBreakerStatus>("/api/safeguard/status");
}

export async function toggleSafeguardMode(mode: "auto" | "manual"): Promise<{ mode: string; status: string }> {
  return fetchJSON<{ mode: string; status: string }>("/api/safeguard/toggle", {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
}

export async function resetCircuitBreaker(officer_id = "CRO-AUTH-01", reason = "Operational override"): Promise<{ status: string; message: string }> {
  return fetchJSON<{ status: string; message: string }>("/api/safeguard/reset", {
    method: "POST",
    body: JSON.stringify({ officer_id, reason }),
  });
}

export async function getAuditLog(limit = 100): Promise<AuditLogResponse> {
  return fetchJSON<AuditLogResponse>(`/api/safeguard/audit-log?limit=${limit}`);
}

export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  high: number;
  low: number;
  prev_close: number;
  source: string;
}

export interface MacroSensor {
  name: string;
  symbol: string;
  value: number;
  unit?: string;
  regime?: string;
  source: string;
}

export interface TreasuryRate {
  record_date: string;
  security: string;
  rate: number;
  source: string;
}

export interface IndianMarketTelemetry {
  benchmark: {
    name: string;
    symbol: string;
    price: number;
    change: number;
    change_pct: number;
    currency: string;
    source: string;
  };
  sensex: {
    name: string;
    symbol: string;
    price: number;
    change: number;
    change_pct: number;
    currency: string;
    source: string;
  };
  india_vix: {
    name: string;
    symbol: string;
    value: number;
    regime: string;
    source: string;
  };
  usd_inr: {
    name: string;
    symbol: string;
    rate: number;
    source: string;
  };
  rbi_repo_rate: {
    name: string;
    value: number;
    unit: string;
    source: string;
  };
  gsec_10y: {
    name: string;
    value: number;
    unit: string;
    source: string;
  };
  quotes: Record<string, { name: string; price: number; change_pct: number }>;
  cross_market_correlation: {
    nifty_vs_sp500: number;
    fpi_net_flow_cr: string;
    brent_crude_usd: number;
    spillover_status: string;
  };
}

export interface MarketOverviewResponse {
  status: string;
  timestamp: string;
  quotes: Record<string, LiveQuote>;
  macro: Record<string, MacroSensor>;
  india?: IndianMarketTelemetry;
  treasury_rates: TreasuryRate[];
  active_data_sources: string[];
}

export interface LiveNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  timestamp: string;
  category: string;
  api_source: string;
}

export interface LiveNewsResponse {
  count: number;
  source: string;
  items: LiveNewsItem[];
}

export interface SecFilingItem {
  entity: string;
  form: string;
  filing_date: string;
  description: string;
  api_source: string;
}

export interface SecFilingsResponse {
  count: number;
  source: string;
  items: SecFilingItem[];
}

export async function getLiveMarketOverview(): Promise<MarketOverviewResponse> {
  return fetchJSON<MarketOverviewResponse>("/api/live-feed/market-overview");
}

export async function getLiveNews(): Promise<LiveNewsResponse> {
  return fetchJSON<LiveNewsResponse>("/api/live-feed/news");
}

export async function getSecFilings(): Promise<SecFilingsResponse> {
  return fetchJSON<SecFilingsResponse>("/api/live-feed/sec-filings");
}
