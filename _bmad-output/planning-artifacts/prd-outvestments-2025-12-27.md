---
version: 2.0
date: 2025-12-30
author: Matt (with Claude)
status: approved
related: product-brief-outvestments-2025-12-26.md
---

# Product Requirements Document: Outvestments

> **Tagline:** "Outvest the Rest" | "Outvest the Best"

---

## 1. Executive Summary

Outvestments is a gamified platform for **proving, measuring, and learning investing skill** through paper trading and prediction tracking. Unlike traditional paper trading apps that focus on simulated returns, Outvestments emphasizes **thesis documentation**, **time-normalized scoring**, and a **game-like experience** that makes tracking predictions engaging rather than tedious.

### Core Value Propositions

1. **Skill Proof**: Prove investing ability without risking real money
2. **Skill Discovery**: Identify genuine skill vs luck through transparent records
3. **Fair Comparison**: Time-normalized metrics (PPD) enable apples-to-apples comparison
4. **Self-Knowledge**: Learn which sectors, catalysts, and thesis types work for YOU

### The Six Messaging Pillars

These messages are woven throughout the app to teach better trading habits:

| Pillar | Message | Why It Matters |
|--------|---------|----------------|
| **Trades You Can Trust** | Immutable records, timestamped predictions | Traders can't verify their own track records. We fix that. |
| **Everyone Wins in a Good Market** | Bull/Bear/Flat tagging, benchmark comparison | Bull markets create false confidence. We show context. |
| **Trading the Right Way** | Thesis-first workflow (Target → Aim → Shot) | Most traders skip fundamentals. We force discipline. |
| **Have a Plan and Know It** | Exit conditions, warning signs, macro risks | Traders know when to get in but not out. We remind them. |
| **The Only App With a Real Scoreboard** | PPD, accuracy, difficulty, NPC opponents | No other app scores trading performance meaningfully. |
| **The Only App That Shows Opportunity Cost** | Dollar difference vs benchmark, not just % | "I made 20%" means nothing without context. |

**Full Messaging Strategy:** See [messaging-and-positioning.md](messaging-and-positioning.md)

### Design Philosophy

- **Game feel, not finance feel** - Engaging, fun, less intimidating
- **Scoreboard first** - Performance is the hero, not portfolio value
- **Transparency over vanity** - All predictions visible, wins AND losses
- **Learning over bragging** - Personal growth is the primary value

---

## 2. Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL |
| Authentication | Authentik (existing infrastructure) |
| Trading API | Alpaca Paper Trading API |
| Testing | Playwright (E2E) + Vitest (unit) |
| Monitoring | Sentry (error tracking, performance) |
| Deployment | Docker containers (self-hosted) |
| Jobs | Nightly cron for EOD data capture |

### Infrastructure Requirements

- Docker Compose deployment per AppServices standards
- Per-user Alpaca API key storage (AES-256 encrypted)
- Nightly job for end-of-day portfolio snapshots
- Full history retention (no data expiration)
- Immutable audit logs for all financial actions

### Price Data Strategy

- **Not real-time** - 20-30 minute update frequency is acceptable
- **On-demand caching** - Only fetch when user requests, cache for 15-30 min
- After cache expires, next user request triggers fresh fetch
- All price requests logged to database

### API Rate Limiting

- Monitor inbound AND outbound API calls
- Rate limit outbound to avoid flooding providers:
  - Alpaca API
  - Market data provider (Alpha Vantage / FinHub / Polygon TBD)
- Queue and throttle during high-traffic periods

### Shared API Resources

DoughFlow project has existing API keys for financial data services that can be leveraged if needed:

| Service       | Available         | Notes                                           |
|---------------|-------------------|-------------------------------------------------|
| Polygon.io    | Yes (free + paid) | Real-time WebSocket, paid key for full SIP data |
| Finnhub       | Yes               | Real-time WebSocket support                     |
| Alpha Vantage | Yes               | Limited free tier (25 req/day as of 2025)       |
| CoinMarketCap | Yes               | For future crypto support                       |
| SnapTrade     | Yes               | Brokerage aggregation (future import feature)   |
| E*TRADE       | Yes               | Brokerage integration                           |
| Plaid         | Yes               | Bank account connections                        |
| SimpleFIN     | Yes               | Financial data aggregation                      |

**Location:** `AppServices/env/doughflow.env`

**Primary Strategy:** Use Alpaca's included WebSocket streaming for real-time data (IEX feed, free with paper trading). Fall back to DoughFlow's Polygon paid key if full SIP coverage needed.

### Testing Strategy

**End-to-End (Playwright):**
- Critical user flows validated on every PR
- Login/logout flow
- Target creation → Aim addition → Shot execution → Position close
- Scoreboard calculations
- Settings changes
- Run in CI before merge

**Unit Testing (Vitest):**
- Scoring calculation functions
- API route handlers
- Data transformation utilities
- Component logic (non-visual)

**Test Coverage Targets:**
- Scoring logic: 100% (critical)
- API routes: 80%+
- Components: 60%+

### Monitoring & Observability

**Sentry Integration:**
- Error tracking (frontend + API routes)
- Performance monitoring (Core Web Vitals)
- Session replay for debugging (optional)
- Release tracking with source maps

**Logging (Loki via AppServices):**
- API request/response logging
- Alpaca API call logging
- Authentication events
- Background job execution

**Health Checks:**
- `/api/health` endpoint for uptime monitoring
- Database connectivity check
- Alpaca API connectivity check (optional, cached)

### Session Management

- Default timeout: 60 minutes
- Power users: Extended timeout (configurable)
- Authentik handles session via OIDC

### Multi-User Architecture

- Multi-tenant from day 1
- Each user provides their own Alpaca API credentials
- User data fully isolated
- Authentik SSO integration

---

## 3. Core Concepts & Terminology

### Hierarchy

```
TARGET (The Thesis)
└── AIM (Specific ticker + price + date)
    └── SHOT (The trade/order)
```

### Prediction Units

| Term | Definition |
|------|------------|
| **Target** | An investment thesis/prediction. Can be broad (sector, theme) or specific (single stock). Contains the "why" of your prediction. |
| **Aim** | A specific asset + price target + target date under a Target. The "what" and "when" - e.g., "NVDA +20% by Dec 2025". One Target can have multiple Aims. |
| **Shot** | An individual trade/order within an Aim. The execution. Can be stock or options. Exists before AND after execution. |
| **Trigger** | The execution event. Market = execute immediately. Limit = execute when price hits target. |
| **Stray Shot** | A Shot without an Aim/Target. Discouraged but allowed for quick entries or external trade accounting. |
| **Tag** | User-created labels for categorization (AI, robotics, earnings, etc.). Open system, applied at Target level. |

