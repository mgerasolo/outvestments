---
stepsCompleted: [1, 2, 3]
updatedAt: '2025-12-31'
version: '1.2'
inputDocuments:
  - prd-outvestments-2025-12-27.md
  - architecture.md
  - ux-design-specification.md
  - pricing-tiers.md
  - target-theory-system-v2.md
terminology:
  - Target: The thesis/theme level prediction (e.g., "AI stocks will surge")
  - Aim: Specific ticker + price + date (e.g., "NVDA +20% by Dec 2025")
  - Shot: The trade/order - exists before AND after execution
  - Trigger: The execution event (Market = immediate, Limit = conditional)
  - Pace: Required rate of gain to hit target (%/month)
  - PPD: Performance Per Day - primary normalized scoring metric
---

# Outvestments - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Outvestments, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentication & User Management**
- FR1: Users can sign in via Authentik SSO (OIDC integration)
- FR2: Users can configure their own Alpaca API credentials (optional)
- FR3: System validates Alpaca connection and shows paper account balance
- FR4: Role-based access: viewer, user, power_user, admin
- FR5: Users can update profile settings (timezone, theme, avatar, display name, currency, colorblind mode)

**Target Management (The Thesis)**
- FR6: Users can create a Target with: thesis (why you believe this), target type, catalyst category, tags, optional broad timeframe
- FR7: Target Types: Stock, Sector, Market, Theme, Event (determines scope of prediction)
- FR8: Targets can be broad (sector/market/theme) or specific (single stock/event)
- FR9: Users can add tags to Targets (open user-created tag system)
- FR10: Targets have status: active, closed, expired
- FR11: Targets can exist independently of Aims (thesis-only, no specific tickers yet)
- FR12: A single Target can have multiple Aims (different tickers/price targets under same thesis)

**Aim Management (Take Aim)**
- FR13: Users can add Aims to a Target with: ticker, target price (realistic), target date
- FR14: Users can add multiple Aims at once (bulk creation from single Target)
- FR15: Users can optionally set a reach target price on an Aim
- FR16: Aims represent specific ticker + price + timeframe predictions (e.g., "NVDA +20% by Dec 2025")
- FR17: Aims have status: active, closed, expired
- FR18: When an Aim's target date passes, user is prompted to: close, liquidate, or rollover
- FR19: Target prices are locked - original target preserved permanently for scoring integrity
- FR20: A single Aim can have multiple Shots (multiple entries toward same price target)
- FR21: Pace calculation: required %/month gain to hit target from current price

**Shot Management (The Trade)**
- FR22: Users can add Shots to an Aim (direction: buy/sell, type: stock/option, entry price, entry date)
- FR23: Users can configure multiple Shots at once (bulk configuration from multiple Aims)
- FR24: For paper trading: users can set position size and trigger type
- FR25: Trigger Types: Market (execute immediately), Limit (execute when price hits)
- FR26: Shot States: Pending → Armed → Fired → Active → Closed
- FR27: Paper trades execute via Alpaca API ("Pull the Trigger")
- FR28: Users can create prediction-only shots (no paper trade, just tracking)
- FR29: Users can close a position - triggers final score calculation
- FR30: Partial closes use lot-based splitting (each lot scored independently)
- FR31: Options shots include: strike price, expiration, premium, contracts, option type (call/put)
- FR32: "Stray shots" = informal term for incomplete data needing cleanup (not a formal entity)

**Scoring System (Three-Tier)**
- FR33: Three-tier scoring: Target Score (thesis correctness) + Aim Score (ticker hit target?) + Shot Score (entry timing)
- FR34: PPD (Performance Per Day) as primary normalized metric for fair comparison across holding periods
- FR35: Accuracy scoring: (Actual Return / Target Return) x 100
- FR36: Performance scoring (Raw): (Your Return / Expected Market Return) x 67
- FR37: Performance scoring (Delta): Uses actual S&P return (SPY proxy) during holding period
- FR38: Difficulty multiplier: 0.5x (<5%), 1.0x (5-15%), 1.5x (15-30%), 2.0x (30-50%), 2.5x (>50%)
- FR39: Composite Shot Score = Accuracy x Difficulty Multiplier
- FR40: Trajectory tracking: visual overlay showing prediction progress vs trend line
- FR41: Trajectory status indicators: On Track, Drifting, Off Course (based on Pace)
- FR42: Pace status bar: visual indicator showing behind/on-pace/ahead of required %/month
- FR43: Runway captured percentage calculated for each Shot

**Views & Visualization**
- FR44: Dashboard Row 1: Daily Gains (30-day bar chart), Account Chart (candlestick/line), Account Stats
- FR45: Dashboard Row 2: 6 Leaderboards sorted by PPD
- FR46: Leaderboard columns: Trending Targets (mine), Top Targets (mine), Top Shots (mine), Worst Shots (mine), Top Users (platform), Top Targets (platform)
- FR47: Active Aims list with trajectory/pace status for each
- FR48: Target detail view with all Aims and aggregate trajectory
- FR49: Aim detail view with all metrics, ticker chart, pace status, Shots listed
- FR50: Shot detail view with entry point marked on chart
- FR51: History view for all closed Aims/Shots (filterable by date, catalyst, tags, performance; sortable)
- FR52: Alpaca Portfolio View: account balance, buying power, positions, pending orders
- FR53: Performance line graph (configurable: 30d, 90d, 1y, all)
- FR54: GitHub-style heatmap for daily performance
- FR55: Delta bar chart (30-day daily changes with $/% toggle)
- FR56: Chart toggles: candlestick/line, trajectory overlay on/off

**Background Jobs**
- FR57: Nightly EOD capture: portfolio snapshots, position updates, score calculations
- FR58: Fetch and cache S&P 500 daily close for Delta Performance calculations
- FR59: Hourly pace/trajectory refresh during market hours

**Manual & Admin Features**
- FR60: Manual trade backfill (power_user/admin only) for historical entries
- FR61: Manually entered trades marked as such in database

**Corporate Actions**
- FR62: Handle stock splits (adjust share count and entry price on Aims/Shots)
- FR63: Handle symbol changes (update ticker across Aims/Shots)
- FR64: Handle delistings (mark Aim, user must close)
- FR65: Dividends tracked as cash balance tied to Shot (factored into ROI)

**Orphaned Position Handling**
- FR66: Detect Alpaca positions without corresponding Shots
- FR67: Users can import orphaned positions into new Aims/Shots or ignore

**Navigation & UX (from UX Spec)**
- FR68: Floating icon sidebar with fly-out menus (desktop)
- FR69: Accordion/bottom nav pattern (mobile)
- FR70: Game-feel animations: tiles slide/drop, numbers animate, celebratory success states
- FR71: No top nav - page titles in content area (avoid SaaS feel)

### NonFunctional Requirements

**Security**
- NFR1: Multi-tenant data isolation from day 1 (row-level by user_id)
- NFR2: AES-256 encryption for Alpaca API keys at rest
- NFR3: API keys decrypted only at time of API call, never logged
- NFR4: Alpaca calls are server-side only (keys never exposed to frontend)
- NFR5: Immutable audit logs for all financial actions (minimum 1 year retention)
- NFR6: Input validation on all user content
- NFR7: XSS protection for thesis text display
- NFR8: Sanitize all user-generated content before storage

**Performance & Caching**
- NFR9: Price data: 20-30 minute update frequency (not real-time)
- NFR10: On-demand caching with 15-30 min TTL
- NFR11: Rate limit outbound calls to respect Alpaca's 200/min limit
- NFR12: Monitor inbound AND outbound API calls
- NFR13: Queue and throttle during high-traffic periods

**Reliability**
- NFR14: Full history retention (no data expiration)
- NFR15: Graceful degradation when Alpaca unavailable (show cached data)
- NFR16: Queue orders for retry if Alpaca unavailable
- NFR17: Clear user notification of sync status

**Testing**
- NFR18: Scoring logic: 100% test coverage (critical)
- NFR19: API routes: 80%+ test coverage
- NFR20: Components: 60%+ test coverage
- NFR21: E2E tests (Playwright) for critical user flows: login/logout, Target/Aim/Shot creation, position close, scoreboard calculations
- NFR22: Unit tests (Vitest) for scoring functions, API handlers, data transformations

