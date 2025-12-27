---
version: 1.7
date: 2025-12-27
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
| Tags | User-defined labels | Optional |
| Broad Timeframe | General timeframe for thesis (optional) | Optional |

### Aim Components (The Prediction)

| Field | Description | Required |
|-------|-------------|----------|
| Target | Parent target | Yes |
| Ticker | The asset (e.g., TSLA, AAPL) | Yes |
| Target Price (Realistic) | Expected asset price | Yes |
| Target Price (Reach) | Stretch goal price | Optional |
| Target Date | Calendar date for prediction | Yes |

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

### Three-Level Scoring

| Level | Measures | Question Answered |
|-------|----------|-------------------|
| **Target Score** | Was your thesis correct? | Did your overall prediction thesis prove accurate? |
| **Aim Score** | Did the ticker hit target? | Did the specific asset reach your price target? |
| **Shot Score** | How well-timed was your entry? | Did you capture the runway effectively? |

**Example:**
- Target: "AI infrastructure will boom in 2025" ✓ Correct thesis → Target Grade: A
- Aim: NVDA → $200 (from $134) ✓ Hit target → Aim Grade: A
- Shot 1: Bought @ $134 → Full runway captured → Shot Grade: A+
- Shot 2: Bought @ $150 → 76% runway captured → Shot Grade: B+
- Shot 3: Bought @ $160 → 61% runway captured → Shot Grade: B

Your thesis was RIGHT, and NVDA hit target, but Shot 2 and 3 were less optimal entries.

### Shot-Level Scoring

Each shot is evaluated on three dimensions:

| Dimension | What It Measures | Scale |
|-----------|------------------|-------|
| **Accuracy** | Did you hit your target? | 0-100+ (percentage of target achieved) |
| **Performance** | How much did you make vs benchmarks? | 67 = market, 100 = 1.5x market |
| **Difficulty** | How bold was your prediction? | 0.5x - 2.5x multiplier |

**Composite Shot Score** = Accuracy x Difficulty Multiplier

### Accuracy Scoring

Formula: `(Actual Return / Target Return) x 100`

| Result | Score |
|--------|-------|
| Hit target exactly | 100 |
| Exceeded by 50% | 150 |
| Doubled target | 200 |
| Got 80% of target | 80 |
| Broke even | 0 |
| Wrong direction | Negative (no floor) |

**Edge Cases:**

- If Target Return = 0: Treat as 1 (your actual return becomes the score)
- Negative scores have NO floor (can go -400, -1000, etc. if badly wrong)

### Performance Scoring

Formula: `(Your Return / Expected Market Return) x 67`

Where: `Expected Market Return = 10% x (Days Held / 365)`

| Performance Level | Score | Grade |
|-------------------|-------|-------|
| Matched market | 67 | C |
| 20% better | 80 | B- |
| 1.5x market | 100 | A |
| Doubled market | 134 | A+ |
| Below market | <67 | D/F |

**Delta Performance**: Same formula but using actual S&P return (SPY proxy) during holding period instead of expected 10%/year.

**Edge Cases:**

- If Expected Market Return = 0 (flat market): Treat as 1, your return × 67
- Same-day trades: Count as 1 day minimum (prevents division by zero)
- If S&P data unavailable: Fallback to 10%/year prorated

**Scoring Timing**: Scores calculated at EOD or at position close (whichever comes first). Not real-time.

### Difficulty Multiplier

| Range | Target Return | Multiplier |
|-------|---------------|------------|
| Point Blank | <5% | 0.5x |
| Close Range | 5-15% | 1.0x |
| Mid Range | 15-30% | 1.5x |
| Long Range | 30-50% | 2.0x |
| Extreme Range | >50% | 2.5x |

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
- broad_timeframe (nullable)
- status (active/closed/expired)
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
- target_price_realistic
- target_price_reach (nullable)
- target_date
- pace_required (calculated %/month)
- status (active/closed/expired)
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

## 9. Background Jobs

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

**v1.1 Changes:** Options data model, scoring edge cases, colorblind mode, user roles, orphaned positions, Alpaca optional

**v1.2 Changes:** Price caching strategy (on-demand, 15-30 min TTL), API rate limiting, session management, expanded security section (audit logs, third-party risk), trajectory visualization refinement

**v1.3 Changes:** Major restructure - separated Theory (the target/thesis) from Shot (positions). Theory holds thesis, catalyst, tags, target. Shots are positions within a theory. Stray shots allowed but discouraged. Clips removed from MVP. Two-level scoring (Theory grade + Shot grade). Added Testing Strategy (Playwright E2E + Vitest unit) and Monitoring (Sentry + Loki). Added user settings (timezone, theme, avatar, display name, currency).

**v1.4 Changes:** Added Brand Identity section - logo concept (O with target/arrow/chart), color palette (green/gold/silver on navy/black), logo variants (full, favicon, flat), brand voice guidelines.

**v1.5 Changes:** Resolved all open questions. Options scoring: same rubric as stocks, separate implementation. Expired theories: prompt user for close/liquidate/rollover. Partial closes: lot-based splitting with independent scoring. Targets: locked permanently. Corporate action handling: daily/weekly job for splits, mergers, symbol changes, delistings, dividends (factored into ROI).

**v1.6 Changes:** Roundtable #2 resolutions. Lot splitting ID scheme (numeric + parent FK, dot notation display). Two-tier scoring (Career Score vs Game Score, player/game analogy). Price fallback changed to last price. Dividends as non-reinvestable cash balance. Theory independence from shots. Historical data is sacred principle. Corporate action job frequency: daily. Rollover as convenience feature.

**v1.7 Changes:** Major terminology restructure - renamed "Theory" to "Target", added new "Aim" layer between Target and Shot. Target = thesis/theme level prediction. Aim = specific ticker + price + date prediction. Shot = trade/order. Added Trigger types (Market/Limit), Shot states (Pending/Armed/Fired/Active/Closed), Pace metric (%/month), three-tier scoring. Added NPC Opponent terminology for benchmark comparisons (vs future PvP). Updated data model with new Aims entity.

---

**Document Status:** APPROVED - Ready for Architecture