### Key Metrics

| Term | Definition |
|------|------------|
| **PPD** | Performance Per Day - normalized return metric enabling fair comparison across holding periods |
| **Pace** | Required %/month gain to hit target from current price |
| **Alpha** | Your return minus NPC opponent's return (benchmark comparison) |
| **NPC Opponent** | Computer-controlled benchmark (S&P 500, NASDAQ, etc.) you're always competing against |

### Target Components (The Thesis)

| Field | Description | Required |
|-------|-------------|----------|
| Thesis | WHY you believe this will happen | Yes |
| Target Type | Stock, Sector, Market, Theme, or Event | Yes |
| Catalyst | TYPE of play (see categories below) | Yes |
| **Conviction Level** | High, Medium, or Low/Exploratory | Yes |
| **Risks Identified** | Unique risks to this thesis | Recommended |
| **Abort Trigger** | What would invalidate this thesis? | Recommended |
| Tags | User-defined labels | Optional |
| Broad Timeframe | General timeframe for thesis (optional) | Optional |

### Conviction Levels (Metadata Only)

| Level | Description | Typical Use |
|-------|-------------|-------------|
| **High** | Would allocate significant capital | Strong thesis, high confidence |
| **Medium** | Leaning toward this thesis | Moderate confidence |
| **Low/Exploratory** | Track-only hypothesis | Testing an idea |

**Important:** Conviction level is metadata only. It does NOT affect scoring or leaderboards. Used for:
- Filtering views
- Analytics segmentation
- Coaching tone adjustment
- Post-mortem insights

### Aim Components (The Prediction)

| Field | Description | Required |
|-------|-------------|----------|
| Target | Parent target | Yes |
| Ticker | The asset (e.g., TSLA, AAPL) | Yes |
| **Aim Type** | Playable or Monitor | Yes |
| Target Price (Realistic) | Expected asset price | Yes |
| Target Price (Reach) | Stretch goal price | Optional |
| Target Date | Calendar date for prediction | Yes |
| Rationale | Why this symbol for this thesis? | Recommended |

### Aim Types: Playable vs Monitor

| Type | Description | Shots Allowed | Scoring | Leaderboard |
|------|-------------|:-------------:|:-------:|:-----------:|
| **Playable** | Full execution eligible - real predictions | Yes | Full | Yes |
| **Monitor** | Paper tracking only - thesis validation | No | None | No |

**Monitor Aims track:**
- Directional outcome (was thesis correct?)
- Magnitude vs market
- Relative performance vs benchmark
- Correlation to main playable aim(s)
- "What if" theoretical P&L (Premium feature)

**Key Rules:**
- Monitor Aims do NOT affect leaderboards
- They contribute to Thesis Validity analysis and learning insights
- Users can track predictions without risking capital
- Encourages hypothesis testing before committing money

### Shot Components (The Trade)

| Field | Description | Required |
|-------|-------------|----------|
| Aim | Parent aim (nullable for stray shots) | No |
| Direction | Buy or Sell | Yes |
| Entry Price | Price at position open | Yes |
| Entry Date | When position opened | Yes |
| Position Size | Dollar amount (if paper trading) | Optional |
| Trigger Type | Market or Limit | Yes |
| Type | Stock or Option | Yes |
| [Options] Strike, Expiration, Premium | If option type | Conditional |

### Shot Risk Parameters (Trading Discipline)

| Field | Description | Required |
|-------|-------------|----------|
| **Stop Loss Price** | Exit if price drops to $X | Strongly Recommended |
| **Stop Loss %** | Exit if down X% (alternative) | Strongly Recommended |
| **Profit Target Price** | Take profits at $X | Recommended |
| **Profit Target %** | Take profits at X% gain | Recommended |
| **Exit Trigger** | Condition that triggers exit (free text) | Recommended |
| **Max Loss Amount** | Maximum $ willing to lose on this shot | Optional |
| **Position Size Rationale** | Why this many shares? | Optional |

**Purpose:** Enforce trading discipline. Most losses come from:
- No exit plan
- Ignoring stop losses
- Holding losers hoping for recovery

**Tracking:** System tracks whether user honored their stop loss and profit targets. This feeds into discipline analytics (Premium feature).

### Shot States

| State | Description |
|-------|-------------|
| **Pending** | Shot configured, not yet submitted |
| **Armed** | Limit order placed, waiting for price trigger |
| **Fired** | Market executed / limit filled |
| **Active** | Position held, tracking toward target |
| **Closed** | Position exited, scored |

**Key Insight:** Target price is set at Aim level. Shots capture how much of the runway you captured. Late entry = less credit.

**Example:**
- Target: "AI infrastructure will boom in 2025"
- Aim: NVDA → $200 by Dec 2026 (currently at $134)
- Shot 1: Buy @ $134 → captures full $66 runway
- Shot 2: Buy @ $150 → captures only $50 runway (24% less credit)

### Catalyst Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Macro Market | Broad economic forces | Fed decisions, recession fears, inflation data |
| Micro Market | Sector/segment trends | Sector rotation, industry momentum |
| Company-Specific | Individual company events | Earnings, product launch, leadership change |
| Industry | Industry-wide dynamics | Regulations, disruption, consolidation |
| Competition | Company vs company | Market share shifts, competitive threats |
| Other | User-specified | Captures patterns for future categories |

### Position Types

| Type | Description |
|------|-------------|
| Buy (Stock) | Long position on stock |
| Sell (Stock) | Short position on stock |
| Call (Option) | Bullish options play |
| Put (Option) | Bearish options play |

---

## 4. Scoring System

### Four-Level Hierarchical Scoring

**Implementation Status:** ✅ COMPLETE (2025-12-30)

| Level | Measures | Rollup Path |
|-------|----------|-------------|
| **User Career Score** | Overall prediction quality + execution | ← Target Scores |
| **Target Score** | Thesis quality + P&L summary | ← Aim Scores + Shot Scores |
| **Aim Score** | PRIMARY UNIT: How accurate was your prediction? | ← Individual metrics |
| **Shot Score** | How well did you execute the trade? | ← Individual metrics |

