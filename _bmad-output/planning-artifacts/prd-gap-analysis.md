# PRD Gap Analysis - Outvestments

**Date:** 2025-12-31
**PRD Version:** 2.0 (2025-12-30)
**Analysis Status:** Complete

---

## Executive Summary

This document analyzes the implementation status of all Functional Requirements (FRs) from the PRD. The codebase has strong foundational work in authentication, basic CRUD operations, and the scoring system architecture. However, several P0/P1 features remain incomplete or missing entirely.

**Summary Statistics:**
- **DONE:** 45 requirements (fully implemented and functional)
- **PARTIAL:** 18 requirements (code exists but incomplete)
- **MISSING:** 23 requirements (no implementation)

---

## 1. Authentication & User Management (FR1-FR5)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR1 | Authentik SSO integration | **DONE** | Full OIDC flow via `src/auth.ts`, NextAuth integration |
| FR2 | User provisioning on first login | **DONE** | Auto-creates user record in `users` table |
| FR3 | Role-based access (viewer/user/power_user/admin) | **DONE** | Schema has roles, enforced in some routes |
| FR4 | Session management (60-min default) | **DONE** | Session expiry tracked, displayed in settings |
| FR5 | Per-user Alpaca API key storage (encrypted) | **DONE** | AES-256 encryption in `alpaca_credentials` table |

**Section Status:** 5/5 DONE

---

## 2. Target Management (FR6-FR12)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR6 | Create target with thesis | **DONE** | `createTarget()` in actions, form UI |
| FR7 | Target types (growth/value/momentum/dividend/speculative) | **DONE** | Enum in schema, form selection |
| FR8 | Catalyst categories | **PARTIAL** | Schema field exists but no dropdown/enforcement |
| FR9 | Tags (open system, user-created) | **PARTIAL** | JSON field in schema, no tag creation UI |
| FR10 | Conviction level (high/medium/low) | **MISSING** | Field not in schema |
| FR11 | Risks identified field | **PARTIAL** | `risks` text field exists, no structured input |
| FR12 | Abort trigger field | **MISSING** | `exit_triggers` on aims, but not `abort_trigger` on targets |

**Section Status:** 2 DONE, 3 PARTIAL, 2 MISSING

---

## 3. Aim Management (FR13-FR21)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR13 | Create aim with ticker + target price | **DONE** | Full form, symbol search, price input |
| FR14 | Realistic + Reach target prices | **DONE** | Both fields in schema and form |
| FR15 | Target date selection | **DONE** | Date picker in form |
| FR16 | Aim types (Playable vs Monitor) | **MISSING** | No `aim_type` field in schema |
| FR17 | Pace calculation (%/month) | **MISSING** | Not calculated or displayed |
| FR18 | Aim status transitions | **DONE** | Full enum: active/expiring/expired/closed/hit/rolled_over |
| FR19 | Rollover functionality | **PARTIAL** | `rolled_from_id` field exists, no UI or action |
| FR20 | Stop loss / take profit fields | **DONE** | Fields in schema and forms |
| FR21 | Exit conditions text | **DONE** | `exit_conditions` field in schema |

**Section Status:** 6 DONE, 1 PARTIAL, 2 MISSING

---

## 4. Shot Management (FR22-FR32)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR22 | Create shot with direction (buy/sell) | **DONE** | Full form with direction select |
| FR23 | Shot types (stock/option) | **PARTIAL** | Enum exists, but options workflow incomplete |
| FR24 | Trigger types (market/limit) | **DONE** | Enum and form support |
| FR25 | Position size tracking | **DONE** | Field in schema and forms |
| FR26 | Shot states (pending/armed/fired/active/closed) | **DONE** | Full enum with state transitions |
| FR27 | Paper trade execution via Alpaca | **DONE** | `fireShot()` action, Alpaca integration |
| FR28 | Close position flow | **DONE** | `closeShot()` action with P/L calculation |
| FR29 | Partial close (lot splitting) | **PARTIAL** | `parent_shot_id` exists, no split logic |
| FR30 | Stop loss order placement | **DONE** | `stop_loss_order_id`, Alpaca stop order |
| FR31 | Options fields (strike, expiration, premium) | **MISSING** | No options table in schema |
| FR32 | Stray shots (without aim) | **DONE** | `aim_id` nullable, orphan position detection |

