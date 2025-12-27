---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - paper-trading-api-research.md
  - competitive-analysis.md
date: 2025-12-26
author: Matt
project_name: outvestments
---

# Product Brief: Outvestments

> **Taglines:** "Outvest the Rest" | "Outvest the Best"

**Domain:** Outvestments.com

---

## Executive Summary

Outvestments is a platform for **proving, measuring, and learning investing skill**.

It solves three core problems:
1. **Skill Proof:** How do you prove you're a good investor without risking real money?
2. **Skill Discovery:** How do you identify who's actually skilled vs lucky?
3. **Fair Comparison:** How do you compare performance when people hold for different durations?

By requiring thesis documentation before predictions and scoring with time-normalized metrics (PPD), Outvestments creates transparent, comparable track records that distinguish genuine skill from luck.

Paper trading is the starting instrument - chosen for accessibility and low regulatory friction. The thesis and tracking methodology will later integrate into **DoughFlow** for real trading.

---

## Core Vision

### Problem Statement

There's no way to prove investing skill without risking capital, and no way to know if someone you're following actually has skill or just had a hot streak.

Context matters: "I made 5% this year" sounds good - but if market average was 10% and max 401k would yield 30%, that "5% gain" is actually 25% underperformance. Nobody factors in how long you held something as a key metric.

### Why Existing Solutions Fall Short

| Approach | Gap |
|----------|-----|
| Following "Finfluencers" | No verified track record, no thesis transparency |
| Copy Trading (eToro) | Copies trades, not reasoning - you don't learn WHY |
| Paper Trading Apps | No skill measurement, no social learning |
| Trading Competitions | Reward returns without methodology transparency |

**The Gap:** No platform lets you transparently prove your investing skill, show your reasoning, and enable others to evaluate and learn from your methodology.

### Proposed Solution

A platform where every prediction requires:
- **Thesis** - WHY you believe this
- **Catalyst** - WHAT will drive the movement
- **Target** - WHERE you expect it to go and WHEN

Scored with time-normalized metrics to enable fair comparison.

### Key Differentiators

| Differentiator | Why It Matters |
|----------------|----------------|
| Thesis Transparency | See WHY someone made a prediction, not just what |
| Performance Per Day (PPD) | Fair comparison across different timeframes |
| Catalyst Tracking | Completely unique in market |
| Skill Verification | Distinguish genuine skill from luck over time |

### Platform Trajectory

**Outvestments** (Paper Trading) → **DoughFlow** (Real Trading)

The thesis and tracking methodology developed here will integrate into DoughFlow for real-money trading with the same discipline and transparency.

---

## Core Terminology

### Prediction Units

| Term | Definition |
|------|------------|
| **Shot** | A single prediction/thesis on a stock. "Call your shot" - like Babe Ruth pointing to the stands before his home run. Represents a complete prediction with thesis, catalyst, target, and timeframe. |
| **Clip** | A cluster of shots representing an allocation strategy. Like a clip in a gun - multiple rounds ready to fire as part of a coordinated strategy. |

### Competition Types

| Term | Definition | Typical Duration |
|------|------------|------------------|
| **Volley** | Head-to-head competition between two users or teams | Variable |
| **Heat** | Short burst competition | 7-30 days |
| **Season** | Major quarterly competition period | ~3 months |
| **Series** | Multi-part competition with cumulative scoring | Multiple heats |
| **Campaign** | Long-term thematic competition (e.g., "Tech Titans 2025") | Extended |
| **Bracket** | Elimination tournament format | Variable |

*Note: Avoided "Round" as it conflicts with archery terminology (a round is a single arrow/bullet).*

### Shot Scoring Overview

Each shot is evaluated on three dimensions:

| Dimension | What It Measures | Scale |
|-----------|------------------|-------|
| **Accuracy** | Did you hit your target? | 0-100+ (percentage of target achieved) |
| **Performance** | How much did you make vs benchmarks? | % difference (Raw vs 10%/yr, Delta vs actual S&P) |
| **Difficulty** | How bold was your prediction? | Multiplier (0.5x - 2.5x) |

**Composite Shot Score** = Accuracy × Difficulty Multiplier

*Example: 85 accuracy × 1.5x difficulty = **127.5** shot score*

*Note: "Alpha" reserved for future platform branding/features.*

### Accuracy Scoring

How close did you get to your predicted target? Simple percentage-based score:

| Actual vs Target | Accuracy Score |
|------------------|----------------|
| Hit target exactly | **100** |
| Exceeded by 50% | **150** |
| Doubled target | **200** |
| Got 80% of target | **80** |
| Got 50% of target | **50** |
| Broke even (predicted gains) | **0** |
| Wrong direction | **Negative** |

*Formula: (Actual Return / Target Return) × 100*

No terminology to memorize - just look at the number. Badges and achievements can layer on top later.

### Performance Scoring

How well did you do vs what the market would have done in the same time?