**Scoring Scale:** Centered at 0 on a -50 to +50 scale where:
- 0 = Market baseline (C grade)
- Positive = Outperformed market
- Negative = Underperformed market

**Letter Grades (16-tier):**

| Score Range | Grade | Meaning |
|-------------|-------|---------|
| +50 | AAA | Legendary |
| +45 to +49 | AA+ | Exceptional |
| +40 to +44 | AA | Outstanding |
| +35 to +39 | A+ | Excellent |
| +30 to +34 | A | Very Good |
| +25 to +29 | A- | Good |
| +20 to +24 | B+ | Above Average |
| +15 to +19 | B | Solid |
| +10 to +14 | B- | Decent |
| +5 to +9 | C+ | Slightly Above Baseline |
| -4 to +4 | **C** | **Baseline (Market Average)** |
| -9 to -5 | C- | Slightly Below Baseline |
| -19 to -10 | D | Below Average |
| -29 to -20 | F | Poor |
| -39 to -30 | FF | Very Poor |
| -50 to -40 | FFF | Failing |

### Aim-Level Scoring (PRIMARY)

Aims are the primary scoring unit. Four weighted metrics:

| Metric | Weight | Description |
|--------|--------|-------------|
| **Directional Accuracy** | 20% | Did price move in predicted direction? |
| **Magnitude Accuracy** | 30% | How close to target price? |
| **Forecast Edge** | 35% | Your return vs market return over same period |
| **Thesis Validity** | 15% | Was thesis reasoning sound? (Capped at 0 if risks not documented) |

**Final Aim Score** = Weighted average of the 4 metrics (stays on -50 to +50 scale)

**Difficulty Multiplier** (1.0× to 5.0×): Displayed independently, NOT multiplied into final score.
- Formula: `1.0 + (alpha_target / 2.0)`, capped at 5.0×
- Example: Targeting +100% return → 5× difficulty shown as badge

### Shot-Level Scoring

Each shot (trade execution) is evaluated on:

| Metric | Weight | Description |
|--------|--------|-------------|
| **Performance Score** | 45% | Actual return vs expected market return |
| **Forecast Edge** | 35% | Your return vs actual market during holding period |
| **Perfect Shot Capture** | 20% | How much of the peak-to-entry runway did you capture? |

**Risk Multiplier** (0.70× to 1.10×): Based on risk plan quality + execution discipline

| Risk Grade | Multiplier | Criteria |
|------------|------------|----------|
| A | 1.10× | Structured plan, followed cleanly |
| B | 1.05× | Reasonable plan, minor deviations |
| C | 1.00× | Basic plan, followed |
| D | 0.85× | Very liberal plan or clear violations |
| F | 0.70× | No plan or severe neglect |

**Adaptability Bonus** (Pro tier only): ±5 points based on in-trade adjustments

**Final Shot Score** = (Base Score × Risk Multiplier) + Adaptability Bonus

### Target-Level Scoring

Targets aggregate from aims and shots:

| Metric | Source |
|--------|--------|
| **Prediction Score** | Weighted mean of Aim Final Scores |
| **Performance Score** | Weighted mean of Shot Final Scores |
| **Total P&L ($)** | Sum of shot realized P&L |
| **Total P&L (%)** | Weighted average return |
| **Win Ratio** | Winning aims / Total aims |
| **Alpha vs Market** | Your return - SPY return over target duration |

### User Career Scoring

Two distinct career scores:

| Score | Source | Meaning |
|-------|--------|---------|
| **Prediction Quality** | Aggregated from Target Prediction Scores | How good are your investment ideas? |
| **Execution Performance** | Aggregated from Target Performance Scores | How well do you execute trades? |

### Time-Normalized Returns

All levels track profit per time unit for fair comparison:

| Metric | Formula |
|--------|---------|
| **Profit Per Day (PPD)** | Return % / Days Held |
| **Profit Per Month (PPM)** | PPD × 30 |
| **Profit Per Year (PPY)** | PPD × 365 (annualized) |

**Why This Matters:**
- 8% in 14 days = 208% annualized
- 25% in 180 days = 51% annualized
- The short trade was 4× more efficient

### Database Tables (Implemented)

| Table | Purpose |
|-------|---------|
| `aim_scores` | Stores 4 aim metrics + difficulty + letter grade |
| `shot_scores` | Stores 4 shot metrics + risk grade + adaptability |
| `target_scores` | Dual scores + P&L summary + win ratio |
| `user_career_scores` | Two career scores + totals |

### Scoring Triggers

- **Shot Close** → `calculateAndStoreShotScore()` → cascades to target → user
- **Aim Close** → `calculateAndStoreAimScore()` → cascades to target → user

### Trajectory Tracking

Visual overlay showing prediction progress:

**Visualization:**
- Draw projected trend line from entry price → target price over timeframe
- Overlay actual stock chart on top of trend line
- Visual indicator shows distance from trend (rings/bubbles at ~10% intervals)

**Status Indicators:**

| Status | Meaning |
|--------|---------|
| On Track | Actual price near or above trend line |
| Drifting | 1-2 rings off trend line |
| Off Course | 3+ rings off trend line or wrong direction |

*Detailed trajectory scoring TBD for future enhancement.*

---

## 5. User Flows

### 5.1 Onboarding

```
Sign in (Authentik)
  → Welcome screen, explain thesis tracking concept
  → Ready to create first shot (no Alpaca required)
  → [Optional] Connect Alpaca for paper trading features
    → Enter API key + secret
    → Validate connection
    → Show paper account balance
```

**Key Point**: Alpaca connection is OPTIONAL. Core function is thesis tracking. Paper trading enhances the experience but is not required.

### 5.2 Create Target (Set Your Eyes on the Target)

```
Enter thesis (WHY you believe this)
  → Select target type: Stock | Sector | Market | Theme | Event
  → Select catalyst category
  → Add tags (optional, user-created)
  → Set broad timeframe (optional)
  → Review summary
  → Confirm ("Lock On")
  → Target created
  → Prompt: "Take aim? Add your first ticker prediction"
```

### 5.2b Add Aim to Target (Take Aim)