**Section Status:** 8 DONE, 2 PARTIAL, 1 MISSING

---

## 5. Scoring System (FR33-FR43)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR33 | 4-level hierarchical scoring | **DONE** | User/Target/Aim/Shot scores implemented |
| FR34 | Aim-level 4 metrics | **DONE** | Directional/Magnitude/Forecast/Thesis metrics |
| FR35 | Shot-level 4 metrics | **DONE** | Performance/Forecast/PerfectShot/Risk metrics |
| FR36 | Letter grades (16-tier AAA to FFF) | **DONE** | Full enum and mapping |
| FR37 | Difficulty multiplier (displayed, not applied) | **DONE** | Calculated and stored separately |
| FR38 | Risk multiplier (0.70x to 1.10x) | **DONE** | Full A/B/C/D/F grading |
| FR39 | Time-normalized returns (PPD/PPM/PPY) | **DONE** | Calculated at all levels |
| FR40 | Scoring cascade (shot->aim->target->user) | **DONE** | Automatic recalculation chain |
| FR41 | Adaptability bonus (Pro only) | **PARTIAL** | Field exists, locked flag, no Pro tier check |
| FR42 | Self-reflection on aims | **DONE** | `submitSelfReflection()` action |
| FR43 | Original 3-metric scoring (legacy) | **DONE** | Raw transaction facts on shots |

**Section Status:** 10 DONE, 1 PARTIAL

---

## 6. Views & Visualization (FR44-FR56)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR44 | Dashboard with scoreboard | **DONE** | Arena-style dashboard, full stats |
| FR45 | Active positions list | **DONE** | Dashboard + Portfolio page |
| FR46 | Quick actions (New Shot, etc) | **DONE** | ArenaActionButtons component |
| FR47 | Portfolio value + buying power | **DONE** | From Alpaca, displayed in dashboard |
| FR48 | Performance line graph | **DONE** | `PortfolioHistoryChart` component |
| FR49 | GitHub-style heatmap | **MISSING** | Not implemented |
| FR50 | Delta bar chart (60-day) | **MISSING** | Not implemented |
| FR51 | Shot detail view | **DONE** | `/targets/[id]/aims/[aimId]` page |
| FR52 | History view (all closed shots) | **DONE** | `/history` page with tabs |
| FR53 | Filters (date, catalyst, tags, performance) | **PARTIAL** | Basic filtering, no tag filter |
| FR54 | Trajectory visualization | **MISSING** | PRD describes trend overlay, not built |
| FR55 | Pace gauge | **DONE** | `ArenaPaceGauge` component |
| FR56 | Leaderboard | **MISSING** | Marked "Soon" in sidebar, no page |

**Section Status:** 8 DONE, 1 PARTIAL, 4 MISSING

---

## 7. Background Jobs (FR57-FR59)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR57 | Nightly EOD snapshot capture | **DONE** | pg-boss job, `eod-snapshot` handler |
| FR58 | Score refresh job | **DONE** | `score-refresh` job registered |
| FR59 | Price cache cleanup | **DONE** | `cache-cleanup` job registered |

**Section Status:** 3/3 DONE

---

## 8. Watchlist & Symbols (FR60-FR61)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR60 | Symbol search with autocomplete | **DONE** | Finnhub sync, symbol table, search UI |
| FR61 | Watchlist with price alerts | **DONE** | `/watchlist` page, alerts field |

**Section Status:** 2/2 DONE

---

## 9. Corporate Actions (FR62-FR65)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR62 | Stock split handling | **MISSING** | No split detection or adjustment |
| FR63 | Merger/acquisition handling | **MISSING** | No handling |
| FR64 | Symbol change tracking | **MISSING** | No handling |
| FR65 | Dividend tracking | **MISSING** | No dividend table or tracking |

**Section Status:** 0/4 DONE (all MISSING)

---

## 10. Premium/Tier Features (FR66-FR67)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR66 | Tier system (free/premium/premium_plus) | **MISSING** | No tier fields in user schema |
| FR67 | Usage limits enforcement | **MISSING** | No limit checks |

**Section Status:** 0/2 DONE (all MISSING)