**Monitoring & Observability**
- NFR23: Sentry integration for error tracking + performance monitoring
- NFR24: Logging via Loki (AppServices standard)
- NFR25: /api/health endpoint for uptime monitoring
- NFR26: Database connectivity check in health endpoint

**Session & UX**
- NFR27: Default session timeout: 60 minutes
- NFR28: Power users: Extended timeout (configurable)
- NFR29: Desktop-first, mobile-responsive (90% iPhone for mobile concerns)
- NFR30: Colorblind mode with yellow/purple alternatives for red/green

**Deployment**
- NFR31: Docker Compose deployment per AppServices standards
- NFR32: Self-hosted on stark:3154

### Additional Requirements

**From Architecture - Starter/Initialization:**
- AR1: Composite initialization - create-next-app + shadcn init + manual additions (Drizzle, pg-boss, React Query)
- AR2: Next.js 16+ with App Router, TypeScript strict mode
- AR3: shadcn/ui + Tailwind CSS for UI components

**From Architecture - Database & State:**
- AR4: PostgreSQL 16+ for database
- AR5: Drizzle ORM for database access
- AR6: PostgreSQL-based caching (no Redis for MVP)
- AR7: pg-boss for background job processing (PostgreSQL-backed)
- AR8: React Query + Context for client state management

**From Architecture - API Patterns:**
- AR9: Server Actions for all mutations (not tRPC)
- AR10: Route Handlers for webhooks and external endpoints
- AR11: ActionResult<T> pattern for all Server Action returns (never throw)
- AR12: Zod schemas co-located with Server Actions

**From Architecture - Integration:**
- AR13: NextAuth.js 5 with Authentik OIDC provider
- AR14: Alpaca for all market data + trading (single integration)
- AR15: Circuit breaker pattern for Alpaca outbound calls
- AR16: Apache eCharts for all chart visualizations

**From Architecture - Scoring Engine:**
- AR17: Scoring engine as pure function layer (no side effects)
- AR18: Isolated in src/lib/scoring/ for 100% testability
- AR19: Hourly score refresh job (not real-time during market hours)
- AR20: EOD snapshot job runs after market close (4:30 PM ET)