```
From Target detail view:
  → Click "Take Aim" / "Add Aim"
  → Search ticker (the asset, e.g., NVDA)
  → Display current price chart
  → Set realistic target price
  → Set reach target (optional)
  → Select target date (calendar)
  → System calculates Pace (required %/month)
  → Review summary
  → Confirm ("Confirm Sights")
  → Aim added to Target
  → Prompt: "Set up your shot?"
```

### 5.2c Add Shot to Aim (Set Up Your Shot)

```
From Aim detail view:
  → Click "Add Shot"
  → Display current price (entry point)
  → Select direction: Buy | Sell
  → Select type: Stock | Option
  → Select trigger: Market | Limit
  → [If limit: set trigger price]
  → [If option: strike price, expiration, contracts]
  → [If paper trading: set position size]
  → Review (shows runway captured %)
  → Confirm
  → Shot state: Pending
  → "Pull the Trigger" button
  → [If paper trading: execute via Alpaca]
  → Shot state: Fired → Active
```

### 5.2d Create Stray Shot (Discouraged)

```
Quick entry without full target/aim:
  → Search ticker
  → Select direction + type
  → Set entry price
  → [Optional: set target price]
  → Confirm
  → Warning: "Stray shots don't have thesis tracking"
  → Shot created as orphan
```

**Key Point**: Users can create shots WITHOUT paper trading - prediction-only mode for those who just want to track their calls. Stray shots are allowed but discouraged.

### 5.3 Close Position

```
Select active shot
  → View current metrics (accuracy, performance, trajectory)
  → Confirm close
  → [If paper trading: Alpaca executes sell]
  → Final scores calculated and locked
  → Shot moves to history
```

### 5.4 Manual Trade Entry (Backfill)

**RESTRICTED: Admin and Power Users only** (prevents gaming/fake claims)

```
Search ticker
  → Enter historical entry date + price
  → Enter thesis + catalyst
  → Set target
  → [If already closed: enter exit date + price]
  → Save (no Alpaca execution)
  → Scores calculated
  → Marked as "manually entered" in database
```

*Used for testing, edge case validation, and admin data management.*

---

## 6. Views & UI

### Design Direction

- **Game feel, less finance-y**
- **Engaging and fun**
- **Scoreboard-first** - performance is the hero
- **Visual feedback** - colors, progress indicators, achievements feel
- **Desktop-first, mobile-responsive** - 90% iPhone for mobile concerns
- **Accessibility** - Colorblind mode (yellow/purple alternatives for red/green) as user setting
- **Historical data is sacred** - Closed items more important than active for learning; no hiding mistakes

### Brand Identity

**Logo Concept:**
- Primary mark: Stylized "O" (the "O" in "Outvestments")
- Full logo includes: bullseye target, upward arrow, candlestick chart silhouette
- Arrow pointing at target reinforces Target/Aim/Shot terminology (take aim, then shoot)

**Logo Variants:**

| Variant | Use Case | Elements |
|---------|----------|----------|
| Full | Marketing, splash screens, large displays | O + target + arrow + chart |
| Favicon (16x16) | Browser tab, small icons | Simplified O only (no chart) |
| Flat | Contexts requiring simplicity | O shape only (no chart, no target) |

**Color Palette:**

| Color | Role | Usage |
|-------|------|-------|
| Green | Primary | Growth, success, positive performance |
| Gold | Secondary | Achievement, winning |
| Silver | Accent | Depth, professionalism |
| Navy/Black | Dark mode background | High contrast base for dark theme |

**Color Application:**
- Green pops well against navy/black backgrounds
- Performance indicators: Green (up), Red (down)
- Colorblind alternative: Yellow (up), Purple (down)

**Brand Voice:**
- Game-like, not stuffy finance
- Confident but not arrogant
- Focus on skill and learning, not bragging

### 6.1 Dashboard (Home)

**Hero: Scoreboard**
- Overall performance grade
- Accuracy average
- Win/loss record
- Active shots count
- Top performing shot

**Secondary Elements:**
- Active shots list with trajectory status
- Quick actions: New Shot, View Portfolio

### 6.2 Portfolio Views

#### A. Alpaca Portfolio View
- Account balance
- Buying power
- Current positions (from Alpaca)
- Pending orders

#### B. Performance Line Graph
- Traditional line chart
- Portfolio value over time
- Configurable timeframe (30d, 90d, 1y, all)

#### C. GitHub-Style Heatmap
- Daily performance squares
- Color scale:
  - Deep green: >3% up
  - Light green: 0-3% up
  - Light red: 0-3% down
  - Deep red: >3% down
- Available for:
  - Overall portfolio
  - Individual shots

#### D. Delta Bar Chart (60-day)
- Each day = one bar
- Green bar = up from previous day
- Red bar = down from previous day
- Shows daily change, not cumulative

### 6.3 Shot Detail View

- Ticker + current price
- Entry price + date
- Target (realistic + reach)
- Timeframe remaining
- Thesis text
- Catalyst category
- Tags
- Current scores (accuracy, performance, trajectory)
- Price chart with entry point marked
- Actions: Close, Edit Thesis

### 6.4 History View

- All closed shots
- Filterable by:
  - Date range
  - Catalyst type
  - Tags
  - Performance range
- Sortable by any metric

---

## 7. Data Model (Conceptual)

### Users

- id
- authentik_id
- role (viewer/user/power_user/admin)
- display_name
- avatar_url (nullable)
- timezone (e.g., "America/New_York")
- theme_preference (light/dark/system)
- preferred_currency (USD, EUR, etc.)
- colorblind_mode (boolean)
- alpaca_api_key (encrypted, nullable)
- alpaca_api_secret (encrypted, nullable)
- **tier** (free/premium/premium_plus)
- **tier_source** (default/subscription/trial/promo/admin/affiliate)
- **tier_expires_at** (nullable timestamp)
- **trial_started_at** (nullable)
- **trial_ends_at** (nullable)
- **referral_code** (unique code for sharing)
- **referred_by_user_id** (FK, nullable)
- **stripe_customer_id** (nullable)
- created_at
- updated_at

**Roles:**

| Role | Permissions |
|------|-------------|
| viewer | View-only, can see shared targets/aims/shots but not create |
| user | Create targets, aims, shots, manage own data |
| power_user | User + manual backfill, extended session |
| admin | Full access, user management |

### Targets (The Thesis)

