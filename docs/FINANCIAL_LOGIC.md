# SentinelCap — Financial & Quantitative Control Logic

This document details the mathematical formulations, risk metrics, regulatory frameworks, and control algorithms powering **SentinelCap**.

---

## 1. Coherent Tail-Risk Optimization: Mean-CVaR

### 1.1 Limitations of Classical Mean-Variance (Markowitz)
Markowitz Mean-Variance optimization assumes asset returns are jointly normally distributed and penalizes upside and downside deviations symmetrically through variance $\sigma^2 = w^T \Sigma w$. In real financial markets:
- Asset returns exhibit **fat tails (leptokurtosis)** and **negative skewness**.
- In market downturns, correlations spike toward 1.0 (loss contagion).
- Standard deviation fails to capture extreme tail risk, severely underestimating losses during market shocks.

### 1.2 Conditional Value-at-Risk (CVaR / Expected Shortfall)
Value-at-Risk ($VaR_\alpha$) represents the maximum expected loss at confidence level $\alpha$ over horizon $T$:
$$\text{VaR}_\alpha(w) = \inf \{ \gamma \in \mathbb{R} : P(L(w) \le \gamma) \ge \alpha \}$$

$VaR$ is **not a coherent risk measure** because it violates sub-additivity: $VaR(A + B)$ can be greater than $VaR(A) + VaR(B)$.

Conditional Value-at-Risk ($CVaR_\alpha$), also known as Expected Shortfall ($ES$), measures the conditional expectation of losses exceeding the $VaR_\alpha$ threshold:
$$\text{CVaR}_\alpha(w) = \mathbb{E}[L(w) \mid L(w) \ge \text{VaR}_\alpha(w)]$$

CVaR is a **strictly coherent risk measure** satisfying:
1. **Translation Invariance**: $\rho(X + c) = \rho(X) - c$
2. **Sub-additivity**: $\rho(X + Y) \le \rho(X) + \rho(Y)$
3. **Positive Homogeneity**: $\rho(\lambda X) = \lambda \rho(X), \forall \lambda \ge 0$
4. **Monotonicity**: If $X \le Y$, then $\rho(X) \ge \rho(Y)$

### 1.3 Rockafellar-Uryasev Linear Programming Formulation
Rockafellar & Uryasev (2000) proved that CVaR can be optimized without computing VaR beforehand by defining the auxiliary function:
$$F_\alpha(w, \gamma) = \gamma + \frac{1}{(1 - \alpha)} \int_{y \in \mathbb{R}^m} [f(w, y) - \gamma]^+ p(y) dy$$

For a sample of $S$ historical or simulated scenarios $y_1, y_2, \dots, y_S$:
$$\min_{w \in W, \gamma \in \mathbb{R}, z \in \mathbb{R}^S} \gamma + \frac{1}{(1 - \alpha) S} \sum_{s=1}^S z_s - \lambda \mu^T w + \kappa \sum_{i=1}^N |w_i - w_i^0|$$
Subject to:
$$z_s \ge 0, \quad \forall s \in \{1, \dots, S\}$$
$$z_s \ge -r_s^T w - \gamma, \quad \forall s \in \{1, \dots, S\}$$
$$\sum_{i=1}^N w_i = 1, \quad 0 \le w_i \le w_{\max}, \quad w_{\text{cash}} \ge w_{\text{cash\_min}}$$

Where:
- $\gamma \in \mathbb{R}$ is an unconstrained scalar representing $VaR_\alpha$.
- $z_s$ are non-negative slack variables capturing excess tail losses beyond $\gamma$.
- $\lambda \ge 0$ is the risk tolerance parameter balancing expected return against CVaR.
- $\kappa \sum |w_i - w_i^0|$ is the $L_1$ turnover penalty dampening excessive transaction costs.

---

## 2. Hierarchical Risk Parity (HRP)

Invented by Marcos López de Prado (2016), Hierarchical Risk Parity addresses the numerical instability of Markowitz quadratic programming caused by covariance matrix inversion ($\Sigma^{-1}$). HRP operates in three steps:

### 2.1 Tree Clustering
Converts the correlation matrix $\rho_{i,j}$ into an information distance metric:
$$d_{i,j} = \sqrt{\frac{1 - \rho_{i,j}}{2}} \in [0, 1]$$
Applies hierarchical agglomerative clustering with Euclidean metric and single-linkage distance:
$$D(U, V) = \min \{ d(u, v) : u \in U, v \in V \}$$