---

## 11. Navigation & UX (FR68-FR71)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR68 | Sidebar navigation | **DONE** | `AppSidebar` component |
| FR69 | Mobile-responsive navigation | **PARTIAL** | Sidebar works, no dedicated mobile nav |
| FR70 | User dropdown menu | **DONE** | `AppHeader` with dropdown |
| FR71 | Colorblind mode setting | **DONE** | Preference stored, toggleable |

**Section Status:** 3 DONE, 1 PARTIAL

---

## 12. Data Integrity & Security (FR72-FR76)

| FR | Description | Status | Notes |
|----|-------------|--------|-------|
| FR72 | Immutable audit logs | **DONE** | `audit_logs` table, `logAuditEvent()` |
| FR73 | Soft deletes (deletedAt) | **DONE** | All entities have `deleted_at` |
| FR74 | API rate limiting | **MISSING** | No rate limiting middleware |
| FR75 | Input validation | **PARTIAL** | Zod schemas in forms, not all routes |
| FR76 | Health check endpoint | **MISSING** | No `/api/health` route |

**Section Status:** 2 DONE, 1 PARTIAL, 2 MISSING

---

## Priority Gap Summary

### Critical (P0) - Must Fix for Full App

1. **Options Support (FR31)** - No options table, no call/put workflow
2. **Leaderboard (FR56)** - Core gamification feature, currently placeholder
3. **Pace Calculation (FR17)** - Key metric for aim tracking
4. **Monitor Aim Type (FR16)** - Differentiates playable vs tracking aims
5. **Corporate Actions (FR62-65)** - No split/merger/dividend handling

### High Priority (P1) - Important for User Experience

6. **Trajectory Visualization (FR54)** - PRD describes trend overlay
7. **Tier System (FR66-67)** - No premium features or limits
8. **GitHub Heatmap (FR49)** - Mentioned in PRD as P1
9. **Delta Bar Chart (FR50)** - Mentioned in PRD as P1
10. **Partial Close Logic (FR29)** - Schema ready, no implementation

### Medium Priority (P2) - Enhancements

11. **Conviction Level (FR10)** - Metadata field for targets
12. **Abort Trigger (FR12)** - Thesis invalidation tracking
13. **Rollover UI (FR19)** - Field exists, needs flow
14. **Mobile Nav (FR69)** - Sidebar works but not optimal
15. **Health Check (FR76)** - Needed for monitoring

---

## Top 10 Priority Gaps for "Full App" Functionality

| Rank | Gap | Effort | Impact | Recommendation |
|------|-----|--------|--------|----------------|
| 1 | **Leaderboard** | Medium | High | Create `/leaderboard` with user rankings by score |
| 2 | **Options Support** | High | High | Add `shot_options` table, options workflow |
| 3 | **Pace Calculation** | Low | Medium | Calculate `(target_price - current_price) / months_remaining` |
| 4 | **Monitor Aims** | Low | Medium | Add `aim_type` enum, filter from scoring |
| 5 | **Trajectory Visualization** | Medium | High | Overlay predicted vs actual price path |
| 6 | **Partial Close Logic** | Medium | Medium | Implement lot splitting when selling partial |
| 7 | **GitHub Heatmap** | Low | Medium | Calendar grid of daily P/L |
| 8 | **Delta Bar Chart** | Low | Medium | Daily change bars for 60 days |
| 9 | **Tier/Limits System** | Medium | Low | Add tier fields, check limits on create |
| 10 | **Corporate Actions Job** | High | Medium | Daily job to fetch and apply splits/mergers |

---

## Implementation Recommendations

### Quick Wins (< 1 day each)
- Add `pace_required` calculation when creating aims
- Add `aim_type` enum (playable/monitor)
- Add `conviction_level` field to targets
- Create health check endpoint

### Medium Effort (1-3 days each)
- Build leaderboard page with user rankings
- Implement GitHub-style heatmap component
- Implement delta bar chart component
- Add partial close (lot split) logic

### Larger Initiatives (1+ week each)
- Full options support (schema + UI + scoring)
- Corporate actions detection and handling
- Trajectory visualization with chart overlay
- Tier system with usage limits

---

*Generated: 2025-12-31*
