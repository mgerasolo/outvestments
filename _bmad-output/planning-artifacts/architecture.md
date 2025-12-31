---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: '2025-12-27'
updatedAt: '2025-12-30'
inputDocuments:
  - prd-outvestments-2025-12-27.md
  - product-brief-outvestments-2025-12-26.md
  - business-analysis-report-2025-12-27.md
  - paper-trading-api-research.md
  - pricing-tiers.md
  - target-theory-system-v2.md
workflowType: 'architecture'
project_name: 'outvestments'
user_name: 'Matt'
date: '2025-12-27'
version: '1.1'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
~71 core FRs spanning Target/Aim/Shot management, 4-level hierarchical scoring (User → Target → Aim → Shot with centered -50 to +50 scale), Alpaca paper trading integration, multi-view visualization (scoreboard, charts, heatmaps), and role-based user management. The thesis-first approach (Target → Aim → Shot hierarchy) and time-normalized profit metrics are the key differentiators requiring careful implementation.

**Non-Functional Requirements:**
- Multi-tenant data isolation from day 1
- AES-256 encryption for Alpaca API keys (server-side only)
- Immutable audit logs for all financial actions
- Dual rate limiting (protect platform + respect Alpaca's 200/min)
- Price caching with 15-30 min TTL (not real-time)
- Full history retention (no data expiration)
- Test coverage: 100% scoring logic, 80% API routes, 60% components

**Scale & Complexity:**
- Primary domain: Full-stack web application
- Complexity level: Medium-High
- Key challenges: Scoring calculations, external API orchestration, background job processing, corporate action edge cases

### Technical Constraints & Dependencies

**Stack (Pre-decided in PRD):**
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL |
| ORM | Drizzle |
| Auth | Authentik (existing infrastructure) |
| Trading API | Alpaca Paper Trading API |
| Testing | Playwright (E2E) + Vitest (unit) |
| Monitoring | Sentry + Loki/Grafana (OpenObserve parallel) |
| Deployment | Docker (self-hosted on stark:3154) |

**Infrastructure Decisions (This Session):**
| Concern | Decision | Rationale |
|---------|----------|-----------|
| Caching | PostgreSQL | Zero new infra; Redis in Phase 3 if needed |
| Job Runner | pg-boss | PostgreSQL-backed queuing; no Redis dependency |
| Score Refresh | Hourly | Sufficient for thesis tracking; reduces load |
| Market Data | Alpaca (all) | One integration for trading + data + SPY |
| Client State | React Query + Context | Server state caching + minimal UI state |
| Charts | Apache eCharts | Comprehensive library for all chart types; UX to validate visual feel |
| Corporate Actions | Error → Admin notify | Research MCP/Yahoo for Phase 2 automation |
| API Patterns | Server Actions + Route Handlers | Modern Next.js App Router approach |

**Rate Limit Strategy:**
With 20-30 min cache TTL, effective capacity is ~4,000 calls per refresh window (200/min × 20 min). Batch fetching (multi-symbol snapshots) further reduces calls to single digits per interval. Rate limits are non-issue for MVP scale.

### UI Architecture

- **Component library:** shadcn/ui with ShadCN Studio MCP for rapid layout
- **Charting:** Apache eCharts for all visualizations
  - Hybrid candlestick + line charts (trajectory)
  - Radial charts (scoring displays)
  - GitHub-style heatmap (daily performance)
  - Bar charts (60-day delta)
  - Line graphs (portfolio value over time)
- **Pattern:** Standard shadcn blocks; no custom complex components for MVP

**Action Item:** UX Designer to create chart showcase comparing eCharts, Recharts, and Lightweight Charts visual feel for final validation.

### Cross-Cutting Concerns

| Concern | Scope | Implementation Notes |
|---------|-------|---------------------|
| Authentication | All routes | Authentik OIDC; 4 roles (viewer/user/power_user/admin) |
| Authorization | Data access | Row-level isolation by user_id |
| Audit Logging | Financial actions | Immutable log table; shot/order/close events |
| Rate Limiting | API layer | Inbound (protect us) + Outbound (respect Alpaca) |
| Encryption | API keys | AES-256 at rest; decrypt only at call time |
| Error Handling | All layers | Sentry integration; detailed structured errors |
| Background Jobs | Nightly EOD + Hourly scores | pg-boss; EOD runs after market close (4:30 PM ET) |

### Architectural Implications

**Scoring Engine (4-Level Hierarchical System):**
The scoring system implements a 4-level hierarchy (User → Target → Aim → Shot) with centered -50 to +50 scale where 0 = market baseline (C grade). Key characteristics:
- **Aim Level (PRIMARY):** 4 metrics (Directional 20%, Magnitude 30%, Forecast Edge 35%, Thesis Validity 15%) + Difficulty displayed independently
- **Shot Level:** 4 metrics (Performance 45%, Forecast Edge 35%, PSC 20%) + Risk multiplier (0.70× to 1.10×) + Adaptability bonus
- **Target Level:** Dual scores (Prediction Quality + Performance), P&L summary, capital metrics, market comparison
- **User Level:** Career rollups of prediction and performance scores
- Letter grades: FFF → AAA (16 tiers)
- Thesis Validity capped at 0 if risks not documented
- Deterministic, 100% test covered, isolated as pure functions

**External API Strategy:**
Alpaca is the single external dependency for MVP. Mitigation:
- Aggressive caching reduces API calls by 90%+
- Graceful degradation when Alpaca unavailable (show cached data)
- Circuit breaker pattern for outbound calls
- All Alpaca calls server-side (keys never exposed)

**Data Integrity:**
- Scores calculated at specific points (hourly job, position close)
- Historical data is sacred — no deletions, only soft-deletes
- Audit trail for all financial operations

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application using Next.js App Router with PostgreSQL database and external API integration (Alpaca).

### Starter Approach

**Composite initialization** — no monolithic boilerplate. We're combining:
1. `create-next-app` (Next.js 16.x)
2. `shadcn init` (UI components)
3. Manual addition of Drizzle, pg-boss, React Query

This approach gives us exactly what we need without unwanted dependencies (tRPC, NextAuth, Prisma) that would conflict with our choices (Server Actions, Authentik, Drizzle).

### Initialization Sequence

```bash
# 1. Create Next.js 16 app with defaults
pnpm create next-app@latest outvestments --yes

# 2. Initialize shadcn/ui
cd outvestments
pnpm dlx shadcn init

# 3. Add database layer
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# 4. Add background job processing
pnpm add pg-boss

# 5. Add client state management
pnpm add @tanstack/react-query

# 6. Add testing frameworks
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D playwright @playwright/test

# 7. Add monitoring
pnpm add @sentry/nextjs
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript (strict mode)
- Node.js 20.9+ (Next.js 16 requirement)
- ES Modules

**Styling Solution:**
- Tailwind CSS 3.x (via create-next-app)
- shadcn/ui component primitives
- CSS variables for theming

**Build Tooling:**
- Turbopack (development)
- Next.js compiler (production)
- ESLint + TypeScript checking

**Project Structure:**

```
outvestments/
├── src/
│   ├── app/              # App Router pages and layouts
│   ├── components/       # React components (shadcn + custom)
│   │   └── ui/           # shadcn/ui primitives
│   ├── lib/              # Shared utilities
│   │   ├── db/           # Drizzle schema and client
│   │   ├── alpaca/       # Alpaca API client
│   │   ├── scoring/      # Scoring engine (pure functions)
│   │   └── utils.ts      # cn() and helpers
│   ├── actions/          # Server Actions
│   └── hooks/            # Custom React hooks
├── drizzle/              # Migrations
├── public/               # Static assets
├── tests/                # Playwright E2E tests
└── drizzle.config.ts     # Drizzle configuration
```

**Development Experience:**
- Hot reloading via Turbopack
- TypeScript strict mode
- ESLint with Next.js rules
- Path aliases (@/*)

### Dependencies Not Included (Intentional)

| Dependency | Purpose | Why Excluded |
|------------|---------|--------------|
| next-auth / auth.js | Auth | Using Authentik OIDC instead |
| prisma | ORM | Using Drizzle instead |
| tRPC | API layer | Using Server Actions instead |

### Dependencies to Add When Needed

| Dependency | Purpose | When to Add |
|------------|---------|-------------|
| zod | Validation | When building forms |
| react-hook-form | Forms | When building forms |
| echarts / echarts-for-react | Charts | When building visualizations |

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database schema design for Target/Aim/Shot/Score relationships
- Alpaca API integration patterns
- Scoring engine architecture
- Authentication flow with Authentik

**Important Decisions (Shape Architecture):**
- API response formats and error handling
- Background job scheduling patterns
- Caching strategy implementation
- Audit logging approach

**Deferred Decisions (Post-MVP):**
- Redis caching upgrade (Phase 3)
- Corporate action automation via MCP/Yahoo
- Real-time price streaming
- Multi-region deployment

### Data Architecture

**Database: PostgreSQL 16+**

**Schema Design Approach:** Normalized relational with strategic denormalization for read performance.

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| `users` | Authentik-linked user profiles | `id`, `authentik_sub`, `role`, `tier`, `tier_source`, `tier_expires_at`, `referral_code`, `referred_by_user_id`, `created_at` |
| `targets` | Investment thesis containers | `id`, `user_id`, `thesis`, `target_type`, `catalyst`, `tags`, `status`, `conviction_level`, `risks_identified`, `abort_trigger`, `abort_triggered`, `abort_triggered_at` |
| `aims` | Specific ticker + price + date predictions | `id`, `target_id`, `symbol`, `aim_type` (playable/monitor), `target_price_realistic`, `target_price_reach`, `target_date`, `rationale`, `monitor_entry_price`, `monitor_outcome`, `ai_suggested` |
| `shots` | Individual trades/orders | `id`, `aim_id`, `direction`, `entry_price`, `entry_date`, `position_size`, `trigger_type`, `shot_type`, `state`, `stop_loss_price`, `stop_loss_percent`, `profit_target_price`, `profit_target_percent`, `exit_trigger`, `max_loss_amount`, `exit_reason`, `stop_loss_honored`, `profit_target_honored` |
| `aim_scores` | Aim-level scoring (4 metrics + difficulty) | `id`, `aim_id`, `directional_accuracy`, `magnitude_accuracy`, `forecast_edge`, `thesis_validity`, `difficulty_multiplier`, `aim_final_score`, `letter_grade`, `risks_documented`, `calculated_at` |
| `shot_scores` | Shot-level scoring (4 metrics + risk) | `id`, `shot_id`, `performance_score`, `shot_forecast_edge`, `perfect_shot_capture`, `risk_mitigation_score`, `risk_grade`, `risk_multiplier`, `adaptability_score`, `final_shot_score`, `letter_grade`, `calculated_at` |
| `target_scores` | Target-level aggregation | `id`, `target_id`, `prediction_score`, `prediction_grade`, `performance_score`, `performance_grade`, `total_pnl_dollars`, `total_pnl_percent`, `win_ratio`, `calculated_at` |
| `user_career_scores` | User career rollups | `id`, `user_id`, `prediction_quality_score`, `performance_score`, `prediction_grade`, `performance_grade`, `total_aims_scored`, `total_shots_scored`, `total_pnl_dollars`, `calculated_at` |
| `audit_logs` | Immutable financial action log | `id`, `user_id`, `action`, `entity_type`, `entity_id`, `payload`, `created_at` |
| `price_cache` | Cached market data | `symbol`, `price`, `fetched_at`, `source` |
| `alpaca_credentials` | Encrypted API keys | `id`, `user_id`, `encrypted_key`, `encrypted_secret`, `iv` |

**Phase 2 Monetization Tables (New):**

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| `user_acquisition` | Track how users were acquired | `id`, `user_id`, `source`, `utm_source`, `utm_medium`, `utm_campaign`, `referral_code_used`, `affiliate_code_used`, `landing_page`, `created_at` |
| `promo_codes` | Promotional code definitions | `id`, `code`, `type` (tier_grant/trial_extension/percent_off/etc), `value`, `tier_to_grant`, `days_to_grant`, `valid_from`, `valid_until`, `max_uses`, `max_uses_per_user`, `new_users_only`, `min_tier`, `is_active` |
| `promo_redemptions` | Track code usage | `id`, `promo_code_id`, `user_id`, `redeemed_at`, `applied_until`, `discount_amount` |
| `referrals` | Referral tracking | `id`, `referrer_user_id`, `referred_user_id`, `code_used`, `referred_at`, `converted_at`, `reward_granted_at`, `reward_type` |
| `affiliates` | Affiliate partner accounts | `id`, `user_id`, `affiliate_code`, `commission_rate`, `payout_method`, `tier`, `is_active`, `created_at` |
| `affiliate_conversions` | Track affiliate sales | `id`, `affiliate_id`, `referred_user_id`, `conversion_type`, `revenue_generated`, `commission_earned`, `payout_status`, `created_at` |
| `global_config` | System-wide configuration | `key`, `value`, `updated_at`, `updated_by` |
| `user_discipline_stats` | Trading discipline metrics | `id`, `user_id`, `total_shots`, `stop_loss_honored_count`, `stop_loss_ignored_count`, `profit_target_honored_count`, `profit_target_ignored_count`, `abort_trigger_honored_count`, `abort_trigger_ignored_count`, `updated_at` |

**User Tier System:**

```sql
-- Tier resolution order: global_override > admin > subscription > promo > trial > 'free'
tier ENUM('free', 'premium', 'premium_plus') DEFAULT 'free'
tier_source ENUM('default', 'subscription', 'trial', 'promo', 'admin', 'affiliate', 'global_override') DEFAULT 'default'
tier_expires_at TIMESTAMP NULL  -- When current tier expires
trial_started_at TIMESTAMP NULL
trial_ends_at TIMESTAMP NULL
```

**Conviction Levels (Targets):**

```sql
conviction_level ENUM('high', 'medium', 'low') DEFAULT 'medium'
conviction_updated_at TIMESTAMP NULL
```

**Aim Types:**

```sql
aim_type ENUM('playable', 'monitor') DEFAULT 'playable'
-- Monitor aims: no shots allowed, no scoring impact, no leaderboard
-- Used for thesis validation without capital commitment
```

**Soft Delete Strategy:** `deleted_at` timestamp column on `targets`, `aims`, and `shots`. Null = active.

**Migration Strategy:** Drizzle Kit with versioned migrations in `/drizzle` folder. Run migrations on deployment via Docker entrypoint.

### Authentication & Security

**Session Management:** NextAuth.js 5 with Authentik OIDC provider. JWT strategy for stateless sessions.

**Role Enforcement:**
| Role | Capabilities |
|------|-------------|
| `viewer` | Read-only access to public scoreboards |
| `user` | Create/manage own theories and shots |
| `power_user` | Extended API limits, advanced features |
| `admin` | Full access, user management, system config |

**Middleware Pattern:**
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Auth check via NextAuth
  // Role extraction from JWT
  // Route protection based on path patterns
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}
```

**API Key Encryption:**
- Library: Node.js `crypto` module (AES-256-GCM)
- Key derivation: PBKDF2 from environment secret
- Storage: Encrypted blob + IV in `alpaca_credentials` table
- Decryption: Only at Alpaca API call time, never logged

### API & Communication Patterns

**Server Actions Pattern:**
```typescript
// src/actions/targets.ts
'use server'

export async function createTarget(formData: FormData) {
  // 1. Auth check
  // 2. Zod validation
  // 3. Database insert
  // 4. Audit log
  // 5. Return result
}
```

**Route Handlers (for external/webhook endpoints):**
```typescript
// src/app/api/webhooks/alpaca/route.ts
export async function POST(request: Request) {
  // Verify signature
  // Process webhook
  // Return response
}
```

**Validation Strategy:** Zod schemas co-located with Server Actions.
```
src/actions/
├── targets.ts
├── targets.schema.ts   # Zod schemas for target actions
├── aims.ts
├── aims.schema.ts      # Zod schemas for aim actions
├── shots.ts
└── shots.schema.ts
```

**Error Response Format:**
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; field?: string } }
```

**Alpaca Client Architecture:**
- Single client instance per request (no connection pooling needed for REST)
- Wrapper in `src/lib/alpaca/client.ts`
- Rate limiting via `src/lib/alpaca/rate-limiter.ts` (token bucket)
- Circuit breaker for graceful degradation

### Background Jobs

**pg-boss Configuration:**
```typescript
// src/lib/jobs/boss.ts
const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  retentionDays: 30,
  archiveCompletedAfterSeconds: 86400, // 1 day
});
```

**Scheduled Jobs:**
| Job | Schedule | Purpose |
|-----|----------|---------|
| `score-refresh` | Hourly (market hours) | Recalculate open position scores |
| `eod-snapshot` | Daily 4:30 PM ET | Capture end-of-day portfolio state |
| `cache-cleanup` | Daily 2:00 AM | Prune expired price cache entries |

**Job Failure Handling:**
- Automatic retry: 3 attempts with exponential backoff
- Dead letter queue: Failed jobs move to `_failed_jobs` for inspection
- Alerting: Sentry notification on job failure

**Job Monitoring:**
- pg-boss built-in `getQueueSize()` and `getJobById()`
- Custom `/api/admin/jobs` endpoint for job status dashboard
- Sentry performance monitoring for job duration

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make different choices, all addressed below.

### Naming Patterns

**Database Naming Conventions:**
| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `users`, `targets`, `aims`, `shots`, `audit_logs` |
| Columns | snake_case | `user_id`, `created_at`, `target_price` |
| Foreign keys | `{table}_id` | `target_id`, `aim_id`, `user_id` |
| Indexes | `idx_{table}_{columns}` | `idx_shots_symbol`, `idx_aims_target_id` |
| Enums | PascalCase | `ShotDirection`, `ShotState`, `TargetStatus`, `TriggerType` |

**API Naming Conventions:**
| Element | Convention | Example |
|---------|------------|---------|
| Server Actions | camelCase verbs | `createTarget`, `createAim`, `closeShot`, `updateScore` |
| Route handlers | kebab-case paths | `/api/webhooks/alpaca` |
| Query params | camelCase | `?userId=123&includeScores=true` |

**Code Naming Conventions:**
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `TargetCard.tsx`, `AimList.tsx`, `ShotList.tsx` |
| Files (components) | PascalCase | `TargetCard.tsx`, `AimCard.tsx` |
| Files (utilities) | kebab-case | `date-utils.ts`, `score-calculator.ts` |
| Functions | camelCase | `calculatePPD()`, `formatCurrency()` |
| Variables | camelCase | `userId`, `targetData`, `aimData` |
| Constants | SCREAMING_SNAKE | `MAX_AIMS_PER_TARGET`, `MAX_SHOTS_PER_AIM`, `CACHE_TTL_MS` |
| Types/Interfaces | PascalCase | `Target`, `Aim`, `Shot`, `ShotWithScore`, `UserProfile` |

### Structure Patterns

**Project Organization:** Feature-based with shared utilities.

**Test Organization:**
- Unit tests: Co-located as `*.test.ts` next to source files
- E2E tests: `/tests/e2e/*.spec.ts`
- Test utilities: `/tests/utils/`

**Component Organization:**
```
src/components/
├── ui/              # shadcn/ui primitives (auto-generated)
├── layout/          # App shell, sidebar, header
├── features/        # Feature-specific components
│   ├── targets/     # TargetCard, TargetList, CreateTargetForm
│   ├── aims/        # AimCard, AimList, CreateAimForm
│   ├── shots/       # ShotCard, ShotTable, AddShotModal
│   ├── scores/      # ScoreDisplay, ScoreChart, PPDIndicator
│   └── scoreboard/  # Leaderboard, UserRankCard
└── shared/          # Reusable across features (LoadingSpinner, ErrorBoundary)
```

### Format Patterns

**API Response Formats:**

Success:
```json
{ "success": true, "data": { ... } }
```

Error:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Target price is required", "field": "targetPrice" } }
```

**Data Exchange Formats:**
| Format | Convention |
|--------|------------|
| JSON fields | camelCase |
| Dates in JSON | ISO 8601 strings (`2025-12-27T15:30:00Z`) |
| Money | Integer cents (avoid float precision issues) |
| Booleans | `true`/`false` (not 1/0) |
| Nulls | Explicit `null`, not omitted |

### Communication Patterns

**React Query Patterns:**
```typescript
// Query key conventions
const queryKeys = {
  targets: ['targets'] as const,
  target: (id: string) => ['targets', id] as const,
  aims: (targetId: string) => ['targets', targetId, 'aims'] as const,
  aim: (targetId: string, aimId: string) => ['targets', targetId, 'aims', aimId] as const,
  shots: (targetId: string, aimId: string) => ['targets', targetId, 'aims', aimId, 'shots'] as const,
  scores: (userId: string) => ['users', userId, 'scores'] as const,
};
```

**State Management:**
- Server state: React Query (TanStack Query)
- UI state: React Context (minimal)
- Form state: react-hook-form

**Mutation Pattern:**
```typescript
const mutation = useMutation({
  mutationFn: createTarget,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.targets });
    toast.success('Target created');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### Process Patterns

**Error Handling Patterns:**

1. **Server Actions:** Always return `ActionResult<T>`, never throw
2. **API Routes:** Return appropriate HTTP status codes with JSON error body
3. **Components:** Use error boundaries for unexpected errors
4. **Forms:** Display field-level and form-level errors from ActionResult

**Loading State Patterns:**
- Use React Query's `isLoading`, `isPending` states
- Skeleton components for initial loads
- Inline spinners for mutations
- Optimistic updates for immediate feedback

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly as documented
2. Use ActionResult pattern for all Server Actions
3. Co-locate Zod schemas with their actions
4. Use React Query for all server state
5. Never expose Alpaca credentials client-side
6. Log all financial actions to audit_logs table

**Pattern Enforcement:**
- ESLint rules for naming conventions
- TypeScript strict mode catches type mismatches
- PR reviews verify pattern adherence
- Scoring engine has 100% test coverage requirement

### Pattern Examples

**Good Examples:**
```typescript
// ✅ Correct Server Action pattern
export async function createShot(formData: FormData): Promise<ActionResult<Shot>> {
  const session = await auth();
  if (!session) return { success: false, error: { code: 'UNAUTHORIZED', message: 'Must be logged in' } };

  const parsed = createShotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } };

  const shot = await db.insert(shots).values({ ...parsed.data, aimId: parsed.data.aimId }).returning();
  await logAudit('shot.created', 'shot', shot[0].id, parsed.data);

  return { success: true, data: shot[0] };
}
```

**Anti-Patterns:**
```typescript
// ❌ WRONG: Throwing errors instead of returning ActionResult
export async function createShot(data: any) {
  if (!data.symbol) throw new Error('Symbol required'); // DON'T DO THIS
}

// ❌ WRONG: Exposing Alpaca keys
const alpacaKey = process.env.ALPACA_KEY; // on client component - DON'T DO THIS
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
outvestments/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, type-check, test on PR
│       └── deploy.yml                # Build and deploy to stark
├── drizzle/
│   ├── migrations/                   # Versioned SQL migrations
│   └── meta/                         # Drizzle Kit metadata
├── public/
│   ├── favicon.ico
│   └── images/
│       └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── targets/
│   │   │   │   ├── page.tsx          # List targets
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create target
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Target detail
│   │   │   │       └── aims/
│   │   │   │           ├── page.tsx  # List aims within target
│   │   │   │           └── [aimId]/
│   │   │   │               ├── page.tsx  # Aim detail
│   │   │   │               └── shots/
│   │   │   │                   └── page.tsx  # Shots within aim
│   │   │   ├── scoreboard/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Protected layout with sidebar
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── alpaca/
│   │   │   │       └── route.ts
│   │   │   └── admin/
│   │   │       └── jobs/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── actions/
│   │   ├── targets.ts
│   │   ├── targets.schema.ts
│   │   ├── aims.ts
│   │   ├── aims.schema.ts
│   │   ├── shots.ts
│   │   ├── shots.schema.ts
│   │   ├── scores.ts
│   │   ├── alpaca.ts
│   │   └── settings.ts
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── app-header.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── features/
│   │   │   ├── targets/
│   │   │   │   ├── TargetCard.tsx
│   │   │   │   ├── TargetList.tsx
│   │   │   │   ├── CreateTargetForm.tsx
│   │   │   │   └── TargetStatusBadge.tsx
│   │   │   ├── aims/
│   │   │   │   ├── AimCard.tsx
│   │   │   │   ├── AimList.tsx
│   │   │   │   ├── CreateAimForm.tsx
│   │   │   │   └── AimProgressIndicator.tsx
│   │   │   ├── shots/
│   │   │   │   ├── ShotCard.tsx
│   │   │   │   ├── ShotTable.tsx
│   │   │   │   ├── AddShotModal.tsx
│   │   │   │   └── CloseShotDialog.tsx
│   │   │   ├── scores/
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   ├── PPDIndicator.tsx
│   │   │   │   ├── AccuracyGauge.tsx
│   │   │   │   └── TrajectoryChart.tsx
│   │   │   └── scoreboard/
│   │   │       ├── Leaderboard.tsx
│   │   │       ├── UserRankCard.tsx
│   │   │       └── PerformanceHeatmap.tsx
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── EmptyState.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── use-targets.ts
│   │   ├── use-aims.ts
│   │   ├── use-shots.ts
│   │   ├── use-scores.ts
│   │   ├── use-mobile.ts
│   │   └── use-preferences.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle client
│   │   │   ├── schema.ts             # All table definitions
│   │   │   └── queries/
│   │   │       ├── targets.ts
│   │   │       ├── aims.ts
│   │   │       ├── shots.ts
│   │   │       └── scores.ts
│   │   ├── alpaca/
│   │   │   ├── client.ts             # Alpaca API wrapper
│   │   │   ├── rate-limiter.ts       # Token bucket rate limiter
│   │   │   ├── types.ts              # Alpaca response types
│   │   │   └── errors.ts             # Alpaca-specific error handling
│   │   ├── scoring/
│   │   │   ├── index.ts              # Module exports
│   │   │   ├── types.ts              # TypeScript interfaces for scoring
│   │   │   ├── constants.ts          # Weights, grade mappings, interpolation points
│   │   │   ├── grade-mapper.ts       # Score to letter grade (FFF→AAA, 16 tiers)
│   │   │   ├── interpolators.ts      # Smooth interpolation for magnitude/forecast
│   │   │   ├── risk-assessor.ts      # Risk plan + execution discipline scoring
│   │   │   ├── aim-scorer.ts         # 4 metrics + difficulty calculation
│   │   │   ├── shot-scorer.ts        # 4 metrics + risk multiplier + adaptability
│   │   │   ├── target-scorer.ts      # Aggregation with P&L metrics
│   │   │   └── user-scorer.ts        # Career-level aggregation
│   │   ├── encryption.ts             # AES-256 encrypt/decrypt
│   │   ├── audit.ts                  # Audit logging helper
│   │   ├── query-keys.ts             # React Query key factory
│   │   └── utils.ts                  # cn() and general utilities
│   ├── jobs/
│   │   ├── boss.ts                   # pg-boss instance
│   │   ├── handlers/
│   │   │   ├── score-refresh.ts
│   │   │   ├── eod-snapshot.ts
│   │   │   └── cache-cleanup.ts
│   │   └── scheduler.ts              # Job registration
│   ├── types/
│   │   ├── next-auth.d.ts
│   │   └── index.ts                  # Shared types
│   ├── auth.ts                       # NextAuth configuration
│   └── middleware.ts                 # Route protection
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── targets.spec.ts
│   │   ├── aims.spec.ts
│   │   ├── shots.spec.ts
│   │   └── scoreboard.spec.ts
│   └── utils/
│       ├── fixtures.ts
│       └── test-db.ts
├── .env.example
├── .env.local                        # Local development (git-ignored)
├── .gitignore
├── components.json                   # shadcn/ui config
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

### Architectural Boundaries

**API Boundaries:**
| Boundary | Internal | External |
|----------|----------|----------|
| Auth | NextAuth middleware | Authentik OIDC provider |
| Trading | Server Actions | Alpaca Paper Trading API |
| Data | Drizzle ORM | PostgreSQL |
| Jobs | pg-boss client | PostgreSQL (queue storage) |

**Component Boundaries:**
- `/components/ui/` — Atomic UI primitives (shadcn, no business logic)
- `/components/features/` — Feature-specific, may call hooks
- `/components/shared/` — Cross-feature utilities (no business logic)
- `/components/layout/` — App shell components

**Service Boundaries:**
- `/lib/alpaca/` — All Alpaca API interaction isolated here
- `/lib/scoring/` — Pure functions, no side effects, 100% testable
- `/lib/db/` — All database access isolated here
- `/actions/` — All mutations go through Server Actions

**Data Boundaries:**
- Client → Server: Server Actions only (no direct API calls)
- Server → Alpaca: Via `/lib/alpaca/client.ts` only
- Server → Database: Via Drizzle client in `/lib/db/`

### Requirements to Structure Mapping

**Epic: Target Management**
- Components: `src/components/features/targets/`
- Actions: `src/actions/targets.ts`
- Schema: `src/actions/targets.schema.ts`
- Hooks: `src/hooks/use-targets.ts`
- Pages: `src/app/(protected)/targets/`
- Tests: `src/actions/targets.test.ts`, `tests/e2e/targets.spec.ts`

**Epic: Aim Management**
- Components: `src/components/features/aims/`
- Actions: `src/actions/aims.ts`
- Schema: `src/actions/aims.schema.ts`
- Hooks: `src/hooks/use-aims.ts`
- Pages: `src/app/(protected)/targets/[id]/aims/`
- Tests: `src/actions/aims.test.ts`, `tests/e2e/aims.spec.ts`

**Epic: Shot/Position Management**
- Components: `src/components/features/shots/`
- Actions: `src/actions/shots.ts`
- Schema: `src/actions/shots.schema.ts`
- Hooks: `src/hooks/use-shots.ts`
- Pages: `src/app/(protected)/targets/[id]/aims/[aimId]/shots/`
- Tests: `src/actions/shots.test.ts`, `tests/e2e/shots.spec.ts`

**Epic: Scoring Engine (4-Level Hierarchical System) ✅ IMPLEMENTED**
- Core Logic: `src/lib/scoring/` (pure functions - types, constants, grade-mapper, interpolators, risk-assessor, aim-scorer, shot-scorer, target-scorer, user-scorer)
- Server Actions: `src/app/actions/scoring.ts` (calculateAndStoreAimScore, calculateAndStoreShotScore, recalculateTargetScore, recalculateUserCareerScores)
- Components: `src/components/scoring/` (ScoreBadge, DifficultyBadge, MetricBar, AimScorecard, ShotScorecard, TargetScorecard, UserScorecard)
- Database: 4 tables (aim_scores, shot_scores, target_scores, user_career_scores) + 4 enums (letter_grade, risk_grade, risk_plan_quality, execution_discipline)
- Integration: Scoring triggers in `shots.ts` and `aims.ts` close actions
- Jobs: `src/jobs/handlers/score-refresh.ts`
- Tests: `src/lib/scoring/*.test.ts` (100% coverage required)

**Epic: Alpaca Integration**
- Client: `src/lib/alpaca/`
- Actions: `src/actions/alpaca.ts`
- Encryption: `src/lib/encryption.ts`
- Webhooks: `src/app/api/webhooks/alpaca/`

**Cross-Cutting: Authentication**
- Config: `src/auth.ts`
- Middleware: `src/middleware.ts`
- Types: `src/types/next-auth.d.ts`
- Pages: `src/app/(auth)/`

**Cross-Cutting: Audit Logging**
- Helper: `src/lib/audit.ts`
- Schema: Part of `src/lib/db/schema.ts`

### Integration Points

**Internal Communication:**
- Components → Hooks → React Query → Server Actions → Database
- Jobs → Database (direct via Drizzle)
- Jobs → Alpaca (via client wrapper)

**External Integrations:**
| Service | Integration Point | Auth Method |
|---------|-------------------|-------------|
| Authentik | `src/auth.ts` | OIDC |
| Alpaca | `src/lib/alpaca/client.ts` | API Key (encrypted) |
| Sentry | `sentry.client.config.ts`, `sentry.server.config.ts` | DSN |
| PostgreSQL | `src/lib/db/index.ts` | Connection string |

**Data Flow:**
```
User Action → Component → Hook → React Query → Server Action
    → Validation (Zod) → Auth Check → Database (Drizzle)
    → Audit Log → Return ActionResult → Update Cache → Re-render
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices verified compatible:
- Next.js 16 + React 19 + TypeScript 5 ✅
- Drizzle ORM + PostgreSQL 16 ✅
- NextAuth.js 5 + Authentik OIDC ✅
- pg-boss + PostgreSQL (same database) ✅
- React Query + Server Actions (complementary) ✅

**Pattern Consistency:**
- Naming conventions apply uniformly across database, API, and code
- ActionResult pattern used consistently for all Server Actions
- React Query patterns align with Server Action return types
- Error handling patterns work with Sentry integration

**Structure Alignment:**
- Project structure supports all architectural decisions
- Feature-based organization enables parallel development
- Clear boundaries prevent cross-contamination
- Test structure mirrors source structure

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
| FR Category | Architectural Support |
|-------------|----------------------|
| Target Management | Actions, Components, Pages, Schema ✅ |
| Aim Management | Actions, Components, Pages, Schema ✅ |
| Shot Management | Actions, Components, Pages, Schema ✅ |
| Scoring System | Pure function library, Jobs, Components ✅ |
| Alpaca Integration | Client library, Encryption, Webhooks ✅ |
| Scoreboard/Leaderboard | Components, Queries, Pages ✅ |
| User Settings | Actions, Components, Pages ✅ |

**Non-Functional Requirements Coverage:**
| NFR | Architectural Support |
|-----|----------------------|
| Multi-tenant isolation | Row-level user_id filtering in all queries ✅ |
| API key encryption | AES-256-GCM in encryption.ts ✅ |
| Audit logging | Dedicated audit.ts helper + table ✅ |
| Rate limiting | Token bucket in alpaca/rate-limiter.ts ✅ |
| Price caching | price_cache table with TTL ✅ |
| Test coverage | Co-located unit tests + E2E structure ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with rationale
- Technology versions specified where applicable
- Implementation patterns comprehensive with examples
- Consistency rules clear and enforceable

**Structure Completeness:**
- Complete directory tree with all files
- All files and directories explicitly defined
- Integration points clearly specified
- Component boundaries well-defined

**Pattern Completeness:**
- All naming conventions documented
- API response formats specified
- Error handling patterns defined
- Loading state patterns documented

### Gap Analysis Results

**No Critical Gaps Identified**

**Minor Enhancements for Future:**
- Add rate limit monitoring dashboard (post-MVP)
- Implement Redis caching layer when scale demands (Phase 3)
- Add corporate action automation via MCP (Phase 2)
- Consider WebSocket for real-time updates (Phase 3)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** HIGH

**Key Strengths:**
- Single external dependency (Alpaca) simplifies integration
- Scoring engine isolated as pure functions enables 100% test coverage
- PostgreSQL for everything (data + cache + jobs) minimizes ops burden
- Modern Next.js patterns (Server Actions + App Router) reduce boilerplate

**Areas for Future Enhancement:**
- Redis caching if PostgreSQL cache becomes bottleneck
- Real-time updates via WebSocket for live scoreboards
- Corporate action automation via external data sources

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-27
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 25+ architectural decisions made
- 12+ implementation patterns defined
- 6 major architectural components specified
- All PRD requirements fully supported

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Outvestments. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
```bash
# Project already initialized with Next.js + shadcn
# Next steps:
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
pnpm add pg-boss
pnpm add @tanstack/react-query
pnpm add -D vitest @vitejs/plugin-react
```

**Development Sequence:**
1. ✅ Initialize project using Next.js + shadcn (already done)
2. Set up Drizzle ORM and database schema (targets, aims, shots)
3. Configure pg-boss for background jobs
4. Implement authentication with Authentik
5. Build Target/Aim/Shot management features
6. Implement scoring engine
7. Add Alpaca integration
8. Build scoreboard views

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

