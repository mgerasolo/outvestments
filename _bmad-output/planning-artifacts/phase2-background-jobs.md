# Phase 2: Background Jobs

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-30

## Overview

This document defines background jobs for Phase 2 monetization features. These jobs handle tier expiration, promo code cleanup, and related maintenance tasks.

---

## 1. Job Architecture

### Existing Pattern

Jobs are defined in `src/lib/jobs/handlers/` and registered with the job queue system.

```typescript
// src/lib/jobs/handlers/index.ts
export { cacheCleanupHandler } from "./cache-cleanup";
export { eodSnapshotHandler } from "./eod-snapshot";
// Add new handlers below
export { tierExpirationHandler } from "./tier-expiration";
export { promoCleanupHandler } from "./promo-cleanup";
export { globalOverrideCheckHandler } from "./global-override-check";
```

### Job Scheduling

Jobs are scheduled via cron-like expressions or triggered by events.

| Job | Schedule | Priority |
|-----|----------|----------|
| Tier Expiration | Daily at 00:15 UTC | High |
| Global Override Check | Hourly | Medium |
| Promo Code Cleanup | Weekly on Sunday 02:00 UTC | Low |
| Discipline Stats Rollup | Daily at 01:00 UTC | Medium |

---

## 2. Tier Expiration Job

### Purpose
Downgrade users whose tier has expired back to Free.

### Schedule
Daily at 00:15 UTC (just after midnight)

### Logic

```typescript
// src/lib/jobs/handlers/tier-expiration.ts

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { lt, and, isNotNull, ne } from "drizzle-orm";

export async function tierExpirationHandler() {
  const now = new Date();

  // Find users with expired tiers (not already free)
  const expiredUsers = await db
    .select({ id: users.id, email: users.email, tier: users.tier })
    .from(users)
    .where(
      and(
        lt(users.tierExpiresAt, now),
        ne(users.tier, "free"),
        isNotNull(users.tierExpiresAt)
      )
    );

  console.log(`[tier-expiration] Found ${expiredUsers.length} users with expired tiers`);

  for (const user of expiredUsers) {
    await db
      .update(users)
      .set({
        tier: "free",
        tierSource: "default",
        tierExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    console.log(`[tier-expiration] Downgraded user ${user.id} from ${user.tier} to free`);

    // Optional: Queue email notification
    // await queueEmail({ to: user.email, template: "tier-expired" });
  }

  return {
    processed: expiredUsers.length,
    timestamp: now.toISOString(),
  };
}
```

### Error Handling

| Error | Action |
|-------|--------|
| DB connection failure | Retry job in 5 minutes |
| Single user update fails | Log error, continue with others |
| All updates fail | Alert admin, retry job |

---

## 3. Global Override Check Job

### Purpose
Clear expired global tier overrides.

### Schedule
Hourly

### Logic

```typescript
// src/lib/jobs/handlers/global-override-check.ts

import { db } from "@/lib/db";
import { globalConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function globalOverrideCheckHandler() {
  const now = new Date();

  const override = await db.query.globalConfig.findFirst({
    where: eq(globalConfig.key, "global_tier_override"),
  });

  if (!override) {
    console.log("[global-override] No override configured");
    return { action: "none" };
  }

  const value = override.value as { tier: string; expires_at: string };
  const expiresAt = new Date(value.expires_at);

  if (expiresAt < now) {
    // Override has expired, delete it
    await db.delete(globalConfig).where(eq(globalConfig.key, "global_tier_override"));

    console.log(`[global-override] Cleared expired override (was: ${value.tier})`);

    return {
      action: "cleared",
      previousTier: value.tier,
      expiredAt: value.expires_at,
    };
  }

  console.log(`[global-override] Override still active until ${value.expires_at}`);
  return {
    action: "active",
    tier: value.tier,
    expiresAt: value.expires_at,
  };
}
```

---

## 4. Promo Code Cleanup Job

### Purpose
Deactivate expired promo codes and clean up old redemption data.

