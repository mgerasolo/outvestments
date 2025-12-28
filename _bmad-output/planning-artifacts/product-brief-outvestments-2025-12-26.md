---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - paper-trading-api-research.md
  - competitive-analysis.md
date: 2025-12-26
updated: 2025-12-27
author: Matt
project_name: outvestments
version: 2.0
---

# Product Brief: Outvestments

> **Taglines:** "Outvest the Rest" | "Outvest the Best"

**Domain:** Outvestments.com

---

## Executive Summary

Outvestments is a **gamified platform for proving, measuring, and learning investing skill** through paper trading and prediction tracking. Unlike traditional paper trading apps that focus on simulated returns, Outvestments emphasizes **thesis documentation**, **time-normalized scoring**, and a **game-like experience** that makes tracking predictions engaging rather than tedious.

**Core Identity:** Outvestments is not just a trading tracker - it's a **trading education system** disguised as a game.

It solves three core problems:

1. **Skill Proof:** How do you prove you're a good investor without risking real money?
2. **Skill Discovery:** How do you identify who's actually skilled vs lucky?
3. **Fair Comparison:** How do you compare performance when people hold for different durations?

By requiring thesis documentation before predictions and scoring with time-normalized metrics (PPD), Outvestments creates transparent, comparable track records that distinguish genuine skill from luck.

Paper trading is the starting instrument - chosen for accessibility and low regulatory friction. The thesis and tracking methodology will later integrate into **DoughFlow** for real trading.

---

## The Six Messaging Pillars

These messages are woven throughout the app to teach better trading habits:

| Pillar | Core Message | Why It Matters |
|--------|--------------|----------------|
| **Trades You Can Trust** | Immutable records, timestamped predictions | Traders can't verify their own track records. We fix that. |
| **Everyone Wins in a Good Market** | Bull/Bear/Flat tagging, benchmark comparison | Bull markets create false confidence. We show context. |
| **Trading the Right Way** | Thesis-first workflow (Target → Aim → Shot) | Most traders skip fundamentals. We force discipline. |
| **Have a Plan and Know It** | Exit conditions, warning signs, macro risks | Traders know when to get in but not out. We remind them. |
| **The Only App With a Real Scoreboard** | PPD, accuracy, difficulty, NPC opponents | No other app scores trading performance meaningfully. |
| **The Only App That Shows Opportunity Cost** | Dollar difference vs benchmark, not just % | "I made 20%" means nothing without context. |

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

### Key Differentiators

| Differentiator | Why It Matters |
|----------------|----------------|
| Thesis Transparency | See WHY someone made a prediction, not just what |
| Performance Per Day (PPD) | Fair comparison across different timeframes |
| NPC Opponents | Always know if you beat the market (S&P, sector ETFs) |
| Market Condition Tags | Performance in context (bull/bear/flat markets) |
| Opportunity Cost Display | Dollar amounts vs benchmark, not just percentages |
| Skill Verification | Distinguish genuine skill from luck over time |

### Platform Trajectory

**Outvestments** (Paper Trading) → **DoughFlow** (Real Trading)

The thesis and tracking methodology developed here will integrate into DoughFlow for real-money trading with the same discipline and transparency.

---

## Core Terminology

### The Three-Tier Hierarchy

| Term | Definition | Analogy |
|------|------------|---------|
| **Target** | A thesis or theme-level prediction. The WHY behind your trades. | "AI will dominate 2025" |
| **Aim** | A specific prediction: ticker + price + date. The WHAT you're betting on. | "NVDA to $200 by March 2025" |
| **Shot** | A trade/order. The execution of your prediction. | Buy 10 shares NVDA @ $140 |

**Flow:** Target (thesis) → Aim (prediction) → Shot (trade)

### Shot States

| State | Description |
|-------|-------------|
| **Pending** | Order created, not yet armed |
| **Armed** | Ready to execute (limit order waiting) |
| **Fired** | Order submitted to market |
| **Active** | Position open, being tracked |
| **Closed** | Position closed, scored |

### NPC Opponents

Benchmark comparisons are framed as "NPC Opponents" - computer-controlled enemies you're trying to beat:

| NPC | Benchmark | Description |
|-----|-----------|-------------|
| **The Index** | S&P 500 (SPY) | The default opponent. Did you beat the market? |
| **The Sector** | Sector ETFs | Beat the sector you're trading in |
| **The Risk-Free** | T-Bills | Beat doing nothing |