### 2.2 Quasi-Diagonalization
Reorganizes the rows and columns of the covariance matrix so that the largest covariances lie along the main diagonal, preserving the hierarchical dendrogram tree.

### 2.3 Recursive Bisection
Divides the sorted assets into clusters $C_1$ and $C_2$ iteratively. For each cluster $C_k$, computes the inverse-variance portfolio (IVP) variance:
$$w_k = \frac{\text{diag}(\Sigma_{C_k})^{-1}}{\mathbf{1}^T \text{diag}(\Sigma_{C_k})^{-1} \mathbf{1}}, \quad \tilde{\sigma}_k^2 = w_k^T \Sigma_{C_k} w_k$$
Splits allocation weight between clusters via variance parity:
$$\alpha_1 = 1 - \frac{\tilde{\sigma}_1^2}{\tilde{\sigma}_1^2 + \tilde{\sigma}_2^2}, \quad \alpha_2 = 1 - \alpha_1$$
Multiplies weights down the tree until individual asset weights are obtained.

---

## 3. Markov Regime Switching & Volatility Forecasting

### 3.1 Two-State Markov Switching Regression (Hamilton 1989)
Market dynamics alternate between distinct latent regimes:
- **State 0 (Calm / Normal)**: Modest positive drift, low variance $\sigma_0^2$.
- **State 1 (Crisis / Stressed)**: Negative drift, high variance $\sigma_1^2 \gg \sigma_0^2$.

The regime indicator $S_t \in \{0, 1\}$ follows a first-order Markov chain with transition probability matrix:
$$P = \begin{bmatrix} p_{00} & p_{01} \\ p_{10} & p_{11} \end{bmatrix}, \quad p_{ij} = P(S_t = j \mid S_{t-1} = i)$$
The return equation:
$$r_t = \mu_{S_t} + \epsilon_t, \quad \epsilon_t \sim \mathcal{N}(0, \sigma_{S_t}^2)$$
Smoothed marginal probabilities $\xi_{t \mid T} = P(S_t = 1 \mid \mathcal{F}_T)$ give real-time probability of being in a crisis. When $P(\text{Crisis}) > 0.45$, the circuit breaker transitions to an elevated state.

### 3.2 GARCH(1,1) Conditional Volatility Forecasting
$$\sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$$
Multi-step volatility forecast over $k$-day horizon:
$$\mathbb{E}[\sigma_{t+k}^2] = \sigma_L^2 + (\alpha + \beta)^k (\sigma_t^2 - \sigma_L^2), \quad \sigma_L^2 = \frac{\omega}{1 - \alpha - \beta}$$

---

## 4. Multi-Method Risk Engine & FRTB Liquidity Horizons

### 4.1 Four-Method VaR / ES Engine
1. **Historical Simulation**: Empirical quantile of order $\alpha$ from trailing returns. Non-parametric, captures fat tails and non-linearities without distributional assumptions.
2. **Parametric Delta-Normal**: $VaR_\alpha = z_\alpha \sigma_p - \mu_p$. Analytical and ultra-fast.
3. **Cornish-Fisher Expansion**: Modifies Gaussian quantile $z_\alpha$ using third moment (skewness $S$) and fourth moment (excess kurtosis $K$):
   $$z_{CF} = z_\alpha + \frac{z_\alpha^2 - 1}{6} S + \frac{z_\alpha^3 - 3 z_\alpha}{24} K - \frac{2 z_\alpha^3 - 5 z_\alpha}{36} S^2$$
4. **Monte Carlo Simulation (10,000 paths)**: Cholesky factorization of empirical covariance $\Sigma = L L^T$, generating correlated synthetic returns $r_{\text{sim}} = L Z + \mu$.

### 4.2 Component-VaR & Risk Attribution
Euler's theorem for homogeneous functions decomposes total portfolio VaR into asset contributions:
$$\text{VaR}_p = \sum_{i=1}^N w_i \frac{\partial \text{VaR}_p}{\partial w_i} = \sum_{i=1}^N \text{Component-VaR}_i$$
Where Marginal VaR is:
$$\frac{\partial \text{VaR}_p}{\partial w_i} = \frac{(\Sigma w)_i}{\sigma_p} z_\alpha$$