- id
- user_id
- thesis (WHY you believe this)
- target_type (stock/sector/market/theme/event)
- catalyst_category
- **conviction_level** (high/medium/low)
- **risks_identified** (text array)
- **abort_trigger** (text - what would invalidate this thesis?)
- **abort_triggered** (boolean)
- **abort_triggered_at** (nullable timestamp)
- broad_timeframe (nullable)
- status (active/closed/expired/aborted)
- created_at

### Target Tags (junction)

- target_id
- tag_id

### Target Scores (aggregate of all aims)

- target_id
- overall_accuracy
- overall_performance
- overall_ppd
- calculated_at

### Aims (The Prediction)

- id
- user_id
- target_id (nullable - null = orphan aim)
- ticker (the asset, e.g., NVDA)
- **aim_type** (playable/monitor)
- **rationale** (text - why this symbol for this thesis?)
- target_price_realistic
- target_price_reach (nullable)
- target_date
- pace_required (calculated %/month)
- **monitor_entry_price** (nullable - for "what if" tracking)
- **monitor_entry_date** (nullable)
- **monitor_outcome** (pending/correct/incorrect/partial)
- **monitor_vs_market_percent** (nullable - performance vs benchmark)
- **ai_suggested** (boolean - was this suggested by AI?)
- status (active/closed/expired/watching/monitor)
- created_at

### Aim Scores (aggregate of all shots under aim)

- aim_id
- accuracy_score
- performance_score
- ppd
- calculated_at

### Shots (The Trade)

- id
- user_id
- aim_id (nullable - null = stray shot, discouraged)
- ticker (same as aim, or standalone for stray)
- direction (buy/sell)
- shot_type (stock/option)
- trigger_type (market/limit)
- trigger_price (nullable - for limit orders)
- entry_price
- entry_date
- exit_price (nullable)
- exit_date (nullable)
- position_size (nullable)
- **stop_loss_price** (nullable)
- **stop_loss_percent** (nullable)
- **profit_target_price** (nullable)
- **profit_target_percent** (nullable)
- **exit_trigger** (text - condition that triggers exit)
- **max_loss_amount** (nullable - max $ willing to lose)
- **position_size_rationale** (text, nullable)
- **exit_reason** (profit_target/stop_loss/exit_trigger/thesis_abort/manual/expired)
- **stop_loss_honored** (boolean, nullable - did they follow their plan?)
- **profit_target_honored** (boolean, nullable)
- is_paper_trade (boolean)
- is_manually_entered (boolean, default false)
- alpaca_order_id (nullable)
- status (pending/armed/fired/active/closed)
- created_at

### Options Fields (for shot_type = option)

- shot_id (FK to Shots)
- strike_price
- expiration_date
- premium_paid (entry premium per contract)
- premium_exit (exit premium, nullable)
- num_contracts
- option_type (call/put)

*Note: Options current value uses mid between bid/ask for scoring.*

### Shot Scores (individual position scoring)

- shot_id
- runway_captured (% of target runway this shot captures)
- accuracy_score
- raw_performance_score
- delta_performance_score
- difficulty_multiplier
- composite_score
- calculated_at

### Tags
- id
- user_id
- name
- created_at

### Shot Tags (junction)
- shot_id
- tag_id

### Daily Snapshots
- id
- user_id
- date
- portfolio_value
- daily_change_dollars
- daily_change_percent
- positions_snapshot (JSON)
- created_at

### Market Data Cache

- ticker
- date
- open
- high
- low
- close
- volume

### User Acquisition (new)

- id
- user_id
- source (organic/google/twitter/podcast)
- medium (cpc/referral/affiliate/organic)
- campaign (launch_week_2025, black_friday)
- referral_code (code used at signup)
- affiliate_code
- referred_by_user_id
- landing_page
- created_at

### Promo Codes (new)

- id
- code (unique)
- effect_type (tier_grant/trial_extension/percent_off/free_months)
- effect_value
- tier_granted (nullable)
- valid_from
- valid_until
- max_uses
- max_uses_per_user
- uses_count
- new_users_only
- affiliate_id (nullable)
- created_at

### Promo Redemptions (new)

- id
- user_id
- promo_code_id
- redeemed_at
- effect_applied
- expires_at

### Referrals (new)

- id
- referrer_id
- referee_id
- code_used
- status (signed_up/activated/converted/retained_90d/churned)
- signed_up_at
- converted_at
- referrer_reward_type
- referrer_reward_issued_at
- referee_reward_type
- referee_reward_issued_at

### Global Config (new)

- key (primary key)
- value
- value_type (string/number/boolean/json)
- description
- updated_at

### User Discipline Stats (new)

- user_id
- total_stop_losses_set
- stop_losses_honored
- stop_losses_violated
- avg_loss_when_violated
- total_profit_targets_set
- profit_targets_honored
- discipline_score
- updated_at

### Orphaned Positions

- id
- user_id
- ticker
- alpaca_position_data (JSON)
- detected_at
- status (orphaned/imported/ignored)

*Positions found in Alpaca that don't have a corresponding Shot. User can import into a new Shot or ignore.*

---

## 8. Integrations

### Alpaca Paper Trading API

**Authentication**: Per-user API key + secret storage

**Endpoints Used**:
- Account info
- Positions
- Orders (create, cancel, list)
- Market data (quotes, bars)
- Portfolio history

**Rate Limits**: 200 requests/minute (sufficient for MVP)

**Failure Handling**:
- If Alpaca unavailable, display cached data
- Queue orders for retry
- Clear user notification of sync status

### Authentik SSO

- OIDC integration
- Existing infrastructure
- User provisioning on first login

---

## 9. Pricing Tiers & Monetization

### Tier Overview

| Tier | Price | Target User |
|------|-------|-------------|
| **Free** | $0 | New users, casual traders, leads |
| **Premium** | TBD | Active traders wanting full analytics |
| **Premium Plus** | TBD | Serious traders wanting AI coaching |

### Usage Limits

| Limit | Free | Premium | Premium Plus |
|-------|------|---------|--------------|
| Active Targets | 3 | 25 | Unlimited |
| Aims per Target | 3 | 10 | Unlimited |
| Active Shots | 5 | 50 | Unlimited |
| Monitor Aims | 3 | Unlimited | Unlimited |
| Historical data | 90 days | 2 years | Unlimited |

### Free Tier Features