*Future: PvP (player vs player) leaderboards*

### Competition Types (Future)

| Term | Definition | Typical Duration |
|------|------------|------------------|
| **Volley** | Head-to-head competition between two users | Variable |
| **Heat** | Short burst competition | 7-30 days |
| **Season** | Major quarterly competition period | ~3 months |
| **Series** | Multi-part competition with cumulative scoring | Multiple heats |

---

## Scoring System

### Three-Tier Scoring

| Level | What's Scored | Key Metrics |
|-------|---------------|-------------|
| **Target** | Thesis quality | % of Aims that hit, overall thesis grade |
| **Aim** | Prediction accuracy | Hit target? How close? |
| **Shot** | Trade execution | PPD, alpha generated, opportunity cost |

### Performance Per Day (PPD)

The core time-normalized metric:

**PPD = (% gain or loss) / (days held)**

This solves the problem of comparing a 10% gain over 3 days vs 10% gain over 30 days.

| Scenario | Return | Days | PPD |
|----------|--------|------|-----|
| Quick win | +10% | 5 | **2.0** |
| Slow win | +10% | 50 | **0.2** |
| Quick loss | -5% | 3 | **-1.67** |

### Accuracy Scoring

How close did you get to your predicted target?

| Actual vs Target | Accuracy Score |
|------------------|----------------|
| Hit target exactly | **100** |
| Exceeded by 50% | **150** |
| Got 80% of target | **80** |
| Broke even | **0** |
| Wrong direction | **Negative** |

*Formula: (Actual Return / Target Return) × 100*

### NPC Comparison (Alpha/Opportunity Cost)

Every trade shows:
- **Your return** ($ and %)
- **What SPY did** in the same period
- **Dollar difference** ("You made $2,000. SPY would have made $3,100.")
- **Alpha generated** (or opportunity cost)

### Market Condition Tags

Each trade is tagged with market conditions at entry:

| Condition | Definition | Icon |
|-----------|------------|------|
| **Bull** | S&P up >10% annualized | 🐂 |
| **Bear** | S&P down >10% annualized | 🐻 |
| **Flat** | Between -10% and +10% | ➖ |

*Addresses "everybody does well in a good market" - context matters.*

### Unicorn Events (Black Swan Tracking)

Major market events are flagged:
- COVID crash (Mar 2020)
- Trump tariffs (Dec 2024)
- Flash crashes

Trades during these periods get a unicorn icon 🦄 and separate performance tracking.

---

## Design Philosophy

- **Game feel, not finance feel** - Engaging, fun, less intimidating
- **Scoreboard first** - Performance is the hero, not portfolio value
- **Transparency over vanity** - All predictions visible, wins AND losses
- **Learning over bragging** - Personal growth is the primary value
- **Educational by design** - Every feature teaches better trading habits

### UI/UX Identity

- **Floating Sidebar** - Main navigation, always accessible
- **Windows 95 Modals** - Distinctive, nostalgic feel for detail views
- **Toast Notifications** - Achievement unlocks, milestone celebrations
- **Dark Theme** - Professional trading aesthetic

---

## Target Users

### Primary Persona: The Self-Aware Investor

*"I want to know if I'm actually good at this, and WHERE I'm good at it."*

**Core Needs:**
- Track all predictions with full accountability
- See performance broken down by sector, thesis type, timeframe
- Identify patterns: "I do great in AI, awful in retail"
- Answer: "Am I getting better or worse as a trader?"

### Secondary Persona: The Transparency Seeker

*"I'm tired of finfluencers who only show their wins."*

**Core Needs:**
- See FULL track records, not curated highlights
- Verify overall win rate, consistency, return across ALL choices
- "Anyone can show 20 wins - show me your 1000 trades"

### User Value Hierarchy

| Priority | Value | Description |
|----------|-------|-------------|
| **1. Primary** | Personal Growth | Know how good I am, where I excel, what works for me |
| **2. Secondary** | Sharing | Let others see my track record and thesis methodology |
| **3. Tertiary** | Discovery | Find proven performers to learn from |
| **4. Icing** | Competition | Heats, volleys, leaderboards for fun |

---

## Technical Platform

**Primary Integration: Alpaca Paper Trading API**

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL |
| Authentication | Authentik |
| Trading API | Alpaca Paper Trading API |
| Testing | Playwright (E2E) + Vitest (unit) |
| Monitoring | Sentry + Loki |
| Deployment | Docker (self-hosted) |