### 4.3 FRTB Liquidity Horizon Adjustment (Basel MAR33.12)
Under the Fundamental Review of the Trading Book (FRTB), risk factors are classified into regulatory liquidity horizons ($LH$):
- **10 Days**: Large-cap equities, Cash/T-Bills (`SPY`, `EFA`, `BIL`)
- **20 Days**: Investment grade bonds, Commodities, REITs (`AGG`, `GLD`, `VNQ`)
- **40 Days**: Investment grade corporate credit
- **60 Days**: High-yield credit, illiquid small-cap

The FRTB Expected Shortfall formula aggregates risk across nested sub-horizons:
$$ES = \sqrt{(ES_{10})^2 + \sum_{j=2}^K (ES_j)^2 \frac{LH_j - LH_{j-1}}{10}}$$

---

## 5. Statistical Backtesting & Breach Detection

### 5.1 Kupiec POF Likelihood Ratio Test (Unconditional Coverage)
Tests whether the observed failure rate $\hat{p} = x / N$ equals the nominal failure rate $p = 1 - \alpha$:
$$LR_{POF} = -2 \ln \left[ \frac{(1 - p)^{N - x} p^x}{(1 - \hat{p})^{N - x} \hat{p}^x} \right] \sim \chi^2(1)$$
If $p\text{-value} > 0.05$, the model passes unconditional coverage.

### 5.2 Christoffersen Independence Test (Conditional Coverage)
Tests whether VaR breaches are independently distributed or cluster together consecutively. Defines transition indicator $n_{ij}$ (number of days in state $i$ followed by state $j$):
$$LR_{\text{ind}} = -2 \ln \left[ \frac{\pi^{(n_{01} + n_{11})} (1 - \pi)^{(n_{00} + n_{10})}}{\pi_0^{n_{01}} (1 - \pi_0)^{n_{00}} \pi_1^{n_{11}} (1 - \pi_1)^{n_{10}}} \right] \sim \chi^2(1)$$
Clustering indicates the model fails during market stress periods.

### 5.3 Basel Committee Traffic Light Framework
For 250 trailing business days at 99% 1-day VaR:
| Zone | Exceptions ($x$) | Supervisory Action | Multiplier ($m$) |
| :--- | :---: | :--- | :---: |
| **Green** | $0 \le x \le 4$ | Model accepted | $3.00$ |
| **Amber** | $5 \le x \le 9$ | Supervisory monitoring + capital surcharge | $3.00 + 0.10 \times (x - 4)$ |
| **Red** | $x \ge 10$ | Automatic model rejection & standardized fallback | $4.00$ |

---

## 6. Autonomous 3-Tier Safeguard & Circuit Breaker Logic

The platform implements an automated multi-threshold safety control system:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MARKET TELEMETRY INGEST                         │
│   • Real-Time CVaR 99%   • Portfolio Drawdown   • Markov Regime State   │
│   • Liquidity Coverage   • Volatility Shock     • Backtest Breaches     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3-TIER CIRCUIT BREAKER RULES                      │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 1: AMBER ALERT                                                   │
│ Trigger: CVaR > 1.2x Risk Budget (7.2%) OR Regime == "Crisis"          │
│ Action:  Broadcast dashboard warning, intensify telemetry polling,     │
│          record audit log event. No capital moved.                     │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: RED ALERT (Defensive Auto-Rebalance)                          │
│ Trigger: CVaR > 1.5x Risk Budget (9.0%) OR Drawdown > 8.0%             │
│ Action:                                                                │
│   • AUTO MODE: Autonomous execution of HRP capital preservation trades │
│     (Increase AGG to 40%, BIL to 20%, reduce high-beta equities)       │
│   • MANUAL MODE: Generate recommended trade ticket, await CRO approval │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: FROZEN (Emergency Capital Preservation)                       │
│ Trigger: Drawdown > 15.0% OR Liquidity Ratio < 0.80                    │
│ Action:  Halt all algorithmic execution. Liquidate to 100% Cash/T-Bills│
│          (BIL). System locked until manual CRO cryptographic override. │
└────────────────────────────────────────────────────────────────────────┘
```