**From Architecture - Project Structure:**
- AR21: Feature-based component organization (features/targets, features/aims, features/shots, features/scores)
- AR22: Unit tests co-located as *.test.ts next to source files
- AR23: E2E tests in /tests/e2e/*.spec.ts

### FR Coverage Map

| Epic | Functional Requirements | Non-Functional | Architecture |
|------|------------------------|----------------|--------------|
| E1: Foundation | - | NFR31-32 | AR1-8 |
| E2: Auth & Users | FR1, FR4-5 | NFR1, NFR5-8, NFR27-28 | AR13 |
| E3: Alpaca Integration | FR2-3, FR52 | NFR2-4, NFR9-17 | AR14-15 |
| E4: Target Management | FR6-12 | - | AR21 |
| E5: Aim Management | FR13-21 | - | AR21 |
| E6: Shot Management | FR22-32, FR60-61 | - | AR9-12, AR21 |
| E7: Scoring Engine | FR33-43 | NFR18 | AR17-20 |
| E8: Dashboard & Viz | FR44-56, FR68-71 | NFR29-30 | AR16 |
| E9: History & Reporting | FR51 | NFR14 | - |
| E10: Background Jobs | FR57-59, FR62-65 | - | AR7, AR19-20 |
| E11: Orphan Handling | FR66-67 | - | - |
| E12: Testing & Quality | - | NFR18-26 | AR22-23 |

---

## Epic List

### Epic 1: Foundation & Infrastructure
**Priority:** P0 | **Dependencies:** None

Set up the core project infrastructure including Next.js application, database, and deployment configuration.

**Stories:**

#### E1-S1: Initialize Next.js Project
**As a** developer, **I want** a properly configured Next.js 16+ project with App Router and TypeScript strict mode **so that** we have a solid foundation for development.

**Acceptance Criteria:**
- [ ] Next.js 16+ with App Router initialized
- [ ] TypeScript strict mode enabled
- [ ] ESLint and Prettier configured
- [ ] Project structure follows AR21 (feature-based organization)

**Requirements:** AR1, AR2

---

#### E1-S2: Configure shadcn/ui and Tailwind
**As a** developer, **I want** shadcn/ui components and Tailwind CSS configured **so that** we can build the game-feel UI efficiently.

**Acceptance Criteria:**
- [ ] shadcn/ui initialized with dark theme default
- [ ] Tailwind CSS configured with custom color palette (green/gold/silver on navy)
- [ ] Base components available (Button, Card, Input, etc.)

**Requirements:** AR3

---

#### E1-S3: Set Up PostgreSQL with Drizzle ORM
**As a** developer, **I want** PostgreSQL database with Drizzle ORM configured **so that** we have type-safe database access.

**Acceptance Criteria:**
- [ ] PostgreSQL 16+ connection configured
- [ ] Drizzle ORM installed and configured
- [ ] Database migrations setup working
- [ ] Connection pooling configured

**Requirements:** AR4, AR5

---

#### E1-S4: Configure pg-boss for Background Jobs
**As a** developer, **I want** pg-boss configured for PostgreSQL-backed job processing **so that** we can run background tasks without Redis.

**Acceptance Criteria:**
- [ ] pg-boss installed and initialized
- [ ] Job queue tables created
- [ ] Basic job scheduling working
- [ ] Job monitoring/status available

**Requirements:** AR7

---

#### E1-S5: Set Up React Query for Client State
**As a** developer, **I want** React Query configured with proper defaults **so that** we have efficient server state management.

**Acceptance Criteria:**
- [ ] React Query provider configured
- [ ] Default stale time and cache settings appropriate for financial data
- [ ] Devtools available in development

**Requirements:** AR8

---

#### E1-S6: Configure Docker Deployment
**As a** developer, **I want** Docker Compose configuration per AppServices standards **so that** we can deploy to stark:3154.

**Acceptance Criteria:**
- [ ] Dockerfile optimized for Next.js
- [ ] docker-compose.yml with app + postgres services
- [ ] Environment variable management
- [ ] Health check endpoint configured

**Requirements:** NFR31, NFR32

---

### Epic 2: Authentication & User Management
**Priority:** P0 | **Dependencies:** E1

Implement user authentication via Authentik SSO and user profile management.

**Stories:**

#### E2-S1: Integrate Authentik SSO via NextAuth.js
**As a** user, **I want** to sign in using my Authentik account **so that** I have secure, centralized authentication.

**Acceptance Criteria:**
- [ ] NextAuth.js 5 configured with Authentik OIDC provider
- [ ] Login/logout flows working
- [ ] Session management with 60-minute default timeout
- [ ] User created in local database on first login

**Requirements:** FR1, AR13, NFR27

---

#### E2-S2: Implement Role-Based Access Control
**As an** admin, **I want** role-based permissions (viewer, user, power_user, admin) **so that** I can control feature access.

**Acceptance Criteria:**
- [ ] Role field in user table
- [ ] Middleware to check role on protected routes
- [ ] Power users get extended session timeout
- [ ] Admin-only routes protected

**Requirements:** FR4, NFR28

---

#### E2-S3: Create User Profile Settings Page
**As a** user, **I want** to update my profile settings **so that** I can customize my experience.

**Acceptance Criteria:**
- [ ] Settings page with sections per UX spec
- [ ] Configurable: timezone, theme (dark/light/system), display name
- [ ] Configurable: currency format, colorblind mode (yellow/purple)
- [ ] Avatar upload (optional)
- [ ] Settings persist to database

**Requirements:** FR5, NFR30

---

#### E2-S4: Implement Audit Logging
**As an** admin, **I want** immutable audit logs for all financial actions **so that** we have a complete history for compliance.

**Acceptance Criteria:**
- [ ] Audit log table with append-only design
- [ ] Logs: user_id, action, entity_type, entity_id, timestamp, details
- [ ] All Target/Aim/Shot mutations logged
- [ ] 1 year minimum retention

**Requirements:** NFR5

---

#### E2-S5: Input Validation and XSS Protection
**As a** developer, **I want** consistent input validation and XSS protection **so that** user content is safe.

**Acceptance Criteria:**
- [ ] Zod schemas for all user inputs
- [ ] HTML sanitization for thesis text
- [ ] XSS protection on display
- [ ] SQL injection prevention via Drizzle

**Requirements:** NFR6, NFR7, NFR8

---

### Epic 3: Alpaca Integration
**Priority:** P0 | **Dependencies:** E2

Integrate with Alpaca Paper Trading API for account connection, portfolio sync, and trade execution.

**Stories:**

#### E3-S1: Alpaca API Key Storage (Encrypted)
**As a** user, **I want** to securely store my Alpaca API keys **so that** the system can trade on my behalf.

**Acceptance Criteria:**
- [ ] API key input form in onboarding/settings
- [ ] AES-256 encryption at rest
- [ ] Keys decrypted only at API call time
- [ ] Keys never logged or exposed to frontend

**Requirements:** FR2, NFR2, NFR3, NFR4

---

#### E3-S2: Alpaca Connection Validation
**As a** user, **I want** the system to validate my Alpaca connection **so that** I know my account is properly linked.

**Acceptance Criteria:**
- [ ] Validate keys against Alpaca API on save
- [ ] Detect Paper vs Live mode (reject Live keys with clear error)
- [ ] Show connection status in settings
- [ ] Display account balance and buying power

**Requirements:** FR3

---

#### E3-S3: Implement Onboarding Flow
**As a** new user, **I want** a guided onboarding flow **so that** I can set up my Alpaca account step-by-step.

**Acceptance Criteria:**
- [ ] Welcome screen with tagline
- [ ] Step 1: Create Alpaca account (external link + screenshot)
- [ ] Step 2: Enable Paper Trading (instructions + screenshot)
- [ ] Step 3: Get and enter API keys
- [ ] Success screen with balance and next steps

**Requirements:** FR2, FR3 (UX Spec Section 11)

---

#### E3-S4: Portfolio Sync and Display
**As a** user, **I want** to see my Alpaca portfolio **so that** I know my account status.

**Acceptance Criteria:**
- [ ] Fetch and display account balance
- [ ] Show buying power
- [ ] List current positions
- [ ] Show pending orders

**Requirements:** FR52

---

#### E3-S5: Implement Circuit Breaker for Alpaca Calls
**As a** developer, **I want** a circuit breaker pattern for Alpaca API calls **so that** we handle outages gracefully.

**Acceptance Criteria:**
- [ ] Circuit breaker with open/half-open/closed states
- [ ] Configurable failure threshold and reset timeout
- [ ] Graceful degradation shows cached data when open
- [ ] Clear user notification of sync status

**Requirements:** AR15, NFR15, NFR17

---

#### E3-S6: Rate Limiting for Outbound Calls
**As a** developer, **I want** rate limiting on Alpaca API calls **so that** we respect their 200/min limit.

**Acceptance Criteria:**
- [ ] Rate limiter tracking calls per minute
- [ ] Queue excess requests
- [ ] Throttle during high-traffic periods
- [ ] Monitor inbound and outbound calls

**Requirements:** NFR11, NFR12, NFR13

---

#### E3-S7: Price Data Caching
**As a** developer, **I want** on-demand price caching **so that** we minimize API calls while keeping data fresh.

**Acceptance Criteria:**
- [ ] Cache prices in PostgreSQL
- [ ] 15-30 minute TTL
- [ ] On-demand fetch (only when requested)
- [ ] Cache invalidation on TTL expiry

**Requirements:** NFR9, NFR10

---

### Epic 4: Target Management
**Priority:** P0 | **Dependencies:** E2

Implement Target (thesis) creation, listing, and management.

**Stories:**

#### E4-S1: Create Target Form
**As a** user, **I want** to create a Target with my investment thesis **so that** I can document my predictions.

**Acceptance Criteria:**
- [ ] Form with: thesis text, target type, catalyst category, tags
- [ ] Target Types: Stock, Sector, Market, Theme, Event
- [ ] Catalyst Categories: Macro, Industry, Company, Other
- [ ] Optional broad timeframe
- [ ] "Lock On" button creates Target

**Requirements:** FR6, FR7

---

#### E4-S2: Target Type Flexibility
**As a** user, **I want** Targets to support broad or specific predictions **so that** I can track any investment thesis.

**Acceptance Criteria:**
- [ ] Stock type = single ticker focus
- [ ] Sector/Market/Theme = broad thesis, multiple tickers
- [ ] Event type = catalyst-driven (earnings, product launch)
- [ ] Target can exist without Aims initially

**Requirements:** FR8, FR11

---

#### E4-S3: Tag System for Targets
**As a** user, **I want** to add tags to my Targets **so that** I can organize and filter them.

**Acceptance Criteria:**
- [ ] Open tag system (user creates tags)
- [ ] Autocomplete from existing tags
- [ ] Multiple tags per Target
- [ ] Tags displayed on Target cards

**Requirements:** FR9

---

#### E4-S4: Target List View
**As a** user, **I want** to see all my Targets **so that** I can track my investment theses.

**Acceptance Criteria:**
- [ ] List/grid view of all Targets
- [ ] Show: thesis summary, type, status, Aim count
- [ ] Filter by: status, type, tags
- [ ] Sort by: created date, performance

**Requirements:** FR10

---

#### E4-S5: Target Detail View
**As a** user, **I want** to see Target details with all Aims **so that** I can track thesis performance.

**Acceptance Criteria:**
- [ ] Display thesis, type, catalyst, tags
- [ ] List all Aims under Target with pace status bars
- [ ] NPC opponent comparison (Target vs S&P aggregate)
- [ ] "Add New Aim" button

**Requirements:** FR12, FR48 (UX Spec Section 12)

---

#### E4-S6: Target Status Management
**As a** user, **I want** to manage Target status **so that** I can track active vs completed theses.

**Acceptance Criteria:**
- [ ] Status: active, closed, expired
- [ ] Manual close with optional notes
- [ ] Auto-expire when all Aims expired (with user prompt)
- [ ] Archive functionality

**Requirements:** FR10

---

#### E4-S7: Advanced Mode - Thesis Risk Documentation

**As a** power user, **I want** to document exit conditions and risks with my Target **so that** I have a plan for when things go wrong.

**Acceptance Criteria:**

- [ ] Toggle: Enable "Advanced Mode" in settings
- [ ] Advanced fields on Target creation:
  - [ ] Stop Loss Thesis: "What would make me exit?" (text)
  - [ ] Warning Signs: specific conditions to watch for
  - [ ] Macro Risks: economic factors that could impact thesis
- [ ] Display warning signs on Aim/Shot detail views
- [ ] Optional: alert when warning sign keywords appear in news (future)
- [ ] Hidden from basic mode users (reduces complexity)

**Requirements:** FR7 (Enhancement)

**Notes:** Encourages traders to think about exit strategy BEFORE entering. "Have a plan and know it."

---

### Epic 5: Aim Management
**Priority:** P0 | **Dependencies:** E4

Implement Aim (specific ticker + price + date prediction) creation and management under Targets.

**Stories:**

#### E5-S1: Add Aim to Target
**As a** user, **I want** to add Aims to my Target **so that** I can make specific predictions.

**Acceptance Criteria:**
- [ ] Ticker search/autocomplete
- [ ] Target price (realistic) input
- [ ] Target date picker
- [ ] Direction: Up/Down
- [ ] Shows current price for reference

**Requirements:** FR13, FR16

---

#### E5-S2: Bulk Aim Creation
**As a** user, **I want** to add multiple Aims at once **so that** I can quickly set up sector plays.

**Acceptance Criteria:**
- [ ] Multi-ticker selection
- [ ] Apply same target % and date to all (with individual override)
- [ ] Preview before confirmation
- [ ] "Confirm Sights" creates all Aims

**Requirements:** FR14

---

#### E5-S3: Reach Target (Optional)
**As a** user, **I want** to set an optional reach target **so that** I can track ambitious predictions.

**Acceptance Criteria:**
- [ ] Optional reach target price field
- [ ] Must be > realistic target for bullish, < for bearish
- [ ] Displayed separately in UI
- [ ] Bonus scoring if reach target hit

**Requirements:** FR15

---

#### E5-S4: Pace Calculation and Display
**As a** user, **I want** to see the required pace to hit my target **so that** I know if I'm on track.

**Acceptance Criteria:**
- [ ] Calculate required %/month from current price to target
- [ ] Display pace on Aim cards
- [ ] Pace status bar: behind (red) / on-pace (white) / ahead (green)
- [ ] Recalculate on price updates

**Requirements:** FR21, FR42 (UX Spec Section 7)

---

#### E5-S5: Aim Detail View
**As a** user, **I want** to see Aim details with chart and Shots **so that** I can track progress.

**Acceptance Criteria:**
- [ ] Ticker chart with trajectory line overlay
- [ ] Current price vs target price
- [ ] Pace status with %/mo indicator
- [ ] List all Shots under this Aim
- [ ] NPC opponent comparison

**Requirements:** FR49

---

#### E5-S6: Aim Expiry Handling
**As a** user, **I want** to be prompted when an Aim expires **so that** I can decide what to do.

**Acceptance Criteria:**
- [ ] Detect when target date passes
- [ ] Prompt options: Close (score as-is), Liquidate (sell positions), Rollover (extend date)
- [ ] Rollover creates new Aim, preserves history
- [ ] Auto-expire if no action after X days

**Requirements:** FR18

---

#### E5-S7: Locked Target Prices
**As a** user, **I want** target prices locked after creation **so that** scoring integrity is preserved.

**Acceptance Criteria:**
- [ ] Target price immutable after Aim creation
- [ ] Original target always visible
- [ ] No editing of target price
- [ ] Rollover creates new Aim with new target

**Requirements:** FR19

---

#### E5-S8: Multiple Shots per Aim
**As a** user, **I want** to add multiple Shots to an Aim **so that** I can scale into positions.

**Acceptance Criteria:**
- [ ] "Add Shot" from Aim detail view
- [ ] Each Shot tracked independently
- [ ] Aggregate performance shown at Aim level
- [ ] Individual Shot scores roll up

**Requirements:** FR20

---

#### E5-S9: Target Hit Early Notification

**As a** user, **I want** to be notified when my Aim hits target price early **so that** I can decide whether to exit.

**Acceptance Criteria:**

- [ ] Detect when current price reaches/exceeds target price
- [ ] Trigger notification: "You hit your target 3 months early!"
- [ ] Prompt: "Was your target based on time or price?"
- [ ] Options: Take Profit / Raise Target / Keep Holding
- [ ] If Take Profit: quick-close flow
- [ ] If Raise Target: create new Aim with higher target
- [ ] Track "early hits" as a positive pattern indicator

**Requirements:** FR21 (Enhancement)

**Notes:** Helps users realize when they've achieved their goal. Many traders hold past their target and give back gains.

---

### Epic 6: Shot Management
**Priority:** P0 | **Dependencies:** E3, E5

Implement Shot (trade/order) configuration, execution, and lifecycle management.

**Stories:**

#### E6-S1: Configure Shot Details
**As a** user, **I want** to configure Shot details **so that** I can set up my trade.

**Acceptance Criteria:**
- [ ] Direction: Buy/Sell
- [ ] Type: Stock (MVP), Option (P1)
- [ ] Amount ($ or shares)
- [ ] Shows estimated quantity
- [ ] Shows buying power

**Requirements:** FR22, FR24

---

#### E6-S2: Trigger Type Selection
**As a** user, **I want** to choose between Market and Limit triggers **so that** I control execution.

**Acceptance Criteria:**
- [ ] Market: "Pull the Trigger" - execute immediately
- [ ] Limit: "Set Your Trigger @ $X" - execute when price hits
- [ ] Limit requires trigger price input
- [ ] Clear messaging about each type

**Requirements:** FR25

---

#### E6-S3: Shot State Machine
**As a** developer, **I want** a proper state machine for Shots **so that** we track the full lifecycle.

**Acceptance Criteria:**
- [ ] States: Pending → Armed → Fired → Active → Closed
- [ ] Pending: configured, not submitted
- [ ] Armed: limit order placed, waiting
- [ ] Fired: market executed / limit filled
- [ ] Active: position held
- [ ] Closed: exited, scored

**Requirements:** FR26

---

#### E6-S4: Execute Paper Trade via Alpaca
**As a** user, **I want** my Shot to execute via Alpaca **so that** I have a real paper position.

**Acceptance Criteria:**
- [ ] Submit order to Alpaca API
- [ ] Handle market/limit order types
- [ ] Update Shot state on fill confirmation
- [ ] Store fill price and timestamp
- [ ] Handle partial fills

**Requirements:** FR27

---

#### E6-S5: Bulk Shot Configuration
**As a** user, **I want** to configure multiple Shots at once **so that** I can execute multi-leg strategies.

**Acceptance Criteria:**
- [ ] Select multiple Aims
- [ ] Configure amount per ticker
- [ ] Choose trigger type per Shot
- [ ] Review before execution
- [ ] "Pull the Trigger" executes all

**Requirements:** FR23

---

#### E6-S6: Prediction-Only Shots
**As a** user, **I want** to create prediction-only Shots **so that** I can track without paper trading.

**Acceptance Criteria:**
- [ ] Toggle: "Track only (no paper trade)"
- [ ] Records entry price at creation time
- [ ] No Alpaca order submitted
- [ ] Still scores based on price movement

**Requirements:** FR28

---

#### E6-S7: Close Position Flow
**As a** user, **I want** to close my position **so that** I can lock in my score.

**Acceptance Criteria:**
- [ ] Close button on active Shots
- [ ] Choose: Close All / Close Partial
- [ ] Choose trigger: Market / Limit
- [ ] Preview final score before confirmation
- [ ] Submit sell order to Alpaca
- [ ] Update Shot state to Closed

**Requirements:** FR29 (UX Spec Section 13)

---

#### E6-S8: Partial Close with Lot Splitting
**As a** user, **I want** to partially close positions **so that** I can take profits while staying in.

**Acceptance Criteria:**
- [ ] Specify shares to close
- [ ] Original Shot splits into: closed portion + remaining
- [ ] Each lot has unique ID (dot notation: 1.1, 1.2)
- [ ] Each lot scored independently
- [ ] Parent-child relationship preserved

**Requirements:** FR30

---

#### E6-S9: Shot Detail View
**As a** user, **I want** to see Shot details **so that** I can track my position.

**Acceptance Criteria:**
- [ ] Entry price, current price, shares
- [ ] Unrealized P/L
- [ ] Days held, PPD
- [ ] NPC opponent comparison (vs S&P for same period)
- [ ] Chart with entry point marked
- [ ] Trajectory and pace status

**Requirements:** FR50 (UX Spec Section 13)

---

#### E6-S10: Options Shot Support (P1)
**As a** user, **I want** to trade options **so that** I can leverage my predictions.

**Acceptance Criteria:**
- [ ] Option type: Call/Put
- [ ] Strike price input
- [ ] Expiration date
- [ ] Premium and contracts
- [ ] Same scoring rubric as stocks

**Requirements:** FR31

---

#### E6-S11: Manual Trade Backfill (Admin)
**As a** power user, **I want** to backfill historical trades **so that** I can import my track record.

**Acceptance Criteria:**
- [ ] Admin/power_user only
- [ ] Specify historical entry date/price
- [ ] Marked as "manually entered" in DB
- [ ] Separate display in UI
- [ ] Full audit trail

**Requirements:** FR60, FR61

---

### Epic 7: Scoring Engine ✅ COMPLETE
**Priority:** P0 | **Dependencies:** E6 | **Completed:** 2025-12-30

Implement the **four-level hierarchical scoring system** as a pure function layer.

**Implementation Summary:**
- 4 levels: User → Target → Aim (PRIMARY) → Shot
- Centered scale: -50 to +50 (0 = market baseline)
- Letter grades: FFF → AAA (16 tiers)
- Database tables: `aim_scores`, `shot_scores`, `target_scores`, `user_career_scores`
- Automatic cascade on close: Shot/Aim close → Target recalc → User recalc

**Stories:**

#### E7-S1: Scoring Engine Architecture ✅
**As a** developer, **I want** a pure function scoring engine **so that** calculations are testable and predictable.

**Acceptance Criteria:**
- [x] Isolated in `src/lib/scoring/`
- [x] Pure functions, no side effects
- [x] All inputs passed explicitly
- [ ] 100% unit test coverage (pending)

**Files Created:**
- `src/lib/scoring/types.ts` — TypeScript interfaces
- `src/lib/scoring/constants.ts` — Weights, grade mappings
- `src/lib/scoring/grade-mapper.ts` — Score → letter grade
- `src/lib/scoring/interpolators.ts` — Smooth interpolation
- `src/lib/scoring/risk-assessor.ts` — Risk plan scoring
- `src/lib/scoring/aim-scorer.ts` — Aim calculations
- `src/lib/scoring/shot-scorer.ts` — Shot calculations
- `src/lib/scoring/target-scorer.ts` — Target aggregation
- `src/lib/scoring/user-scorer.ts` — Career rollups
- `src/lib/scoring/index.ts` — Module exports

**Requirements:** AR17, AR18, NFR18

---

#### E7-S2: Time-Normalized Returns (PPD/PPM/PPY) ✅
**As a** user, **I want** time-normalized returns **so that** I can compare across holding periods.

**Acceptance Criteria:**
- [x] PPD = Total Return % / Days Held
- [x] PPM = PPD × 30, PPY = PPD × 365
- [x] Calculate for each Shot, Aim, and Target
- [x] Stored in database for all levels

**Requirements:** FR34

---

#### E7-S3: Aim-Level Scoring (PRIMARY) ✅
**As a** user, **I want** aim scores with 4 weighted metrics **so that** I know prediction quality.

**Acceptance Criteria:**
- [x] Directional Accuracy (20%) — Did price move in predicted direction?
- [x] Magnitude Accuracy (30%) — How close to target price?
- [x] Forecast Edge (35%) — Your return vs market
- [x] Thesis Validity (15%) — Was reasoning sound? (capped at 0 if no risks)
- [x] Final score = weighted average (stays on -50 to +50 scale)
- [x] Difficulty displayed independently (1.0× to 5.0×)

**Requirements:** FR35

---

#### E7-S4: Shot-Level Scoring ✅
**As a** user, **I want** shot scores with execution metrics **so that** I know trade quality.

**Acceptance Criteria:**
- [x] Performance Score (45%) — Actual vs expected market return
- [x] Forecast Edge (35%) — Your return vs actual market
- [x] Perfect Shot Capture (20%) — Peak-to-entry runway captured
- [x] Risk Multiplier (0.70× to 1.10×) — Based on plan quality + execution
- [x] Adaptability Bonus (Pro only) — ±5 points

**Requirements:** FR36, FR37

---

#### E7-S5: Target-Level Aggregation ✅
**As a** user, **I want** target scores with P&L summary **so that** I see thesis performance.

**Acceptance Criteria:**
- [x] Prediction Score — Weighted mean of Aim scores
- [x] Performance Score — Weighted mean of Shot scores
- [x] Total P&L ($ and %)
- [x] Win Ratio — Winning aims / Total aims
- [x] Alpha vs Market — Your return - SPY return

**Requirements:** FR33

---

#### E7-S6: User Career Scoring ✅
**As a** user, **I want** two career scores **so that** I see overall skill.

**Acceptance Criteria:**
- [x] Prediction Quality Score — From target prediction scores
- [x] Execution Performance Score — From target performance scores
- [x] Total aims and shots scored
- [x] Total career P&L

**Requirements:** FR39

---

#### E7-S7: Letter Grade System ✅
**As a** user, **I want** letter grades (FFF to AAA) **so that** scores are intuitive.

**Acceptance Criteria:**
- [x] 16-tier scale from FFF (-50) to AAA (+50)
- [x] C grade = 0 = market baseline
- [x] Positive grades = outperformed market
- [x] Displayed alongside numeric score

**Requirements:** FR38

---

#### E7-S8: Scoring Triggers ✅
**As a** developer, **I want** automatic score calculation on close **so that** scores stay current.

**Acceptance Criteria:**
- [x] Shot close triggers `calculateAndStoreShotScore()`
- [x] Aim close triggers `calculateAndStoreAimScore()`
- [x] Cascades to target and user career scores
- [x] Non-blocking (errors don't fail the close)

**Files Modified:**
- `src/app/actions/shots.ts` — Added scoring trigger
- `src/app/actions/aims.ts` — Added scoring trigger

**Requirements:** FR33

---

#### E7-S9: Trajectory Tracking
**As a** user, **I want** trajectory visualization **so that** I can see my progress toward target.

**Acceptance Criteria:**
- [ ] Calculate expected price path (linear interpolation)
- [ ] Overlay on price chart
- [ ] Fanning zones expand over time
- [ ] Show current position relative to trajectory

**Requirements:** FR40

---

#### E7-S10: Trajectory Status Indicators
**As a** user, **I want** trajectory status labels **so that** I quickly know if I'm on track.

**Acceptance Criteria:**
- [ ] On Track: within acceptable deviation
- [ ] Drifting: moderate deviation from trajectory
- [ ] Off Course: significant deviation
- [ ] Based on pace comparison

**Requirements:** FR41

---

#### E7-S11: Runway Captured Percentage
**As a** user, **I want** to see runway captured **so that** I know what % of the move I caught.

**Acceptance Criteria:**
- [ ] Calculate: (Your Entry to Exit) / (Low to High in period)
- [ ] Display as percentage
- [ ] Separate from accuracy (which is vs target)

**Requirements:** FR43

---

#### E7-S12: Market Condition Tags

**As a** user, **I want** my trades tagged with market conditions **so that** I can see performance in context.

**Acceptance Criteria:**

- [ ] Tag each Shot with market condition at entry: Bull / Bear / Flat
- [ ] Bull = S&P up >10% annualized in period
- [ ] Bear = S&P down >10% annualized in period
- [ ] Flat = between -10% and +10%
- [ ] Visual iconography for each condition
- [ ] Filter history by market condition
- [ ] Context shown: "You made 15% in a bull market where S&P made 20%"

**Requirements:** FR37 (Enhancement)

**Notes:** Addresses "anybody does well in a good market" - performance means different things in different conditions.

---

### Epic 8: Dashboard & Visualizations
**Priority:** P0 | **Dependencies:** E7

Implement the main dashboard, charts, leaderboards, and game-feel UI.

**Stories:**

#### E8-S1: Dashboard Layout - Row 1
**As a** user, **I want** to see my performance overview **so that** I know how I'm doing.

**Acceptance Criteria:**
- [ ] 3-column layout
- [ ] Column 1: Daily Gains (30-day bar chart, $/% toggle)
- [ ] Column 2: Account Chart (candlestick/line toggle)
- [ ] Column 3: Account Stats (value, buying power, day change)

**Requirements:** FR44

---

#### E8-S2: Dashboard Layout - Row 2 Leaderboards
**As a** user, **I want** to see leaderboards **so that** I can track my best/worst performance.

**Acceptance Criteria:**
- [ ] 6-column layout
- [ ] My Targets: Trending, Top
- [ ] My Shots: Top, Worst
- [ ] Platform: Top Users, Top Targets
- [ ] All sorted by PPD

**Requirements:** FR45, FR46

---

#### E8-S3: Active Aims Widget
**As a** user, **I want** to see my active Aims **so that** I can monitor positions.

**Acceptance Criteria:**
- [ ] List of active Aims
- [ ] Each shows: ticker, target, pace status bar
- [ ] Click to navigate to Aim detail
- [ ] Filter by Target

**Requirements:** FR47

---

#### E8-S4: Floating Sidebar Navigation
**As a** user, **I want** a game-style floating sidebar **so that** navigation feels immersive.

**Acceptance Criteria:**
- [ ] Icons float on left edge
- [ ] Hover triggers fly-out menu
- [ ] Menu items: Dashboard, Targets, Shots, History
- [ ] Settings + Profile at bottom
- [ ] Animated transitions

**Requirements:** FR68, FR71

---

#### E8-S5: Mobile Navigation
**As a** mobile user, **I want** accordion/bottom nav **so that** I can navigate on small screens.

**Acceptance Criteria:**
- [ ] Bottom nav with same icons
- [ ] Accordion pattern for dashboard sections
- [ ] Gesture support (optional)
- [ ] Responsive breakpoints

**Requirements:** FR69, NFR29

---

#### E8-S6: Chart Integration with eCharts
**As a** user, **I want** beautiful charts **so that** data visualization is clear.

**Acceptance Criteria:**
- [ ] Apache eCharts integrated
- [ ] Bar chart for daily gains
- [ ] Candlestick chart for account history
- [ ] Line chart alternative
- [ ] Trajectory overlay option

**Requirements:** AR16, FR53, FR55, FR56

---

#### E8-S7: GitHub-Style Heatmap
**As a** user, **I want** a GitHub-style heatmap **so that** I can see daily performance patterns.

**Acceptance Criteria:**
- [ ] Calendar grid layout
- [ ] Color intensity = performance
- [ ] Green = positive, Red = negative
- [ ] Hover shows daily stats

**Requirements:** FR54

---

#### E8-S8: NPC Opponent Comparison Display
**As a** user, **I want** to see myself vs NPC opponents **so that** I understand opportunity cost.

**Acceptance Criteria:**
- [ ] Street Fighter style left-right layout
- [ ] Your performance on left
- [ ] NPC (S&P, etc.) on right
- [ ] Clear winner messaging in center
- [ ] Available at Shot, Aim, Target levels

**Requirements:** UX Spec Section 14

---

#### E8-S9: Game-Feel Animations
**As a** user, **I want** game-style animations **so that** the app feels engaging.

**Acceptance Criteria:**
- [ ] Tiles slide/drop in on page load
- [ ] Numbers animate/count up
- [ ] Panels slide on tab switch
- [ ] Success states have confetti/celebration
- [ ] Configurable intensity (Settings)

**Requirements:** FR70

---

#### E8-S10: Toast Notification System
**As a** user, **I want** game-style toast notifications **so that** I know when things happen.

**Acceptance Criteria:**
- [ ] Success: slide in with glow
- [ ] Order Filled: slam with screen shake
- [ ] Target Hit: explosion effect
- [ ] Kill-feed style stacking for rapid updates
- [ ] Sound effects (optional)

**Requirements:** UX Spec Section 15

---

#### E8-S11: Windows 95 Error Modals
**As a** user, **I want** retro error modals **so that** errors are memorable and less frustrating.

**Acceptance Criteria:**
- [ ] Windows 95 beveled border style
- [ ] Blue title bar
- [ ] Personality in error messages
- [ ] Helpful recovery suggestions
- [ ] BSOD easter egg for critical errors

**Requirements:** UX Spec Section 16

---

#### E8-S12: Empty States
**As a** user, **I want** encouraging empty states **so that** I'm motivated to take action.

**Acceptance Criteria:**
- [ ] No Targets: "No targets in your sights" + inspiration
- [ ] No Aims: "You have a target, but no sights"
- [ ] No Shots: "Ready, aim... no shots fired"
- [ ] No History: "No history yet"
- [ ] Each has relevant CTA

**Requirements:** UX Spec Section 17

---

#### E8-S13: Colorblind Mode
**As a** colorblind user, **I want** alternative colors **so that** I can use the app effectively.

**Acceptance Criteria:**
- [ ] Toggle in Settings
- [ ] Yellow replaces Green (gains)
- [ ] Purple replaces Red (losses)
- [ ] Applied throughout UI

**Requirements:** NFR30

---

### Epic 9: History & Reporting
**Priority:** P1 | **Dependencies:** E7

Implement history view for closed positions and track record analysis.

**Stories:**

#### E9-S1: History View Layout
**As a** user, **I want** a history view **so that** I can see my track record.

**Acceptance Criteria:**
- [ ] Career stats summary at top
- [ ] Performance over time chart
- [ ] List of closed Shots
- [ ] List of closed Targets

**Requirements:** FR51 (UX Spec Section 19)

---

#### E9-S2: Career Stats Summary
**As a** user, **I want** to see career statistics **so that** I know my overall performance.

**Acceptance Criteria:**
- [ ] Total Targets created
- [ ] Total Aims tracked
- [ ] Total Shots closed
- [ ] Win rate percentage
- [ ] Alpha vs S&P

**Requirements:** FR51

---

#### E9-S3: History Filtering
**As a** user, **I want** to filter my history **so that** I can analyze specific periods or types.

**Acceptance Criteria:**
- [ ] Filter by date range
- [ ] Filter by Target/catalyst
- [ ] Filter by tags
- [ ] Filter by performance (winners/losers)
- [ ] Sort options

**Requirements:** FR51

---

#### E9-S4: Closed Shot Cards
**As a** user, **I want** to see closed Shot details **so that** I can review past trades.

**Acceptance Criteria:**
- [ ] Show: ticker, shares, hold period
- [ ] Your return vs S&P return
- [ ] Win/loss indicator
- [ ] Link to parent Target
- [ ] Score breakdown

**Requirements:** FR51

---

#### E9-S5: Closed Target Summary
**As a** user, **I want** to see closed Target summaries **so that** I can evaluate thesis performance.

**Acceptance Criteria:**
- [ ] Thesis proven/disproven indicator
- [ ] Aim and Shot counts
- [ ] Aggregate performance vs S&P
- [ ] Total alpha generated
- [ ] Target grade

**Requirements:** FR51

---

#### E9-S6: Trader Progress Dashboard ("Am I Getting Better?")

**As a** user, **I want** to see my progress as a trader over time **so that** I know if I'm improving or regressing.

**Acceptance Criteria:**

- [ ] Win/Loss Metrics: win count, win value ($), loss count, loss value ($)
- [ ] Pattern over time chart: performance by month/quarter
- [ ] Trend line: improving or declining?
- [ ] Benchmark comparison: your trend vs market trend
- [ ] "Your biggest lesson" callout: largest loss with thesis reflection
- [ ] Rolling performance windows (30d, 90d, 1yr)
- [ ] Clear answer to: "Are you becoming a better trader?"

**Requirements:** FR51 (Enhancement)

**Notes:** This is a central feature, not just a widget. The question "Am I getting better or worse as a trader?" should be prominently answered.

---

### Epic 10: Background Jobs
**Priority:** P1 | **Dependencies:** E3, E7

Implement scheduled jobs for EOD snapshots, price updates, and corporate actions.

**Stories:**

#### E10-S1: EOD Snapshot Job
**As a** developer, **I want** nightly EOD snapshots **so that** we capture daily performance.

**Acceptance Criteria:**
- [ ] Runs after market close (4:30 PM ET)
- [ ] Captures portfolio value for all users
- [ ] Updates position values
- [ ] Stores daily snapshot in history table

**Requirements:** FR57, AR20

---

#### E10-S2: S&P 500 Daily Close Fetch
**As a** developer, **I want** to fetch S&P daily close **so that** we can calculate Delta Performance.

**Acceptance Criteria:**
- [ ] Fetch SPY close price daily
- [ ] Store in reference table
- [ ] Handle weekends/holidays
- [ ] Used for all Delta calculations

**Requirements:** FR58

---

#### E10-S3: Hourly Pace/Trajectory Refresh
**As a** developer, **I want** hourly updates during market hours **so that** pace status stays current.

**Acceptance Criteria:**
- [ ] Runs hourly 9:30 AM - 4 PM ET
- [ ] Fetch current prices for active Aims
- [ ] Recalculate pace status
- [ ] Update trajectory indicators

**Requirements:** FR59, AR19

---

#### E10-S4: Stock Split Handler
**As a** developer, **I want** to handle stock splits **so that** data stays accurate.

**Acceptance Criteria:**
- [ ] Detect splits via Alpaca/data provider
- [ ] Adjust share counts on affected Shots
- [ ] Adjust entry prices proportionally
- [ ] Log adjustment in audit trail

**Requirements:** FR62

---

#### E10-S5: Symbol Change Handler
**As a** developer, **I want** to handle symbol changes **so that** tickers stay current.

**Acceptance Criteria:**
- [ ] Detect symbol changes
- [ ] Update ticker on affected Aims/Shots
- [ ] Preserve history under old symbol
- [ ] Notify user of change

**Requirements:** FR63

---

#### E10-S6: Delisting Handler
**As a** developer, **I want** to handle delistings **so that** users can close affected positions.

**Acceptance Criteria:**
- [ ] Detect delisting events
- [ ] Mark Aim as "delisted"
- [ ] Notify user to close position
- [ ] Allow manual close with final price

**Requirements:** FR64

---

#### E10-S7: Dividend Tracking
**As a** developer, **I want** to track dividends **so that** ROI calculations are accurate.

**Acceptance Criteria:**
- [ ] Detect dividend payments
- [ ] Record cash amount tied to Shot
- [ ] Factor into ROI calculation
- [ ] Non-reinvestable (cash balance)

**Requirements:** FR65

---

#### E10-S8: Black Swan / Unicorn Event Tracking

**As a** user, **I want** major market events flagged on my trades **so that** I understand performance in context of extraordinary circumstances.

**Acceptance Criteria:**

- [ ] Maintain list of "unicorn events" (admin-managed)
  - Examples: COVID crash (Mar 2020), Trump tariffs (Dec 2024), Flash crashes
- [ ] Tag affected date ranges
- [ ] Visual unicorn icon on trades during these periods
- [ ] Filter history by "unicorn-affected" trades
- [ ] Performance split: normal conditions vs unicorn events
- [ ] Context messaging: "Your thesis was correct but COVID happened"
- [ ] Optional: user can propose events for admin review

**Requirements:** FR37 (Enhancement)

**Notes:** No matter how good your thesis, black swan events override everything. Traders shouldn't be penalized (or credited) for unforeseeable macro events.

---

### Epic 11: Orphan Position Handling
**Priority:** P1 | **Dependencies:** E3, E6

Detect and handle Alpaca positions that don't have corresponding Shots in Outvestments.

**Stories:**

#### E11-S1: Orphan Detection
**As a** developer, **I want** to detect orphaned positions **so that** we can notify users.

**Acceptance Criteria:**
- [ ] Compare Alpaca positions vs local Shots
- [ ] Identify positions with no Shot record
- [ ] Run on portfolio sync
- [ ] Flag orphans in database

**Requirements:** FR66

---

#### E11-S2: Orphan Import Flow
**As a** user, **I want** to import orphaned positions **so that** I can track them.

**Acceptance Criteria:**
- [ ] Show orphan notification/badge
- [ ] List orphaned positions
- [ ] Option: Import into new Aim/Shot
- [ ] Option: Ignore (hide from view)
- [ ] Creates prediction-only Shot if imported

**Requirements:** FR67

---

#### E11-S3: Orphan Notification
**As a** user, **I want** to be notified of orphans **so that** I can decide what to do.

**Acceptance Criteria:**
- [ ] Toast notification on detection
- [ ] Badge on Settings/Portfolio
- [ ] Clear count of orphaned positions
- [ ] Link to import flow

**Requirements:** FR66, FR67

---

### Epic 12: Testing & Quality
**Priority:** P0 | **Dependencies:** All

Implement comprehensive testing and monitoring infrastructure.

**Stories:**

#### E12-S1: Unit Test Setup (Vitest)
**As a** developer, **I want** Vitest configured **so that** we can write unit tests.

**Acceptance Criteria:**
- [ ] Vitest installed and configured
- [ ] Co-located test pattern (*.test.ts)
- [ ] Coverage reporting enabled
- [ ] Watch mode for development

**Requirements:** NFR22, AR22

---

#### E12-S2: Scoring Engine Tests (100%)
**As a** developer, **I want** 100% test coverage on scoring **so that** calculations are reliable.

**Acceptance Criteria:**
- [ ] Test PPD calculation
- [ ] Test accuracy scoring
- [ ] Test performance scoring (raw + delta)
- [ ] Test difficulty multipliers
- [ ] Test composite score
- [ ] Test edge cases (negative, zero, extreme)

**Requirements:** NFR18

---

#### E12-S3: API Route Tests (80%+)
**As a** developer, **I want** API route tests **so that** endpoints are reliable.

**Acceptance Criteria:**
- [ ] Test all Server Actions
- [ ] Test Route Handlers
- [ ] Test error cases
- [ ] Test authorization
- [ ] 80%+ coverage

**Requirements:** NFR19

---

#### E12-S4: E2E Test Setup (Playwright)
**As a** developer, **I want** Playwright configured **so that** we can write E2E tests.

**Acceptance Criteria:**
- [ ] Playwright installed
- [ ] Tests in /tests/e2e/*.spec.ts
- [ ] CI integration
- [ ] Screenshot on failure

**Requirements:** NFR21, AR23

---

#### E12-S5: Critical User Flow E2E Tests
**As a** developer, **I want** E2E tests for critical flows **so that** regressions are caught.

**Acceptance Criteria:**
- [ ] Login/logout flow
- [ ] Target creation → Aim → Shot → Close
- [ ] Scoreboard calculations verified
- [ ] Settings changes persist

**Requirements:** NFR21

---

#### E12-S6: Sentry Integration
**As a** developer, **I want** Sentry error tracking **so that** we catch production issues.

**Acceptance Criteria:**
- [ ] Sentry SDK installed
- [ ] Error tracking for frontend + API
- [ ] Performance monitoring
- [ ] Source maps uploaded

**Requirements:** NFR23

---

#### E12-S7: Health Endpoint
**As a** developer, **I want** a health check endpoint **so that** uptime can be monitored.

**Acceptance Criteria:**
- [ ] /api/health endpoint
- [ ] Returns 200 when healthy
- [ ] Checks database connectivity
- [ ] Returns status details

**Requirements:** NFR25, NFR26

---

#### E12-S8: Loki Logging Integration
**As a** developer, **I want** logs shipped to Loki **so that** we can debug issues.

**Acceptance Criteria:**
- [ ] Structured JSON logging
- [ ] Promtail configured for log shipping
- [ ] Logs viewable in Grafana
- [ ] Filter by app="outvestments"

**Requirements:** NFR24

---

### Epic 13: User Tier System (Phase 2A)
**Priority:** P2 | **Dependencies:** E2
**Phase:** 2A - Monetization Foundation

Implement the user tier system with Free, Premium, and Premium Plus levels.

**Stories:**

#### E13-S1: Add Tier Fields to Users Table
**As a** developer, **I want** tier-related fields on the users table **so that** we can track user subscription status.

**Acceptance Criteria:**
- [ ] tier ENUM('free', 'premium', 'premium_plus') with default 'free'
- [ ] tier_source ENUM tracking how tier was acquired
- [ ] tier_expires_at, trial_started_at, trial_ends_at timestamps
- [ ] referral_code unique per user (auto-generated)
- [ ] referred_by_user_id foreign key
- [ ] stripe_customer_id for payment integration

**Requirements:** PRD Section 9

---

#### E13-S2: Implement Tier Resolution Logic
**As a** developer, **I want** tier resolution following priority order **so that** users get correct access.

**Acceptance Criteria:**
- [ ] Resolution order: global_override > admin > subscription > promo > trial > free
- [ ] getCurrentTier() utility function
- [ ] Tier changes logged to audit table
- [ ] Expiration check on each request

**Requirements:** PRD Section 9

---

#### E13-S3: Create Global Config System
**As an** admin, **I want** global configuration overrides **so that** we can run promotions like "everyone gets Premium this week."

**Acceptance Criteria:**
- [ ] global_config key-value table
- [ ] tier_override key for global tier grant
- [ ] tier_override_expires for automatic rollback
- [ ] default_trial_days and default_trial_tier configs
- [ ] Admin UI to manage global config

**Requirements:** PRD Section 9

---

#### E13-S4: Implement Feature Flags Per Tier
**As a** developer, **I want** feature flags tied to tiers **so that** we can gate features appropriately.

**Acceptance Criteria:**
- [ ] tier_features table mapping features to tiers
- [ ] hasFeature(userId, featureName) utility
- [ ] Feature list: full_scoring, live_grading, per_shot_metrics, monitor_aims, ai_suggestions, ai_coaching, benchmarks, exports
- [ ] UI components respect feature flags (show locked state)

**Requirements:** PRD Section 9

---

### Epic 14: Promo & Trial System (Phase 2B)
**Priority:** P2 | **Dependencies:** E13
**Phase:** 2B - Acquisition Tools

Implement promotional codes and trial system for user acquisition.

**Stories:**

#### E14-S1: Create Promo Code Management
**As an** admin, **I want** to create and manage promo codes **so that** we can run promotions.

**Acceptance Criteria:**
- [ ] promo_codes table with all code types (tier_grant, trial_extension, percent_off, etc.)
- [ ] Code constraints: valid_from, valid_until, max_uses, max_uses_per_user
- [ ] new_users_only and min_tier flags
- [ ] Admin UI for code creation/management

**Requirements:** PRD Section 9

---

#### E14-S2: Implement Promo Code Redemption
**As a** user, **I want** to redeem promo codes **so that** I can get discounts or extended trials.

**Acceptance Criteria:**
- [ ] Promo code entry field in settings/signup
- [ ] Validation against all constraints
- [ ] promo_redemptions tracking table
- [ ] Tier upgrade applied immediately
- [ ] Success/error feedback to user

**Requirements:** PRD Section 9

---

#### E14-S3: Implement Trial System
**As a** new user, **I want** a free trial of Premium **so that** I can experience full features before paying.

**Acceptance Criteria:**
- [ ] Default 14-day Premium trial for new signups
- [ ] Trial countdown visible in UI
- [ ] Email notifications at 3 days remaining
- [ ] Automatic downgrade to Free when trial expires
- [ ] Trial extension via promo codes

**Requirements:** PRD Section 9

---

### Epic 15: Referral System (Phase 2C)
**Priority:** P2 | **Dependencies:** E14
**Phase:** 2C - Viral Growth

Implement referral tracking and rewards.

**Stories:**

#### E15-S1: Generate User Referral Codes
**As a** user, **I want** a unique referral code **so that** I can invite friends.

**Acceptance Criteria:**
- [ ] Auto-generated code on signup (e.g., MATT7X2K)
- [ ] One-time vanity code customization
- [ ] Shareable link: outvestments.com/r/CODE
- [ ] Copy-to-clipboard functionality
- [ ] Referral code visible in settings

**Requirements:** PRD Section 9

---

#### E15-S2: Track Referral Signups
**As a** referrer, **I want** to see who signed up with my code **so that** I can track my referrals.

**Acceptance Criteria:**
- [ ] referrals table tracking referrer/referee
- [ ] Capture referral code during signup
- [ ] user_acquisition table for UTM/source tracking
- [ ] Referral dashboard showing count and status

**Requirements:** PRD Section 9

---

#### E15-S3: Implement Referral Rewards
**As a** referrer, **I want** rewards when my referrals convert **so that** I'm incentivized to share.

**Acceptance Criteria:**
- [ ] Referee gets: 14-day Premium trial (vs standard)
- [ ] Referrer gets: 1 free month when referee converts to paid
- [ ] Bonus month if referee stays 3+ months
- [ ] reward_granted_at tracking
- [ ] Notification when rewards earned

**Requirements:** PRD Section 9

---

### Epic 16: Trading Discipline Features (Phase 2)
**Priority:** P1 | **Dependencies:** E4, E5, E6
**Phase:** 2 - Core Enhancement

Add conviction levels, monitor aims, and shot risk parameters.

**Stories:**

#### E16-S1: Add Conviction Level to Targets
**As a** trader, **I want** to mark my conviction level on targets **so that** I can distinguish exploratory ideas from high-conviction calls.

**Acceptance Criteria:**
- [ ] conviction_level ENUM('high', 'medium', 'low') on targets table
- [ ] Default to 'medium'
- [ ] UI selector during target creation
- [ ] conviction_updated_at timestamp
- [ ] Filter targets by conviction level

**Requirements:** PRD Section 3.1

---

#### E16-S2: Add Abort Triggers to Targets
**As a** trader, **I want** to document abort triggers **so that** I have clear exit criteria.

**Acceptance Criteria:**
- [ ] abort_trigger text field on targets
- [ ] abort_triggered boolean flag
- [ ] abort_triggered_at timestamp
- [ ] risks_identified text array field
- [ ] UI prompts to encourage risk documentation

**Requirements:** PRD Section 3.1

---

#### E16-S3: Implement Monitor Aims
**As a** trader, **I want** monitor-only aims **so that** I can track related assets without capital commitment.

**Acceptance Criteria:**
- [ ] aim_type ENUM('playable', 'monitor') on aims table
- [ ] Monitor aims cannot have shots
- [ ] Monitor aims excluded from scoring/leaderboards
- [ ] monitor_entry_price, monitor_outcome fields
- [ ] ai_suggested boolean for AI-suggested monitors
- [ ] UI clearly distinguishes monitor vs playable

**Requirements:** PRD Section 3.3

---

#### E16-S4: Add Shot Risk Parameters
**As a** trader, **I want** to document stop loss and profit targets **so that** I trade with discipline.

**Acceptance Criteria:**
- [ ] stop_loss_price, stop_loss_percent on shots
- [ ] profit_target_price, profit_target_percent on shots
- [ ] exit_trigger text field
- [ ] max_loss_amount field
- [ ] exit_reason tracked on close
- [ ] stop_loss_honored, profit_target_honored booleans

**Requirements:** PRD Section 3.4

---

#### E16-S5: Track Discipline Statistics
**As a** trader, **I want** to see my discipline stats **so that** I can improve.

**Acceptance Criteria:**
- [ ] user_discipline_stats table
- [ ] Track: stop_loss_honored_count, stop_loss_ignored_count
- [ ] Track: profit_target_honored_count, profit_target_ignored_count
- [ ] Track: abort_trigger_honored_count, abort_trigger_ignored_count
- [ ] Display in settings/dashboard

**Requirements:** PRD Section 9

---

### Epic 17: Stripe Integration (Phase 2D)
**Priority:** P2 | **Dependencies:** E13, E14
**Phase:** 2D - Payment Processing

Integrate Stripe for subscription billing.

**Stories:**

#### E17-S1: Configure Stripe Products
**As an** admin, **I want** Stripe products configured **so that** users can subscribe.

**Acceptance Criteria:**
- [ ] Premium and Premium Plus products in Stripe
- [ ] Monthly and annual pricing variants
- [ ] Stripe API keys in environment
- [ ] Test mode for development

**Requirements:** PRD Section 9

---

#### E17-S2: Implement Checkout Flow
**As a** user, **I want** to upgrade to paid tier **so that** I get full features.

**Acceptance Criteria:**
- [ ] Upgrade button in settings/paywall
- [ ] Stripe Checkout session creation
- [ ] Success/cancel redirect handling
- [ ] stripe_customer_id stored on user
- [ ] Tier updated on successful payment

**Requirements:** PRD Section 9

---

#### E17-S3: Handle Subscription Webhooks
**As a** developer, **I want** webhook handling **so that** tier status stays in sync.

**Acceptance Criteria:**
- [ ] Webhook endpoint for Stripe events
- [ ] Handle: checkout.session.completed
- [ ] Handle: customer.subscription.updated
- [ ] Handle: customer.subscription.deleted
- [ ] Signature verification for security

**Requirements:** PRD Section 9

---

#### E17-S4: Implement Billing Portal
**As a** user, **I want** to manage my subscription **so that** I can update payment or cancel.

**Acceptance Criteria:**
- [ ] Link to Stripe Customer Portal
- [ ] Portal accessible from settings
- [ ] Cancel flow with confirmation
- [ ] Downgrade handling on cancellation

**Requirements:** PRD Section 9

---

## Summary

| Epic | Stories | Priority | Phase | Est. Complexity |
|------|---------|----------|-------|-----------------|
| E1: Foundation | 6 | P0 | 1 | Medium |
| E2: Auth & Users | 5 | P0 | 1 | Medium |
| E3: Alpaca Integration | 7 | P0 | 1 | High |
| E4: Target Management | 7 | P0 | 1 | Medium |
| E5: Aim Management | 9 | P0 | 1 | Medium |
| E6: Shot Management | 11 | P0 | 1 | High |
| E7: Scoring Engine | 12 | P0 | 1 | High |
| E8: Dashboard & Viz | 13 | P0 | 1 | High |
| E9: History & Reporting | 6 | P1 | 1 | Medium |
| E10: Background Jobs | 8 | P1 | 1 | Medium |
| E11: Orphan Handling | 3 | P1 | 1 | Low |
| E12: Testing & Quality | 8 | P0 | 1 | Medium |
| **Phase 1 Subtotal** | **95** | - | - | - |
| E13: User Tier System | 4 | P2 | 2A | Medium |
| E14: Promo & Trial System | 3 | P2 | 2B | Medium |
| E15: Referral System | 3 | P2 | 2C | Medium |
| E16: Trading Discipline | 5 | P1 | 2 | Medium |
| E17: Stripe Integration | 4 | P2 | 2D | High |
| **Phase 2 Subtotal** | **19** | - | - | - |
| **Total** | **114** | - | - | - |

---

## Core Value Proposition Reinforcement

The following value props should be woven throughout the UI (see messaging-strategy below):

1. **"Why did I buy this?"** - The thesis (Target) is the heart of Outvestments. We're the only app that makes you document your reasoning BEFORE trading. Easy to forget why you started, what you knew, why you thought it was a good buy. We track that.

2. **"Am I getting better?"** - Not just tracking trades, but tracking your growth as a trader over time.

3. **"What would the market have done?"** - Every trade compared to NPC opponents (S&P, etc.) so you always know your opportunity cost.

4. **"Have a plan, know it"** - Advanced mode encourages exit strategies and risk documentation.

5. **"Context matters"** - Market condition tags and unicorn events provide the full picture.
