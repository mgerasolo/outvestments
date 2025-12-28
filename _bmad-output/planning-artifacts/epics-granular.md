# Outvestments - Granular Epic Breakdown

**Restructured:** 2025-12-28
**Purpose:** Break 95 stories into ~30 manageable epics (3-4 stories each)

---

## Epic Overview

| # | Epic | Stories | Priority | Status |
|---|------|---------|----------|--------|
| 1 | Project Setup | 3 | P0 | Done |
| 2 | Database & ORM | 3 | P0 | Done |
| 3 | Background Jobs Infrastructure | 2 | P0 | Partial |
| 4 | Docker Deployment | 2 | P0 | Done |
| 5 | Authentik SSO Integration | 2 | P0 | Done |
| 6 | User Roles & Sessions | 3 | P0 | Partial |
| 7 | Alpaca API Keys & Security | 3 | P0 | Done |
| 8 | Alpaca Connection & Portfolio | 3 | P0 | Done |
| 9 | Alpaca Resilience (Circuit Breaker) | 3 | P0 | Done |
| 10 | Target CRUD | 4 | P0 | Done |
| 11 | Target Views & Status | 3 | P0 | Partial |
| 12 | Aim Creation & Validation | 4 | P0 | Done |
| 13 | Aim Lifecycle (Expiry, Rollover) | 3 | P0 | Not Started |
| 14 | Pace & Trajectory Tracking | 3 | P0 | Not Started |
| 15 | Shot Configuration | 3 | P0 | Done |
| 16 | Shot State Machine | 3 | P0 | Done |
| 17 | Shot Execution (Alpaca Orders) | 3 | P0 | Done |
| 18 | Shot Close & Partial Close | 3 | P0 | Partial |
| 19 | Options Support | 2 | P1 | Not Started |
| 20 | Scoring Engine Core (PPD, Accuracy) | 4 | P0 | Not Started |
| 21 | Scoring Engine Advanced (Delta, Difficulty) | 4 | P0 | Not Started |
| 22 | Score Rollup (3-Tier) | 4 | P0 | Not Started |
| 23 | Dashboard Layout | 4 | P0 | Partial |
| 24 | Leaderboards | 3 | P0 | Not Started |
| 25 | Charts & Visualizations | 4 | P0 | Not Started |
| 26 | Game-Feel UI (Animations, Toasts) | 4 | P1 | Not Started |
| 27 | History & Track Record | 4 | P1 | Partial |
| 28 | EOD & Background Jobs | 4 | P1 | Partial |
| 29 | Corporate Actions (Splits, Dividends) | 4 | P1 | Not Started |
| 30 | Orphan Position Handling | 3 | P1 | Not Started |
| 31 | Unit Testing (Vitest) | 3 | P0 | Not Started |
| 32 | E2E Testing (Playwright) | 3 | P0 | Not Started |
| 33 | Monitoring & Observability | 3 | P1 | Partial |

---

## Detailed Breakdown

### Epic 1: Project Setup
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 1.1 | Initialize Next.js 16+ with App Router, TypeScript strict | AR1, AR2 |
| 1.2 | Configure shadcn/ui and Tailwind with custom palette | AR3 |
| 1.3 | Configure React Query for client state | AR8 |

---

### Epic 2: Database & ORM
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 2.1 | Set up PostgreSQL with Drizzle ORM | AR4, AR5 |
| 2.2 | Configure database migrations | AR5 |
| 2.3 | Implement PostgreSQL-based caching (no Redis) | AR6 |

---

### Epic 3: Background Jobs Infrastructure
**Priority:** P0 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 3.1 | Configure pg-boss for job processing | AR7 |
| 3.2 | Set up job monitoring and status | AR7 |

---

### Epic 4: Docker Deployment
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 4.1 | Create Dockerfile optimized for Next.js | NFR31 |
| 4.2 | Configure docker-compose with health checks | NFR31, NFR32 |

---

### Epic 5: Authentik SSO Integration
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 5.1 | Integrate NextAuth.js 5 with Authentik OIDC | FR1, AR13 |
| 5.2 | Create user on first login | FR1 |

---

### Epic 6: User Roles & Sessions
**Priority:** P0 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 6.1 | Implement role-based access (viewer, user, power_user, admin) | FR4 |
| 6.2 | Configure session timeouts (60 min default, extended for power users) | NFR27, NFR28 |
| 6.3 | Create user profile settings page | FR5 |

---