| Category | Feature |
|----------|---------|
| Core Workflow | Target → Aim → Shot workflow |
| Targets | Thesis, conviction level, abort triggers |
| Aims | Playable + Monitor types (manual only) |
| Shots | Position tracking, risk parameter fields |
| Dashboard | Basic dashboard, P&L display |
| Scoring | 2-3 metrics only (Win Rate + Basic PPD) |
| Referrals | Personal referral code |

**Limitations (Upgrade Drivers):**
- Scoring after trade closes only (no live grading)
- Aggregate metrics only (no per-shot breakdown)
- No "what if" P&L for Monitor Aims
- No AI features
- No benchmark comparisons

### Premium Tier Features

Everything in Free, plus:

| Category | Feature |
|----------|---------|
| Scoring | Full 8-metric scoring system |
| Live Grading | Real-time scoring during open positions |
| Per-Shot Metrics | Detailed breakdown per trade |
| Monitor Aims | AI-suggested monitor aims |
| Monitor "What If" | Theoretical P&L for paper positions |
| Theory Expansion | Related asset suggestions, counterfactuals |
| Thesis Analysis | Scope analysis (sector-wide vs idiosyncratic) |
| Aim Aggressiveness | Check if price targets are realistic |
| Calibration Stats | Conviction vs accuracy analysis |
| Risk Discipline | Stop loss / exit trigger adherence stats |
| Benchmarks | Comparison vs S&P NPC |
| History | Full historical performance tracking |

### Premium Plus Tier Features

Everything in Premium, plus:

| Category | Feature |
|----------|---------|
| AI Target Coach | Full lifecycle coaching |
| "Why/Why Not?" Prompts | Reflective thesis hygiene prompts |
| Causal Analysis | Deeper thesis pattern analysis |
| Risk Gap Detection | AI suggests risks you may have missed |
| Historical Patterns | "Similar theses in 2021 had X% success" |
| Strength/Weakness ID | AI identifies your trading patterns |
| Pattern Warnings | Real-time alerts based on your history |
| Weekly AI Summary | Email digest of insights |
| Alternative Strategies | Options, DCA, covered call suggestions |

### AI Target Coach Components (Premium Plus)

1. **Theory Analysis (Pre-Trade)**
   - Risk assessment score
   - Likelihood rating for projections
   - Counter-arguments / bear case prompts
   - Similar historical patterns
   - Related asset suggestions with correlation data

2. **Active Coaching (During Trade)**
   - Catalyst reminders ("Earnings in 3 days")
   - Target price alerts
   - Thesis validation ("This pullback is within your bounds")
   - Exit trigger reminders

3. **Post-Trade Review**
   - Outcome vs thesis analysis (skill vs luck)
   - Missed signal identification
   - Theory improvement suggestions
   - Pattern recognition across trades

4. **Post-Exit Guidance**
   - Remaining upside alerts
   - Re-entry opportunity signals
   - "Took profits appropriately" vs "exited prematurely"
   - FOMO prevention

### AI Pattern Analysis (Premium Plus)

| Analysis Type | Example Insight |
|---------------|-----------------|
| Strength ID | "You excel at tech momentum plays — 78% accuracy" |
| Weakness ID | "Your earnings timing is poor — wait for post-earnings" |
| Calibration | "Your 8+ confidence calls underperform 5-6 calls" |
| Discipline | "The 10% you ignore stop losses cost 40% of losses" |
| Patterns | "You exit winners early and hold losers too long" |
| Sector | "Avoid healthcare — 35% accuracy there" |

### Referral Program

- Every user gets a unique referral code at signup
- Shareable link: `outvestments.com/r/CODE`
- Referrer rewards: Free months, account credits
- Referee rewards: Extended trial, discounts

### Promo Code System

| Type | Effect | Example |
|------|--------|---------|
| `tier_grant` | Grants tier for X days | "PREMIUMWEEK" |
| `trial_extension` | Extends trial | "EXTRA7" |
| `percent_off` | % discount | "LAUNCH20" |
| `free_months` | X months free | "PODCAST3" |

### Global Override (Promotions)

For "everyone gets Premium this week" scenarios:
- `GLOBAL_TIER_OVERRIDE` — Force all users to specified tier
- `GLOBAL_TIER_OVERRIDE_EXPIRES` — Auto-expiration date

*Full monetization details: See [pricing-tiers.md](pricing-tiers.md)*

---

## 10. Background Jobs

### Nightly EOD Capture (Required)

**Schedule**: After market close (4:30 PM ET)

**Actions**:
1. For each user with Alpaca connection:
   - Fetch current portfolio value
   - Fetch all positions
   - Calculate daily change
   - Store snapshot
2. For each active aim/shot:
   - Fetch current price
   - Update trajectory status and pace
   - Calculate current scores
3. Fetch and cache S&P 500 daily close (for Delta Performance)

### Optional Future Jobs

- Weekly performance summary (for notifications)
- Expired shot cleanup (auto-close past target date)
- Tag usage analytics

---

## 10. MVP Scope

### Must Have (MVP)

| Feature | Priority |
|---------|----------|
| User auth (Authentik) | P0 |
| Alpaca API key setup per user | P0 |
| Create shot (full flow) | P0 |
| Prediction-only mode (no paper trade) | P0 |
| Paper trade execution | P0 |
| Close position | P0 |
| Scoreboard view | P0 |
| Active shots list | P0 |
| Shot detail view | P0 |
| Basic history view | P0 |
| Accuracy scoring | P0 |
| Performance scoring (Raw + Delta) | P0 |
| Difficulty multiplier | P0 |
| Trajectory status | P0 |
| Nightly EOD capture | P0 |
| Tags (open system) | P1 |
| Targets (group aims under thesis) | P0 |
| Stray shots (discouraged but allowed) | P1 |
| Performance line graph | P1 |
| GitHub heatmap | P1 |
| Delta bar chart (60-day) | P1 |
| Options support (calls/puts) | P1 |
| Short positions | P1 |
| Realistic + Reach targets | P1 |

### Nice to Have (MVP)

| Feature | Notes |
|---------|-------|
| Pre/After market quotes | Extended hours data |
| Manual trade backfill | May deprecate due to gaming |

### Out of Scope (Post-MVP)