### Schedule
Weekly on Sunday at 02:00 UTC

### Logic

```typescript
// src/lib/jobs/handlers/promo-cleanup.ts

import { db } from "@/lib/db";
import { promoCodes, promoRedemptions } from "@/lib/db/schema";
import { lt, and, eq } from "drizzle-orm";

export async function promoCleanupHandler() {
  const now = new Date();
  const retentionDays = 365; // Keep redemption records for 1 year
  const retentionDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

  // 1. Deactivate expired promo codes
  const expiredCodes = await db
    .update(promoCodes)
    .set({ isActive: false })
    .where(
      and(
        lt(promoCodes.validUntil, now),
        eq(promoCodes.isActive, true)
      )
    )
    .returning({ id: promoCodes.id, code: promoCodes.code });

  console.log(`[promo-cleanup] Deactivated ${expiredCodes.length} expired codes`);

  // 2. Delete old redemption records (older than retention period)
  const deletedRedemptions = await db
    .delete(promoRedemptions)
    .where(lt(promoRedemptions.redeemedAt, retentionDate))
    .returning({ id: promoRedemptions.id });

  console.log(`[promo-cleanup] Deleted ${deletedRedemptions.length} old redemption records`);

  return {
    codesDeactivated: expiredCodes.length,
    redemptionsDeleted: deletedRedemptions.length,
    timestamp: now.toISOString(),
  };
}
```

---

## 5. Discipline Stats Rollup Job

### Purpose
Update aggregate discipline stats for all users based on their shots.

### Schedule
Daily at 01:00 UTC (after EOD snapshot)

### Logic

```typescript
// src/lib/jobs/handlers/discipline-stats-rollup.ts

import { db } from "@/lib/db";
import { users, shots, aims, targets, userDisciplineStats } from "@/lib/db/schema";
import { eq, isNotNull, sql, count, and } from "drizzle-orm";

export async function disciplineStatsRollupHandler() {
  const now = new Date();

  // Get all users
  const allUsers = await db.select({ id: users.id }).from(users);

  let updated = 0;

  for (const user of allUsers) {
    // Count shots and discipline metrics
    const stats = await db
      .select({
        totalShots: count(),
        stopLossHonored: sql<number>`COUNT(*) FILTER (WHERE ${shots.stopLossHonored} = true)`,
        stopLossIgnored: sql<number>`COUNT(*) FILTER (WHERE ${shots.stopLossHonored} = false)`,
        profitTargetHonored: sql<number>`COUNT(*) FILTER (WHERE ${shots.profitTargetHonored} = true)`,
        profitTargetIgnored: sql<number>`COUNT(*) FILTER (WHERE ${shots.profitTargetHonored} = false)`,
      })
      .from(shots)
      .innerJoin(aims, eq(shots.aimId, aims.id))
      .innerJoin(targets, eq(aims.targetId, targets.id))
      .where(eq(targets.userId, user.id))
      .then((r) => r[0]);

    // Count abort triggers from targets
    const abortStats = await db
      .select({
        honored: sql<number>`COUNT(*) FILTER (WHERE ${targets.abortTriggered} = true)`,
        ignored: sql<number>`COUNT(*) FILTER (WHERE ${targets.abortTrigger} IS NOT NULL AND ${targets.abortTriggered} = false)`,
      })
      .from(targets)
      .where(eq(targets.userId, user.id))
      .then((r) => r[0]);

    // Upsert discipline stats
    await db
      .insert(userDisciplineStats)
      .values({
        userId: user.id,
        totalShots: stats.totalShots,
        stopLossHonoredCount: stats.stopLossHonored,
        stopLossIgnoredCount: stats.stopLossIgnored,
        profitTargetHonoredCount: stats.profitTargetHonored,
        profitTargetIgnoredCount: stats.profitTargetIgnored,
        abortTriggerHonoredCount: abortStats.honored,
        abortTriggerIgnoredCount: abortStats.ignored,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userDisciplineStats.userId,
        set: {
          totalShots: stats.totalShots,
          stopLossHonoredCount: stats.stopLossHonored,
          stopLossIgnoredCount: stats.stopLossIgnored,
          profitTargetHonoredCount: stats.profitTargetHonored,
          profitTargetIgnoredCount: stats.profitTargetIgnored,
          abortTriggerHonoredCount: abortStats.honored,
          abortTriggerIgnoredCount: abortStats.ignored,
          updatedAt: now,
        },
      });

    updated++;
  }

  console.log(`[discipline-stats] Updated stats for ${updated} users`);

  return {
    usersUpdated: updated,
    timestamp: now.toISOString(),
  };
}
```