| Type | Benchmark | Description |
|------|-----------|-------------|
| **Raw Performance** | Expected market (~10%/yr prorated) | Your return vs what market "should" return in same period |
| **Delta Performance** | Actual S&P (same period) | Your return vs what S&P actually did during your hold |

**Formulas:**
- Expected Market Return = 10% × (Days Held / 365)
- Raw Performance = (Your Return / Expected) × 67
- Delta Performance = (Your Return / Actual S&P) × 67

**Examples:**

| Holding Period | Your Return | Expected (10%/yr) | Actual S&P | Raw | Delta |
|----------------|-------------|-------------------|------------|-----|-------|
| 36 days | +5% | +1% | +3% | **335** | **112** |
| 180 days | +3% | +5% | +8% | **40** | **25** |
| Matched market | +1% | +1% | +1% | **67** | **67** |
| 20% better | +1.2% | +1% | +1% | **80** | **80** |
| 1.5x market | +1.5% | +1% | +1% | **100** | **100** |
| Doubled market | +2% | +1% | +1% | **134** | **134** |

- **67** = matched market (C grade, average)
- **80** = 20% better (B-)
- **100** = 1.5x market (A)
- **134** = doubled market (A+)
- **Below 67** = underperformed

*67 is baseline (⅔ × 100), so 1.5x market = 100 exactly.*

### Difficulty Scoring

How bold was your prediction? Like archery - hitting bullseye from 70m is harder than from 10m.

| Distance | Target Return | Difficulty Multiplier |
|----------|---------------|----------------------|
| Point Blank | <5% | 0.5x |
| Close Range | 5-15% | 1.0x |
| Mid Range | 15-30% | 1.5x |
| Long Range | 30-50% | 2.0x |
| Extreme Range | >50% | 2.5x |

**Delta Difficulty:** Predictions significantly above/below market expectations earn higher difficulty ratings.

*Note: Short plays get extra credit - beating S&P when it went UP shows more skill.*

### Trajectory Scoring

Unlike traditional platforms that only score final outcomes, Outvestments tracks the **journey** toward the target:

- **Trajectory** - The path a prediction takes toward its target over time
- **On Track** - Prediction moving in the expected direction
- **Drifting** - Prediction moving sideways or slowly diverging
- **Off Course** - Prediction moving opposite to thesis

### Performance Metrics

| Metric | Definition |
|--------|------------|
| **Performance Per Day (PPD)** | Time-normalized performance metric: (% gain or loss) / (days held). Solves the problem of comparing a 10% gain over 3 days vs 10% gain over 30 days. |
| **Thesis Accuracy** | How well the stated thesis predicted actual market movement |
| **Catalyst Hit Rate** | Percentage of identified catalysts that actually occurred |

---

## Social Features

- **Following** - Users can follow other users to see their shots
- **Public Profiles** - Track record, thesis history, accuracy stats
- **Leaderboards** - Ranked by various metrics (accuracy, PPD, trajectory)
- **Comments/Discussion** - Engage with predictions and theses

---

## Technical Platform

**Primary Integration: Alpaca Paper Trading API**

Selected based on research:
- Free paper trading with no funded account required
- Real-time IEX market data included
- 200 requests/minute rate limit (sufficient for MVP)
- Clear path to multi-user via Broker API
- Excellent documentation and SDK support
- Commission-free, modern REST API

See: [paper-trading-api-research.md](../../paper-trading-api-research.md)

---

## Competitive Advantage Summary

| Feature | Outvestments | Competitors |
|---------|--------------|-------------|
| Thesis Requirement | Mandatory | Optional/None |
| Catalyst Tracking | Full system | None |
| Trajectory Scoring | Yes | No |
| Performance Per Day | Yes | No |
| Skill Verification | Transparent records | Hidden/None |

See: [competitive-analysis.md](../../competitive-analysis.md)

---

## Target Users

### User Value Hierarchy

| Priority | Value | Description |
|----------|-------|-------------|
| **1. Primary** | Personal Growth | Know how good I am, where I excel, what works for me |
| **2. Secondary** | Sharing | Let others see my track record and thesis methodology |
| **3. Tertiary** | Discovery | Find proven performers to learn from |
| **4. Icing** | Competition | Heats, volleys, leaderboards for fun |

### Acquisition vs Retention Model

| | Competition | Personal Growth |
|--|-------------|-----------------|
| **Purpose** | Acquisition hook | Retention value |
| **Message** | "Prove you're the best" | "Know yourself" |
| **Viral potential** | High | Low |

**Hook:** Competition brings users in ("Can you outvest the rest?")
**Sticky:** Personal insights keep them (sector analysis, thesis patterns, improvement tracking)

### Primary Persona: The Self-Aware Investor

*"I want to know if I'm actually good at this, and WHERE I'm good at it."*

**Core Needs:**
- Track all predictions with full accountability
- See performance broken down by sector, thesis type, timeframe
- Identify patterns: "I do great in AI, awful in retail, weak on macro/BLS plays"
- Stop wasting effort on weak areas, double down on strengths
- Validate which thesis patterns consistently work FOR ME