| Feature | Phase |
|---------|-------|
| Clips (manual or smart grouping) | TBD |
| Public/private profiles | 2 |
| Following other users | 2 |
| Pattern/sector analysis | 2 |
| Win rate by catalyst category | 2 |
| **Cryptocurrency support** | 2 |
| - BTC, ETH, major altcoins | 2 |
| - Crypto exchange integration (Coinbase, Kraken, etc.) | 2 |
| - 24/7 market handling | 2 |
| Competitions (heats, volleys, brackets) | 3 |
| Leaderboards | 3 |
| Teams | 3 |
| Notifications (email/push) | 2+ |
| Import from live brokerage | 2+ |
| **Gamification enhancements** | 2 |
| - Achievement/badge system | 2 |
| - Streak tracking (consecutive days with predictions) | 2 |
| - Milestone celebrations | 2 |
| - Personal best notifications | 2 |
| Roll-up score (simplified single metric) | 2 |

---

## 11. Success Criteria

### MVP Launch Criteria

User can:
- [ ] Create account and connect Alpaca
- [ ] Create shots with thesis, catalyst, target, timeframe
- [ ] Execute paper trades through Alpaca
- [ ] Create prediction-only shots (no paper trade)
- [ ] View scoreboard with overall performance
- [ ] See trajectory status for active shots
- [ ] Close positions and see final scores
- [ ] View performance history with multiple chart types
- [ ] Organize shots with tags and clips

### MVP Success Metrics

| Metric | Target |
|--------|--------|
| Active users creating shots | 10+ |
| Shots created per user per month | 5+ |
| Return rate (users coming back) | 60%+ |
| Shot completion rate | 70%+ |

---

## 12. Resolved Questions

1. ~~**Options Premium Tracking**~~: **RESOLVED** - Use same scoring rubric as stocks (accuracy, performance, difficulty). Build as separate rubric with identical values so it can diverge later as we learn. Current value = last price (fallback when bid/ask unavailable).

2. ~~**Expired Aims**~~: **RESOLVED** - When aim's target date passes:
   - Aim is evaluated: did asset hit target price? Score the accuracy.
   - All scores and assessments still calculated and matter.
   - User prompted for portfolio position decision:
     - **Close out**: Sell position, finalize shot scores
     - **Liquidate**: Sell all assets in aim
     - **Roll over**: Create new aim, transfer position to it

3. ~~**Partial Closes**~~: **RESOLVED** - Lot-based splitting:
   - When user sells partial position (e.g., 10 of 20 shares), split into two lots
   - Closed lot: Score immediately (was it on track for target?)
   - Remaining lot: Stays open, continues tracking toward target
   - Each lot scored independently
   - **ID scheme**: Numeric IDs with parent FK; display as dot notation (e.g., `123.1.2`)
   - Supports recursive splits for crypto micro-positions (satoshi-level)
   - `root_shot_id` denormalized for fast descendant queries

4. ~~**Target Adjustments**~~: **RESOLVED** - Targets are LOCKED.
   - Original target preserved permanently (integrity of prediction)
   - Future enhancement: "Revised target" field that shows updated thinking
   - Original target always used for scoring
   - Revisit target modification in post-MVP

5. ~~**S&P Data Source**~~: **RESOLVED** - Use SPY as proxy for S&P 500 returns.

6. ~~**Price Fallback**~~: **RESOLVED** - Use **last price** as default for all valuations.
   - Simpler and more consistent than mid-price
   - Works when bid/ask unavailable (off-hours, illiquid options)

7. ~~**Dividend Handling**~~: **RESOLVED** - Dividends as cash balance:
   - Alpaca paper trading doesn't pay dividends
   - Track dividend payments as cash credit tied to the shot
   - Include in ROI calculation
   - Not reinvestable (just a scoring credit)

8. ~~**Target/Aim Independence**~~: **RESOLVED** - Targets and Aims exist independently:
   - Target can have zero aims (thesis-only, prediction not yet specific)
   - Aim can have zero shots (prediction-only, not traded yet)
   - Target/Aim can be closed early ("not playing out") - user's choice
   - Closing deprioritizes from view but performance still counts
   - "Was the thesis correct?" evaluated regardless of whether shots exist

9. ~~**Three-Tier Scoring**~~: **RESOLVED**
   - **Target Score**: Was the overall thesis correct?
   - **Aim Score**: Did the specific ticker hit target price?
   - **Shot Score**: How well-timed was entry? (runway captured)
   - All three levels scored independently and aggregate upward

10. ~~**Rollover Purpose**~~: **RESOLVED** - Convenience feature only:
    - Saves user from re-adding same shots to new aim
    - Creates similar aim with existing positions attached
    - No special scoring implications

11. ~~**Full Close vs Lot Split**~~: **RESOLVED**
    - Selling all shares = shot close (not a split)
    - Aim remains open independently

12. ~~**Historical Data Principle**~~: **RESOLVED** - Closed data is MORE important than active:
    - "What do I invest in that doesn't work?" → Learning from failures
    - "What do I do well?" / "What don't I do well?" → Skill discovery
    - No hiding mistakes - defeats purpose of skill discovery
    - UI can deprioritize closed items, but analytics must include everything

13. ~~**Corporate Action Job Frequency**~~: **RESOLVED** - Daily preferred (data feed TBD).

---

## 13. Corporate Action Handling

**Scheduled Job**: Run daily to detect and process corporate actions.

| Event | Handling |
|-------|----------|
| Stock Split | Adjust share count and entry price proportionally. Aim target prices adjust automatically. |
| Reverse Split | Adjust share count and entry price proportionally. Aim target prices adjust automatically. |
| Merger/Acquisition | Mark affected aims. User prompted to close or transfer to new ticker. |
| Symbol Change | Update ticker reference across all active aims/shots. Notify user. |
| Delisting | Mark aim as "delisted". User must close position. Score based on final price. |
| Exchange Migration | Update exchange reference. No impact on scoring. |
| Dividends | Track as cash balance tied to shot. Factor into ROI calculation. Not reinvestable. |
| Spin-offs | Create notification. User decides how to handle new shares. |
| Warrants | Out of scope for MVP. |
| Alpaca Outage | Use cached data, queue orders for retry. |

**Data Source**: Corporate action data from market data provider (to be determined during implementation).

---

## 14. Security Considerations

### API Key Security

- Alpaca API keys encrypted at rest (AES-256)
- Keys never exposed to frontend
- All Alpaca calls server-side
- Key decryption only at time of API call

### Audit Logging (Immutable)

- Log all shot creation/modification/close actions
- Log all Alpaca API interactions
- Log all authentication events
- Retention: Minimum 1 year