### Epic 7: Alpaca API Keys & Security
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 7.1 | API key input form with AES-256 encryption | FR2, NFR2 |
| 7.2 | Keys decrypted only at API call time | NFR3 |
| 7.3 | Server-side only Alpaca calls | NFR4 |

---

### Epic 8: Alpaca Connection & Portfolio
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 8.1 | Validate Alpaca keys and detect Paper vs Live | FR3 |
| 8.2 | Implement onboarding flow with screenshots | FR2, FR3 |
| 8.3 | Portfolio sync - balance, buying power, positions | FR52 |

---

### Epic 9: Alpaca Resilience
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 9.1 | Circuit breaker pattern for API calls | AR15 |
| 9.2 | Rate limiting (200/min) with queue | NFR11, NFR12, NFR13 |
| 9.3 | Price data caching (15-30 min TTL) | NFR9, NFR10 |

---

### Epic 10: Target CRUD
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 10.1 | Create Target form (thesis, type, catalyst, tags) | FR6, FR7 |
| 10.2 | Target types: Stock, Sector, Market, Theme, Event | FR7, FR8 |
| 10.3 | Tag system with autocomplete | FR9 |
| 10.4 | Target list view with filters | FR10 |

---

### Epic 11: Target Views & Status
**Priority:** P0 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 11.1 | Target detail view with Aims and pace bars | FR12, FR48 |
| 11.2 | Target status management (active, closed, expired) | FR10 |
| 11.3 | Advanced mode - thesis risk documentation | FR7 |

---

### Epic 12: Aim Creation & Validation
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 12.1 | Add Aim with ticker search, target price, date | FR13, FR16 |
| 12.2 | Bulk Aim creation | FR14 |
| 12.3 | Reach target (optional) | FR15 |
| 12.4 | Locked target prices (immutable after creation) | FR19 |

---

### Epic 13: Aim Lifecycle
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 13.1 | Aim expiry detection and prompts | FR18 |
| 13.2 | Close, Liquidate, or Rollover options | FR18 |
| 13.3 | Target hit early notification | FR21 |

---

### Epic 14: Pace & Trajectory Tracking
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 14.1 | Pace calculation (%/month required) | FR21 |
| 14.2 | Pace status bar (behind/on-pace/ahead) | FR42 |
| 14.3 | Aim detail view with trajectory | FR49 |

---

### Epic 15: Shot Configuration
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 15.1 | Configure Shot (direction, type, amount) | FR22, FR24 |
| 15.2 | Trigger type selection (Market vs Limit) | FR25 |
| 15.3 | Bulk Shot configuration | FR23 |

---

### Epic 16: Shot State Machine
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 16.1 | State transitions: Pending → Armed → Fired → Active → Closed | FR26 |
| 16.2 | Prediction-only Shots (no paper trade) | FR28 |
| 16.3 | Shot detail view | FR50 |

---

### Epic 17: Shot Execution
**Priority:** P0 | **Status:** Done

| ID | Story | FR |
|----|-------|-----|
| 17.1 | Submit orders to Alpaca API | FR27 |
| 17.2 | Handle market/limit order types | FR27 |
| 17.3 | Update state on fill confirmation | FR27 |

---

### Epic 18: Shot Close & Partial Close
**Priority:** P0 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 18.1 | Close position flow with preview | FR29 |
| 18.2 | Partial close with lot splitting | FR30 |
| 18.3 | Manual trade backfill (admin only) | FR60, FR61 |

---

### Epic 19: Options Support
**Priority:** P1 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 19.1 | Options Shot fields (strike, expiration, premium) | FR31 |
| 19.2 | Options scoring integration | FR31 |

---

### Epic 20: Scoring Engine Core
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 20.1 | Scoring engine architecture (pure functions, isolated) | AR17, AR18 |
| 20.2 | PPD (Performance Per Day) calculation | FR34 |
| 20.3 | Accuracy score calculation | FR35 |
| 20.4 | 100% test coverage for scoring | NFR18 |

---

### Epic 21: Scoring Engine Advanced
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 21.1 | Performance score (Raw) | FR36 |
| 21.2 | Performance score (Delta/Alpha vs S&P) | FR37 |
| 21.3 | Difficulty multiplier (0.5x to 2.5x) | FR38 |
| 21.4 | Composite Shot score | FR39 |

---

