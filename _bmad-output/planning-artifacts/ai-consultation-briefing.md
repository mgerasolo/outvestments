# Outvestments: Comprehensive Briefing for AI Consultation

**Purpose:** This document provides complete context about Outvestments for AI consultation on scoring methodology, business objectives, positioning, and terminology design.

**Questions We're Seeking Feedback On:**
1. Is our 8-metric scoring system overengineered? What metrics truly matter?
2. Does our Target/Aim/Shot terminology make sense to users?
3. Are we positioning correctly against competitors?
4. What are the biggest gaps in our thinking?

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem We're Solving](#2-the-problem-were-solving)
3. [Core Terminology: Target/Aim/Shot](#3-core-terminology-targetaimshot)
4. [Scoring System (Current & Proposed)](#4-scoring-system)
5. [Messaging & Value Propositions](#5-messaging--value-propositions)
6. [Design Philosophy](#6-design-philosophy)
7. [Competitive Landscape](#7-competitive-landscape)
8. [Business Analysis & Risks](#8-business-analysis--risks)
9. [Open Questions for Discussion](#9-open-questions-for-discussion)

---

## 1. Executive Summary

**What is Outvestments?**

Outvestments is a **gamified platform for proving, measuring, and learning investing skill** through paper trading and prediction tracking. It's designed as a **trading education system disguised as a game**.

**Taglines:** "Outvest the Rest" | "Outvest the Best"

**Core Identity:** This isn't a financial platform that happens to look like a game. **It IS a game that happens to be about trading.**

### Three Core Problems We Solve

| Problem | How We Solve It |
|---------|-----------------|
| **Skill Proof** | How do you prove you're a good investor without risking real money? → Immutable, timestamped prediction records |
| **Skill Discovery** | How do you identify who's actually skilled vs lucky? → Thesis transparency + time-normalized scoring (PPD) |
| **Fair Comparison** | How do you compare performance when people hold for different durations? → Performance Per Day normalization |

### Why Existing Solutions Fall Short

| Approach | Gap |
|----------|-----|
| Following "Finfluencers" | No verified track record, no thesis transparency |
| Copy Trading (eToro) | Copies trades, not reasoning - you don't learn WHY |
| Paper Trading Apps | No skill measurement, no social learning |
| Trading Competitions | Reward returns without methodology transparency |

---

## 2. The Problem We're Solving

### The Core Insight

> There's no way to prove investing skill without risking capital, and no way to know if someone you're following actually has skill or just had a hot streak.

Context matters: "I made 5% this year" sounds good - but if market average was 10% and max 401k would yield 30%, that "5% gain" is actually 25% underperformance.

**Nobody factors in how long you held something as a key metric.**

### What Makes Performance "Real"?

Current platforms show returns without context. We believe meaningful performance measurement requires:

1. **Time normalization** - A 10% gain in 5 days is different from 10% in 50 days
2. **Market context** - Bull markets make everyone look good
3. **Thesis documentation** - WHY did you make this trade?
4. **Opportunity cost** - Did you beat doing nothing (SPY)?
5. **Difficulty acknowledgment** - Bigger predictions should matter more

### User Value Hierarchy

| Priority | Value | Description |
|----------|-------|-------------|
| **1. Primary** | Personal Growth | Know how good I am, where I excel, what works for me |
| **2. Secondary** | Sharing | Let others see my track record and thesis methodology |
| **3. Tertiary** | Discovery | Find proven performers to learn from |
| **4. Icing** | Competition | Heats, volleys, leaderboards for fun |

---

## 3. Core Terminology: Target/Aim/Shot

### The Three-Tier Hierarchy

We use shooting/archery metaphor for our terminology:

```
TARGET (The Thesis - WHY you believe something)
└── AIM (Specific ticker + price + date - WHAT you're predicting)
    └── SHOT (The trade/order - HOW you execute)
```

### Detailed Definitions

| Term | Definition | Analogy | Example |
|------|------------|---------|---------|
| **Target** | A thesis or theme-level prediction. The WHY behind your trades. | The reason you're at the range | "AI infrastructure will boom in 2025" |
| **Aim** | A specific prediction: ticker + price + date. The WHAT you're betting on. | Lining up your sights | "NVDA to $200 by Dec 2025" |
| **Shot** | A trade/order. The execution of your prediction. | Pulling the trigger | Buy 10 shares NVDA @ $140 |

### Why This Terminology?

1. **Forces discipline** - You can't just "buy NVDA" - you need a thesis first
2. **Enables multi-level scoring** - Was your thesis right even if your timing was off?
3. **Creates learning loops** - Review what worked at each level
4. **Memorable metaphor** - Shooting/archery is universally understood

### Shot States

| State | Description |
|-------|-------------|
| **Pending** | Shot configured, not yet submitted |
| **Armed** | Limit order placed, waiting for price trigger |
| **Fired** | Market executed / limit filled |
| **Active** | Position held, tracking toward target |
| **Closed** | Position exited, scored |

### Three-Tier Scoring Implications

Each level gets scored independently:

| Level | Question Answered | Example |
|-------|-------------------|---------|
| **Target Score** | Was your thesis correct? | "AI infrastructure will boom" ✓ |
| **Aim Score** | Did the ticker hit target? | NVDA → $200 ✓ |
| **Shot Score** | How well-timed was your entry? | Bought @ $134 (full runway) vs $160 (partial runway) |

Your thesis can be RIGHT, your aim can be RIGHT, but your shot timing can still be suboptimal.

---

## 4. Scoring System

### Current System (from PRD)

The existing scoring system has three dimensions at the Shot level:

| Dimension | What It Measures | Scale |
|-----------|------------------|-------|
| **Accuracy** | Did you hit your target? | 0-100+ (% of target achieved) |
| **Performance** | How much did you make vs benchmarks? | 67 = market, 100 = 1.5x market |
| **Difficulty** | How bold was your prediction? | 0.5x - 2.5x multiplier |

**Composite Shot Score** = Accuracy × Difficulty Multiplier

### Difficulty Ranges

| Range | Target Return | Multiplier |
|-------|---------------|------------|
| Point Blank | <5% | 0.5x |
| Close Range | 5-15% | 1.0x |
| Mid Range | 15-30% | 1.5x |
| Long Range | 30-50% | 2.0x |
| Extreme Range | >50% | 2.5x |

### Performance Per Day (PPD) - The Key Innovation

**PPD = (% gain or loss) / (days held)**

This solves the problem of comparing trades with different holding periods:

| Scenario | Return | Days | PPD |
|----------|--------|------|-----|
| Quick win | +10% | 5 | **2.0** |
| Slow win | +10% | 50 | **0.2** |
| Quick loss | -5% | 3 | **-1.67** |

---

### PROPOSED New System: 8-Part Score

We're considering a more comprehensive 8-part scoring system:

#### Visual Layout (Scoreboard)

```
┌─────────────────────────────────────────────────────────────┐
│  DIFFICULTY              TARGET   AIM    SHOT      GRADE   │
│     1.5x                                           SCORE   │
│                                                            │
│     Raw                   90      18      72         A-    │
│     Alpha                5.6x     6x      5x               │
└─────────────────────────────────────────────────────────────┘
```

#### The 8 Metrics

| # | Metric | Description | Formula/Method |
|---|--------|-------------|----------------|
| 1 | **Difficulty** | How bold was your prediction vs S&P baseline? | (Annualized Target Return) / 10% |
| 2 | **Raw TARGET** | Prediction accuracy (did reality match prediction?) | (Actual Return / Predicted Return) × 100 |
| 3 | **Raw AIM** | Performance (what % did you actually gain?) | Raw percentage as score |
| 4 | **Raw SHOT** | Optimal capture (how much of max possible did you get?) | (Your Actual Gain / Maximum Possible Gain) × 100 |
| 5 | **Alpha TARGET** | Prediction boldness vs actual market | (Your Prediction - Market Return) / Market Return |
| 6 | **Alpha AIM** | Your performance vs market performance | Your Return / Market Return |
| 7 | **Alpha SHOT** | Your optimal vs market's optimal | Your Max Possible / Market Max Possible |
| 8 | **Letter Grade** | Final composite grade (F through AAA) | TBD - weighted combination |

#### Sample Scenario with All 8 Metrics

**The Trade:**
- **Ticker:** NVDA
- **Prediction:** +20% in 2 months
- **Entry:** Oct 15 @ $100
- **Exit:** Dec 15 @ $118 (+18%)
- **S&P (SPY) same period:** +3%
- **Extended window analysis:**
  - Best entry available: $97 (3% below your entry)
  - Best exit available: $122 (+22% from your entry, +25.8% from best entry)
  - Your max possible: 25%
  - SPY max possible in extended window: 5%
- **Annualized prediction:** 20% in 2 months = 120%/year

**Calculated Scores:**

| # | Metric | Calculation | Score |
|---|--------|-------------|-------|
| 1 | Difficulty | 120% / 10% | **12x** |
| 2 | Raw TARGET | 18% / 20% × 100 | **90** |
| 3 | Raw AIM | 18% gain | **18** (or 108 annualized?) |
| 4 | Raw SHOT | 18% / 25% × 100 | **72** |
| 5 | Alpha TARGET | (20% - 3%) / 3% | **5.6x** |
| 6 | Alpha AIM | 18% / 3% | **6x** |
| 7 | Alpha SHOT | 25% / 5% | **5x** |
| 8 | Letter Grade | Composite TBD | **A-** |

---

### Major Scoring Challenges

#### Challenge 1: Annualization Problem (Raw AIM)

**The issue:** Short-term trades produce absurd annualized numbers.
- 5% in 1 day = 1,825% annualized
- 35% in 1 week = 1,820% annualized

**The need:** We want to reward efficient use of time/capital, but not make day trading look 20x better than patient investing.

**Potential solutions:**
- Cap the annualized number?
- Use a different time normalization (PPD)?
- Tiered approach based on holding period?
- Log scale?

#### Challenge 2: Raw vs Alpha Structure

The 2×3 matrix (Raw/Alpha × Target/Aim/Shot) is elegant, but do the Alpha versions actually make sense?

| Metric | Raw Version Clear? | Alpha Version Clear? |
|--------|-------------------|---------------------|
| TARGET | ✓ Prediction accuracy | ? Prediction boldness vs market? |
| AIM | ✓ Your actual return | ✓ Your return vs market |
| SHOT | ✓ Optimal capture % | ? Your optimal vs market optimal? |

**Key Questions:**
- Is Alpha TARGET measuring something useful?
- Does Alpha SHOT tell a meaningful story?
- Should we abandon the strict 2×3 matrix for something that fits the concepts better?

#### Challenge 3: What Story Does Each Metric Tell?

For the scoring to be useful for learning, each metric should answer a clear question:

| Metric | Question It Answers | Clear? |
|--------|---------------------|--------|
| Difficulty | "How bold was my prediction?" | ✓ |
| Raw TARGET | "Did I predict correctly?" | ✓ |
| Raw AIM | "How much did I make?" | ✓ |
| Raw SHOT | "Did I time it well?" | ✓ |
| Alpha TARGET | "Was my prediction bold vs actual market?" | ? |
| Alpha AIM | "Did I beat the market?" | ✓ |
| Alpha SHOT | "Was my stock's potential better than market's?" | ? |
| Letter Grade | "What's my overall score?" | ✓ |

#### Challenge 4: Difficulty vs Alpha TARGET Overlap

Both metrics compare your prediction to the market, but differently:

- **Difficulty:** Your prediction vs *expected* 10%/year S&P
- **Alpha TARGET:** Your prediction vs *actual* S&P during holding period

Is this redundant? Do both tell useful, distinct stories?

#### Challenge 5: Grade Calculation

How do we combine 7 metrics into one letter grade?

- Which metrics matter most?
- Should some be weighted higher?
- Can you get an A with a bad Alpha AIM?
- What earns AA vs AAA?

---

## 5. Messaging & Value Propositions

### The Six Core Value Propositions

These messages are woven throughout the app:

| # | Pillar | Core Message | Why It Matters |
|---|--------|--------------|----------------|
| 1 | **Trades You Can Trust** | Immutable records, timestamped predictions | Traders can't verify their own track records. We fix that. |
| 2 | **Everyone Wins in a Good Market** | Bull/Bear/Flat tagging, benchmark comparison | Bull markets create false confidence. We show context. |
| 3 | **Trading the Right Way** | Thesis-first workflow (Target → Aim → Shot) | Most traders skip fundamentals. We force discipline. |
| 4 | **Have a Plan and Know It** | Exit conditions, warning signs, macro risks | Traders know when to get in but not out. We remind them. |
| 5 | **The Only App With a Real Scoreboard** | PPD, accuracy, difficulty, NPC opponents | No other app scores trading performance meaningfully. |
| 6 | **The Only App That Shows Opportunity Cost** | Dollar difference vs benchmark, not just % | "I made 20%" means nothing without context. |

### Detailed Value Prop: Opportunity Cost Display

Every trade shows:
- **Your return** ($ and %)
- **What SPY did** in the same period
- **Dollar difference** ("You made $2,000. SPY would have made $3,100.")
- **Alpha generated** (or opportunity cost)

### NPC Opponents (Benchmarks as Enemies)

Benchmark comparisons are framed as "NPC Opponents" - computer-controlled enemies you're trying to beat:

| NPC | Benchmark | Description |
|-----|-----------|-------------|
| **The Index** | S&P 500 (SPY) | The default opponent. Did you beat the market? |
| **The Sector** | Sector ETFs | Beat the sector you're trading in |
| **The Risk-Free** | T-Bills | Beat doing nothing |

### Market Condition Tags

Each trade is tagged with market conditions at entry:

| Condition | Definition | Icon |
|-----------|------------|------|
| **Bull** | S&P up >10% annualized | 🐂 |
| **Bear** | S&P down >10% annualized | 🐻 |
| **Flat** | Between -10% and +10% | ➖ |

*Addresses "everybody does well in a good market" - context matters.*

### Voice & Tone

**Personality:**
- **Confident but not arrogant** - We know this works, but we're not condescending
- **Playful but not frivolous** - Game elements, but real money stakes
- **Direct but not harsh** - We tell the truth, but we're not mean about it
- **Educational but not preachy** - We teach, but we don't lecture

**Sample Copy Styles:**

**Good:**
- "You beat the market by $340. Nice work."
- "SPY did better this time. It happens."
- "Your thesis was right, but your timing was off."

**Bad:**
- "Congratulations!!! You're amazing!!!" (too sycophantic)
- "You failed to beat the benchmark." (too harsh)
- "As we always say, proper thesis documentation is key to..." (too preachy)

---

## 6. Design Philosophy

### "Arena First, Always"

This isn't a financial platform that happens to look like a game. **It IS a game that happens to be about trading.**

Every page should feel like you're in a competitive arena where your predictions are on the scoreboard.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Game feel, not finance feel** | Engaging, fun, less intimidating |
| **Scoreboard first** | Performance is the hero, not portfolio value |
| **Transparency over vanity** | All predictions visible, wins AND losses |
| **Learning over bragging** | Personal growth is the primary value |
| **Dense, not airy** | A scoreboard is packed with data. Every pixel = information. |
| **Historical data is sacred** | Closed items more important than active for learning; no hiding mistakes |

### Visual Identity

| Element | Implementation |
|---------|----------------|
| **Background** | Deep Navy (#0f1419) - Arena feel |
| **Borders** | Gold/Amber (#d4af37) - Premium, scoreboard feel |
| **Win Indicator** | Neon Green (#00ff41) - Growth, success |
| **Loss Indicator** | Bright Red (#ff3333) - Clear feedback |
| **Numbers** | LED-style font - Scoreboard authenticity |
| **Corners** | Sharp or 45° cuts - NOT soft rounded |
| **Spacing** | Dense - compress, don't spread |

### What We Avoid

- ❌ Rounded corners (>4px)
- ❌ Pastel colors
- ❌ Airy whitespace
- ❌ Soft shadows
- ❌ Centered layouts
- ❌ Modal dialogs
- ❌ Generic "Dashboard" language (use "Scoreboard," "Arena")

### The Test

> "Would this feel at home in an esports broadcast or NBA 2K menu?"
> If no, it doesn't belong in Outvestments.

---

## 7. Competitive Landscape

### Key Differentiators vs Competition

| Feature | Outvestments | Competitors |
|---------|--------------|-------------|
| Thesis Requirement | Mandatory | Optional/None |
| NPC Opponents | Yes (SPY, sectors) | None |
| Market Condition Tags | Yes | No |
| Opportunity Cost Display | Dollar amounts | None |
| Performance Per Day | Yes | No |
| Skill Verification | Transparent records | Hidden/None |
| Three-Tier Scoring | Target/Aim/Shot | None |

### Competitive Threats to Monitor

| Threat | Timeline | Impact | Our Response |
|--------|----------|--------|--------------|
| **BearBull** (fantasy stock trading) | April 2026 | Medium | Launch first, establish thesis-first positioning |
| **Robinhood adding social** | 2025 | Low | They lack thesis requirement, different target |
| **eToro copying features** | 12-18 months | Medium | Network effects protect; thesis changes core UX |
| **TradingView adding prediction tracking** | Unknown | High | First-mover advantage critical |

### Underserved Segments We Target

1. **Aspiring analysts** - Want to build track records but aren't Seeking Alpha contributors
2. **Thesis-driven investors** - Currently no platform validates their reasoning
3. **Time-horizon specialists** - Long-term investors disadvantaged by current metrics
4. **Catalyst hunters** - No platform tracks catalyst identification skill

---

## 8. Business Analysis & Risks

### Regulatory Concerns (HIGH PRIORITY)

#### Gamification Regulatory Scrutiny

- Massachusetts Securities Division fined Robinhood $7.5 million for gamification features (January 2024)
- Features cited: confetti, scratch-off animations, push notifications with emojis
- SEC proposed (later withdrawn) rules on predictive analytics and gamification

**Our Risk Areas:**

| Feature | Risk Level | Concern |
|---------|-----------|---------|
| Scoreboard/leaderboards | Medium | Could encourage overtrading |
| Achievement badges | Medium | Psychological manipulation concerns |
| Difficulty multipliers | Low-Medium | Encourages riskier bets |
| Game-like terminology | Low | Less concerning than visual effects |

**Mitigation:** Educational framing, no confetti/animations, clear disclaimers.

#### Investment Advice Risk

If we surface other users' predictions with performance metrics, this could be construed as providing "investment advice" under SEC regulations.

**Mitigation:** Clear disclaimers, no direct compensation for predictions, legal review before Phase 2 social features.

### User Psychology Risks

| Issue | Risk | Recommendation |
|-------|------|----------------|
| **Thesis fatigue** | Users may avoid shots due to thesis requirement | Allow "quick shots" with minimal thesis |
| **Analysis paralysis** | Too many fields to fill | Progressive disclosure |
| **Negative scoring psychology** | Users demoralized by poor scores | Encouragement messaging, minimum floors |
| **Abandonment risk** | Users create shots but never close them | Auto-close at target date |
| **Loss aversion** | Users avoid closing losing positions | Prompts for stale positions |

### User Churn Factors

| Churn Factor | Industry Data | Our Risk |
|-------------|---------------|----------|
| **Poor onboarding** | 80% Day-1 churn typical | Alpaca API setup is friction |
| **No early wins** | Users who fail first attempts rarely return | Consider "training wheel" shots |
| **Complexity** | Financial apps have 4.6% 30-day retention | Thesis requirement adds complexity |
| **No social validation** | Isolation reduces commitment | Social features needed in Phase 2 |

### Edge Case Handling Needed

| Event | Handling | Status |
|-------|----------|--------|
| Stock split | Adjust entry price and target proportionally | Defined |
| Merger (cash) | Force close at acquisition price | Defined |
| Merger (stock) | Convert ticker, adjust target | Defined |
| Delisting | Force close at last price | Defined |
| Dividends | Include in total return calculation | Defined |
| Same-day trades | Count as 1 day minimum | Defined |

---

## 9. Open Questions for Discussion

### Scoring Methodology

1. **Is the 8-metric structure overengineered?** Should we simplify to fewer metrics?

2. **How should we handle annualization** for Raw AIM without breaking on short-term trades?

3. **Is Alpha TARGET a meaningful metric?** It measures "prediction boldness vs actual market" - is this useful or confusing?

4. **Is Alpha SHOT a meaningful metric?** Comparing "your optimal vs market optimal" - does this tell a useful story?

5. **Should we keep the strict 2×3 matrix** (Raw/Alpha × Target/Aim/Shot) or rethink the structure entirely?

6. **How should the Letter Grade be calculated?** What weights? What earns AA vs AAA?

7. **What edge cases will break this?** Day trades, losing trades, flat market, etc.

8. **Is this learnable for users?** Can a new user understand what these numbers mean?

### Terminology & Positioning

9. **Does Target/Aim/Shot terminology make intuitive sense?** Or is it too clever/confusing?

10. **Are we positioning correctly?** Is "trading education system disguised as a game" the right framing?

11. **NPC Opponents framing** - is treating benchmarks as "enemies" the right approach? Too aggressive? Too gamified?

12. **Six messaging pillars** - are any of these redundant? Are we missing anything critical?

### Business Model

13. **Thesis requirement as friction** - Is forcing thesis documentation worth the user friction it creates?

14. **How do we avoid becoming another place for "finfluencers"** when we add social features?

15. **Regulatory positioning** - How do we stay on the right side of gamification scrutiny while still being engaging?

### Design Philosophy

16. **"Arena first"** - Is the esports/competitive gaming aesthetic the right choice for this audience? Or is it too niche?

17. **Dense data displays** - Are we trading usability for aesthetic? Can casual users handle this information density?

---

## Summary Statistics

- **Product Brief Version:** 2.0 (Dec 2025)
- **PRD Version:** 1.8 (Dec 2025)
- **Scoring System Status:** Under redesign (8-metric proposal)
- **Deployment Status:** MVP deployed at outvestments.dev.nextlevelfoundry.com
- **Target Launch:** Q1 2026

---

*Document compiled for AI consultation. All source documents available in the Outvestments repository under `_bmad-output/planning-artifacts/`.*