**Key Questions Answered:**
- Am I actually good, or just lucky?
- Which sectors should I focus on?
- Which thesis types consistently win for me?
- Am I improving over time?

### Secondary Persona: The Transparency Seeker

*"I'm tired of finfluencers who only show their wins."*

**Core Needs:**
- See FULL track records, not curated highlights
- Verify overall win rate, consistency, return across ALL choices
- Find people worth following based on proven performance
- Cut through pump-and-dump noise
- "Anyone can show 20 wins - show me your 1000 trades"

### Platform Transparency Features

| What Finfluencers Do | What Outvestments Forces |
|----------------------|--------------------------|
| Show only wins | All shots visible - wins AND losses |
| Cherry-pick highlights | Full track record, no hiding |
| No accountability | Every prediction timestamped and scored |
| Vague "I called it" claims | Specific thesis + target + timeframe recorded |

### User Journey

1. **Discovery:** "I want to prove I'm good / find who's actually good"
2. **Onboarding:** Create first shot with thesis, catalyst, target
3. **Core Usage:** Track predictions, review performance analytics by sector/thesis type
4. **Value Moment:** "I finally see WHERE I'm strong and weak"
5. **Long-term:** Personal performance dashboard becomes essential investing tool

---

## Success Metrics

### Phase 1: Critical Must-Goals (MVP)

*"Can I use this to track my trades and know what to do with them?"*

| Goal | Success Metric |
|------|----------------|
| Log trades | Shots created with thesis, catalyst, target |
| Track performance | Portfolio view with historical trajectory |
| On path assessment | Trajectory status (On Track / Drifting / Off Course) |
| Gain per period | PPD calculated and displayed per shot |
| Hold/exit clarity | Exit signals based on target + trajectory |

**MVP Success:** User can create shots, track trajectory, and make informed hold/exit decisions.

### Phase 2: Pattern & Social

*"What works for me, and can I share/learn?"*

| Goal | Success Metric |
|------|----------------|
| Pattern analysis | Performance breakdown by sector, thesis type |
| Best thesis types | Win rate by thesis category |
| Share methodology | Public profile with full track record |
| Learn from others | Browse/follow proven performers |

### Phase 3: Competitive Market (Reach Goal)

*"Can this be a competitive platform that goes to market?"*

| Goal | Success Metric |
|------|----------------|
| Competition features | Heats, volleys, brackets functional |
| User acquisition | Growth via competitive hook |
| Market viability | Revenue potential validated |

---

## MVP Scope

### Core Features (Must Have)

| Feature | Description |
|---------|-------------|
| User Auth | Individual accounts (Authentik) |
| Create Shot | Thesis, catalyst, target price, timeframe |
| Manual Trade Entry | Backfill external trades with thesis data |
| Clips | Group related shots by theme (Mag 7, AI plays, sector bets) |
| Live Portfolio View | Real-time positions and performance |
| Historical Chart | 30-day bar graph of daily gain/loss |
| Trajectory Status | On Track / Drifting / Off Course per shot |
| PPD Display | Performance Per Day per shot |
| Exit Signals | Target reached / off course indicators |
| Nightly Data Capture | Store EOD holdings, assets, performance daily |
| Options Support | Calls/Puts with strike, expiration, premium tracking |
| Short Positions | Short selling with thesis on downward movement |
| Delta Performance | Compare shot performance vs S&P over same period |

### Nice to Have (MVP)

| Feature | Description |
|---------|-------------|
| Pre/After Market Quotes | Extended hours price data |

### Technical Stack

- Alpaca Paper Trading API
- Authentik (auth per existing setup)
- Nightly jobs for EOD data capture
- Real-time price updates

### MVP+1 (Near-term Enhancements)

| Feature | Description |
|---------|-------------|
| Import Live Trades | Connect to brokerage API to import real trades with thesis backfill |
| Mirror Live Portfolio | Real-time sync of live brokerage positions for tracking |

*Note: Enables users to apply Outvestments methodology to their real trading without switching platforms.*

### Out of Scope (Future Enhancements)

| Feature | Phase | Notes |
|---------|-------|-------|
| Sharing (public/private profiles) | 2 | Toggle profile visibility |
| Share with specific users | 2 | Private sharing without groups |
| Pattern/sector analysis | 2 | Performance breakdown by sector/thesis type |
| Win rate by thesis category | 2 | Which thesis patterns work for you |
| Following/discovery | 2 | Browse and follow proven performers |
| Groups (private sharing circles) | 2+ | Friends-only visibility |
| Competition (heats/volleys/brackets) | 3 | Gamification layer |
| Leaderboards | 3 | Ranked user performance |
| Teams | 3+ | Group competition structure |
| Revenue/monetization | 3 | Premium features, subscriptions |

### MVP Success Criteria

User can:
- Create shots with thesis/catalyst/target
- Backfill trades made outside the system
- Group related shots into clips
- See trajectory and PPD for each shot
- View 30-day historical performance chart
- Make informed hold/exit decisions from dashboard

---

<!-- Workflow complete -->