### Epic 22: Score Rollup (3-Tier)
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 22.1 | Three-tier rollup: Shot → Aim → Target | FR33 |
| 22.2 | Trajectory tracking visualization | FR40 |
| 22.3 | Trajectory status (On Track, Drifting, Off Course) | FR41 |
| 22.4 | Runway captured percentage | FR43 |

---

### Epic 23: Dashboard Layout
**Priority:** P0 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 23.1 | Row 1: Daily Gains, Account Chart, Stats | FR44 |
| 23.2 | Row 2: 6 Leaderboards | FR45, FR46 |
| 23.3 | Active Aims widget with pace bars | FR47 |
| 23.4 | Floating sidebar navigation | FR68 |

---

### Epic 24: Leaderboards
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 24.1 | My Targets: Trending, Top (sorted by PPD) | FR46 |
| 24.2 | My Shots: Top, Worst | FR46 |
| 24.3 | Platform: Top Users, Top Targets | FR46 |

---

### Epic 25: Charts & Visualizations
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 25.1 | Apache eCharts integration | AR16 |
| 25.2 | Performance line graph (30d, 90d, 1y, all) | FR53 |
| 25.3 | GitHub-style heatmap for daily performance | FR54 |
| 25.4 | Delta bar chart (30-day) | FR55 |

---

### Epic 26: Game-Feel UI
**Priority:** P1 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 26.1 | NPC opponent comparison (Street Fighter style) | UX Spec |
| 26.2 | Game-style animations (tiles slide, numbers animate) | FR70 |
| 26.3 | Toast notifications (kill-feed style) | UX Spec |
| 26.4 | Windows 95 error modals | UX Spec |

---

### Epic 27: History & Track Record
**Priority:** P1 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 27.1 | History view layout | FR51 |
| 27.2 | Career stats summary | FR51 |
| 27.3 | History filtering and sorting | FR51 |
| 27.4 | Trader Progress Dashboard ("Am I getting better?") | FR51 |

---

### Epic 28: EOD & Background Jobs
**Priority:** P1 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 28.1 | EOD snapshot job (4:30 PM ET) | FR57, AR20 |
| 28.2 | S&P 500 daily close fetch | FR58 |
| 28.3 | Hourly pace/trajectory refresh | FR59, AR19 |
| 28.4 | Market condition tags (Bull/Bear/Flat) | FR37 |

---

### Epic 29: Corporate Actions
**Priority:** P1 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 29.1 | Stock split handler | FR62 |
| 29.2 | Symbol change handler | FR63 |
| 29.3 | Delisting handler | FR64 |
| 29.4 | Dividend tracking | FR65 |

---

### Epic 30: Orphan Position Handling
**Priority:** P1 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 30.1 | Orphan detection (Alpaca positions without Shots) | FR66 |
| 30.2 | Orphan import flow | FR67 |
| 30.3 | Orphan notification | FR66, FR67 |

---

### Epic 31: Unit Testing (Vitest)
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 31.1 | Vitest setup with co-located tests | NFR22, AR22 |
| 31.2 | Scoring engine tests (100% coverage) | NFR18 |
| 31.3 | API route tests (80%+ coverage) | NFR19 |

---

### Epic 32: E2E Testing (Playwright)
**Priority:** P0 | **Status:** Not Started

| ID | Story | FR |
|----|-------|-----|
| 32.1 | Playwright setup with CI integration | NFR21, AR23 |
| 32.2 | Critical flow tests (login, Target → Aim → Shot → Close) | NFR21 |
| 32.3 | Scoreboard calculation verification | NFR21 |

---

### Epic 33: Monitoring & Observability
**Priority:** P1 | **Status:** Partial

| ID | Story | FR |
|----|-------|-----|
| 33.1 | Sentry integration (errors + performance) | NFR23 |
| 33.2 | Health endpoint with DB check | NFR25, NFR26 |
| 33.3 | Loki logging integration | NFR24 |

---

## Summary

| Metric | Count |
|--------|-------|
| Total Epics | 33 |
| Total Stories | 107 |
| Average Stories/Epic | 3.2 |
| P0 Epics | 24 |
| P1 Epics | 9 |
| Done | 10 |
| Partial | 8 |
| Not Started | 15 |

---

## Next Steps

Based on status and priority:

1. **Epic 20-22: Scoring Engine** - Core differentiator, 0% done
2. **Epic 31-32: Testing** - Quality gate, 0% done
3. **Epic 13-14: Aim Lifecycle & Pace** - Key UX features, 0% done
4. **Epic 24-25: Leaderboards & Charts** - Engagement drivers, 0% done