### Access Control

- Row-level security as needed (implementation decision)
- Role-based access: viewer / user / power_user / admin
- Viewer: read-only access to shared content
- Manual backfill restricted to power_user/admin only

### Input/Output Security

- Rate limiting on API endpoints
- Input validation on all user content
- XSS protection for thesis text display
- Sanitize all user-generated content before storage

### Third-Party Risk

- Alpaca breach: Users have direct agreement with Alpaca, not our responsibility
- We store their keys to facilitate connection, not to take on their security liability

---

## 15. Educational Philosophy & Behavioral Design

Outvestments is not just a trading tracker - it's a **trading education system** disguised as a game. Every feature, message, and interaction is designed to build better trading habits.

### Core Educational Goals

1. **Force discipline** - The Target → Aim → Shot workflow prevents impulse trading
2. **Provide context** - Market condition tags and NPC comparisons show the full picture
3. **Build accountability** - Immutable records prevent revisionist history
4. **Teach opportunity cost** - Dollar amounts vs benchmarks, not just percentages
5. **Encourage reflection** - "Why did I buy this?" is always answerable

### Behavioral Interventions

| Bias | Problem | Our Solution |
|------|---------|--------------|
| Selective Memory | Remember wins, forget losses | Win count + win value, loss count + loss value |
| Bull Market Illusion | "I'm a genius" in rising markets | Market condition tags, benchmark comparison |
| Opportunity Cost Blindness | "I made 20%" without context | Dollar difference vs SPY on every trade |
| No Exit Plan | Know when to enter, not exit | Advanced Mode: exit conditions, warning signs |
| Hindsight Bias | "I knew it all along" | Locked, timestamped predictions |
| Overconfidence After Wins | Big win → bigger bet → bigger loss | Pattern tracking (Phase 3) |

### Learning Moments

The app surfaces educational content at key moments:

- **First Target**: Explain why thesis documentation matters
- **First Score**: Explain PPD and why time-normalization matters
- **First NPC Battle**: Explain opportunity cost and alpha
- **Hit Target Early**: Prompt reflection on time vs price targets
- **Big Loss**: Surface original thesis for reflection, not judgment
- **Beat Market**: Celebrate alpha generation specifically
- **Lost to Market**: Acknowledge gain but note opportunity cost

### Progressive Disclosure

- **Basic Mode** (default): Core workflow, essential metrics
- **Advanced Mode** (opt-in): Exit conditions, warning signs, macro risks
- **Power User**: Historical backfill, admin features

### Messaging Integration Points

See [messaging-and-positioning.md](messaging-and-positioning.md) for:
- Where each value proposition appears in the UI
- Specific copy for educational touchpoints
- Voice and tone guidelines
- Terminology consistency requirements

---

## 16. Revision History

| Version   | Date       | Author      | Changes                      |
|-----------|------------|-------------|------------------------------|
| 1.0-draft | 2025-12-27 | Matt/Claude | Initial PRD draft            |
| 1.1-draft | 2025-12-27 | Matt/Claude | Roundtable review updates    |
| 1.2-draft | 2025-12-27 | Matt/Claude | Infrastructure decisions     |
| 1.3-draft | 2025-12-27 | Matt/Claude | Theory/Shot restructure      |
| 1.4-draft | 2025-12-27 | Matt/Claude | Brand identity guidelines    |
| 1.5-draft | 2025-12-27 | Matt/Claude | Resolved open questions      |
| 1.6-draft | 2025-12-27 | Matt/Claude | Roundtable #2 resolutions    |
| 1.7-draft | 2025-12-27 | Matt/Claude | Target/Aim/Shot terminology  |
| 1.8-draft | 2025-12-27 | Matt/Claude | Messaging & educational philosophy |
| 2.0       | 2025-12-30 | Matt/Claude | Pricing tiers, monetization, conviction levels, monitor aims, risk parameters, AI coaching |

**v1.1 Changes:** Options data model, scoring edge cases, colorblind mode, user roles, orphaned positions, Alpaca optional

**v1.2 Changes:** Price caching strategy (on-demand, 15-30 min TTL), API rate limiting, session management, expanded security section (audit logs, third-party risk), trajectory visualization refinement

**v1.3 Changes:** Major restructure - separated Theory (the target/thesis) from Shot (positions). Theory holds thesis, catalyst, tags, target. Shots are positions within a theory. Stray shots allowed but discouraged. Clips removed from MVP. Two-level scoring (Theory grade + Shot grade). Added Testing Strategy (Playwright E2E + Vitest unit) and Monitoring (Sentry + Loki). Added user settings (timezone, theme, avatar, display name, currency).

**v1.4 Changes:** Added Brand Identity section - logo concept (O with target/arrow/chart), color palette (green/gold/silver on navy/black), logo variants (full, favicon, flat), brand voice guidelines.

**v1.5 Changes:** Resolved all open questions. Options scoring: same rubric as stocks, separate implementation. Expired theories: prompt user for close/liquidate/rollover. Partial closes: lot-based splitting with independent scoring. Targets: locked permanently. Corporate action handling: daily/weekly job for splits, mergers, symbol changes, delistings, dividends (factored into ROI).

**v1.6 Changes:** Roundtable #2 resolutions. Lot splitting ID scheme (numeric + parent FK, dot notation display). Two-tier scoring (Career Score vs Game Score, player/game analogy). Price fallback changed to last price. Dividends as non-reinvestable cash balance. Theory independence from shots. Historical data is sacred principle. Corporate action job frequency: daily. Rollover as convenience feature.

**v1.7 Changes:** Major terminology restructure - renamed "Theory" to "Target", added new "Aim" layer between Target and Shot. Target = thesis/theme level prediction. Aim = specific ticker + price + date prediction. Shot = trade/order. Added Trigger types (Market/Limit), Shot states (Pending/Armed/Fired/Active/Closed), Pace metric (%/month), three-tier scoring. Added NPC Opponent terminology for benchmark comparisons (vs future PvP). Updated data model with new Aims entity.

**v1.8 Changes:** Added Six Messaging Pillars to Executive Summary. New Section 15: Educational Philosophy & Behavioral Design covering core educational goals, behavioral interventions for cognitive biases, learning moments, and progressive disclosure. Created companion document messaging-and-positioning.md with full messaging strategy, copy examples, and integration points.

---

**Document Status:** APPROVED - Ready for Architecture