---

## 6. Trial Reminder Job (Future Enhancement)

### Purpose
Send email reminders to users whose trials are expiring soon.

### Schedule
Daily at 09:00 UTC (reasonable time for emails)

### Logic (Placeholder for Phase 4+)

```typescript
// src/lib/jobs/handlers/trial-reminder.ts

export async function trialReminderHandler() {
  const now = new Date();

  // Users with trials expiring in 3 days
  const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Users with trials expiring in 1 day
  const oneDayOut = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  // TODO: Implement when email service is set up
  // 1. Find users with trial_ends_at between now and 3 days
  // 2. Filter out users already notified
  // 3. Queue email notifications
  // 4. Mark users as notified

  return {
    status: "not_implemented",
    message: "Email service not configured",
  };
}
```

---

## 7. Job Registration

### Cron Configuration

```typescript
// src/lib/jobs/scheduler.ts

import { tierExpirationHandler } from "./handlers/tier-expiration";
import { globalOverrideCheckHandler } from "./handlers/global-override-check";
import { promoCleanupHandler } from "./handlers/promo-cleanup";
import { disciplineStatsRollupHandler } from "./handlers/discipline-stats-rollup";

export const scheduledJobs = [
  {
    name: "tier-expiration",
    cron: "15 0 * * *", // Daily at 00:15 UTC
    handler: tierExpirationHandler,
  },
  {
    name: "global-override-check",
    cron: "0 * * * *", // Every hour
    handler: globalOverrideCheckHandler,
  },
  {
    name: "promo-cleanup",
    cron: "0 2 * * 0", // Sunday at 02:00 UTC
    handler: promoCleanupHandler,
  },
  {
    name: "discipline-stats-rollup",
    cron: "0 1 * * *", // Daily at 01:00 UTC
    handler: disciplineStatsRollupHandler,
  },
];
```

---

## 8. Monitoring & Alerting

### Job Metrics to Track

| Metric | Alert Threshold |
|--------|-----------------|
| Job execution time | > 5 minutes |
| Job failure rate | > 10% in 24h |
| Users downgraded | Log only (no alert) |
| Promo codes deactivated | Log only |

### Logging Format

```
[job-name] Action description
[job-name] Result: { key: value }
```

Example:
```
[tier-expiration] Found 5 users with expired tiers
[tier-expiration] Downgraded user abc-123 from premium to free
[tier-expiration] Result: { processed: 5, timestamp: "2025-01-01T00:15:00Z" }
```

---

## 9. Manual Triggers

For admin use, jobs can be triggered manually via API:

```typescript
// src/app/api/admin/jobs/[name]/route.ts

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = scheduledJobs.find((j) => j.name === params.name);
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    const result = await job.handler();
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Job Summary

| Job | Purpose | Schedule | Runtime |
|-----|---------|----------|---------|
| `tier-expiration` | Downgrade expired tiers | Daily 00:15 | < 1 min |
| `global-override-check` | Clear expired overrides | Hourly | < 5 sec |
| `promo-cleanup` | Deactivate old promos | Weekly Sun 02:00 | < 1 min |
| `discipline-stats-rollup` | Aggregate user stats | Daily 01:00 | 1-5 min |
| `trial-reminder` | Email reminders | Daily 09:00 | (Future) |