See: [paper-trading-api-research.md](../../paper-trading-api-research.md)

---

## MVP Scope

### Core Features (Must Have)

| Feature | Description |
|---------|-------------|
| User Auth | Individual accounts (Authentik) |
| Create Target | Thesis with reasoning, catalysts, timeframe |
| Create Aim | Specific prediction: ticker + price + date |
| Execute Shot | Trade execution through Alpaca |
| Manual Trade Entry | Backfill external trades with thesis data |
| Live Portfolio View | Real-time positions and performance |
| Historical Chart | 30-day bar graph of daily gain/loss |
| PPD Display | Performance Per Day per shot |
| NPC Comparison | Performance vs S&P on every trade |
| Market Condition Tags | Bull/Bear/Flat tagging |
| Trader Progress Dashboard | "Am I getting better?" with win/loss trends |
| Nightly Data Capture | Store EOD holdings, assets, performance daily |
| Options Support | Calls/Puts with strike, expiration, premium tracking |
| Short Positions | Short selling with thesis on downward movement |

### MVP Success Criteria

User can:
- Create Targets with thesis documentation
- Add Aims with specific predictions
- Execute Shots (trades) linked to Aims
- See trajectory and PPD for each Shot
- Compare every trade to the S&P NPC
- View 30-day historical performance chart
- Answer: "Am I getting better as a trader?"

### Out of Scope (Phase 2+)

| Feature | Phase | Notes |
|---------|-------|-------|
| Sharing (public/private profiles) | 2 | Toggle profile visibility |
| Pattern/sector analysis | 2 | Performance breakdown by sector/thesis type |
| Following/discovery | 2 | Browse and follow proven performers |
| Competition (heats/volleys) | 3 | Gamification layer |
| Leaderboards | 3 | Ranked user performance |
| Rookie Season | 3 | Protected first 90 days |
| Daily Streak | 3 | Duolingo-style engagement |
| Weekly Challenges | 3 | Rotating objectives |
| Shareable Shot Cards | 3 | Social media sharing |
| Sector Leagues | 3 | Specialized leaderboards |
| Duo-style Notifications | 3 | Playful push notifications |
| Daily Market Quiz | 3 | Educational touchpoint |

---

## Competitive Advantage Summary

| Feature | Outvestments | Competitors |
|---------|--------------|-------------|
| Thesis Requirement | Mandatory | Optional/None |
| NPC Opponents | Yes (SPY, sectors) | None |
| Market Condition Tags | Yes | No |
| Opportunity Cost Display | Dollar amounts | None |
| Performance Per Day | Yes | No |
| Skill Verification | Transparent records | Hidden/None |
| Three-Tier Scoring | Target/Aim/Shot | None |

See: [competitive-analysis.md](../../competitive-analysis.md)

---

## Success Metrics

### Phase 1: MVP

*"Can I use this to track my trades and know if I'm getting better?"*

| Goal | Success Metric |
|------|----------------|
| Log trades | Targets → Aims → Shots created with thesis |
| Track performance | Portfolio view with historical trajectory |
| Beat the market? | NPC comparison on every trade |
| Am I improving? | Trader Progress Dashboard with trends |
| Gain per period | PPD calculated and displayed per Shot |

### Phase 2: Pattern & Social

| Goal | Success Metric |
|------|----------------|
| Pattern analysis | Performance breakdown by sector, thesis type |
| Share methodology | Public profile with full track record |
| Learn from others | Browse/follow proven performers |

### Phase 3: Engagement & Competition

| Goal | Success Metric |
|------|----------------|
| Daily engagement | Streak tracking, weekly challenges |
| Social sharing | Shareable Shot Cards, viral moments |
| Competition | Heats, volleys, leaderboards functional |

---

## Related Documents

- [PRD](prd-outvestments-2025-12-27.md) - Full requirements
- [Architecture](architecture.md) - Technical design
- [Epics](epics.md) - User stories (95 total)
- [UX Design Specification](ux-design-specification.md) - UI/UX details
- [Messaging & Positioning](messaging-and-positioning.md) - Core messaging strategy
- [Future Enhancements - Phase 3](future-enhancements-phase3.md) - Engagement features
- [Achievement Ideas](achievement-ideas.md) - 100 achievements across 10 categories

---

*Last Updated: 2025-12-27 | Version 2.0*
