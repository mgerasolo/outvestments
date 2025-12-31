# Phase 2: Feature Flags & Tier Gating

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-30

## Overview

This document defines how features are gated by tier, including usage limits, warning thresholds, and blocking behavior.

---

## 1. Tier Limits

### Usage Limits by Tier

| Resource | Free | Premium | Premium Plus |
|----------|:----:|:-------:|:------------:|
| Active Targets | 3 | 25 | Unlimited |
| Aims per Target | 5 | 15 | Unlimited |
| Shots per Aim | 3 | 10 | Unlimited |
| Watchlist Items | 10 | 100 | Unlimited |
| Monitor Aims | 2 per target | 10 per target | Unlimited |
| History Retention | 90 days | 1 year | Unlimited |

### Warning & Blocking Thresholds

| Threshold | Behavior |
|-----------|----------|
| **90% of limit** | Show warning banner ("You've used 9 of 10 watchlist slots") |
| **100% of limit** | Block creation, show upgrade prompt |

---

## 2. Feature Availability by Tier

### Core Features

| Feature | Free | Premium | Premium Plus |
|---------|:----:|:-------:|:------------:|
| Create Targets | Yes (limited) | Yes | Yes |
| Create Aims | Yes (limited) | Yes | Yes |
| Create Shots | Yes (limited) | Yes | Yes |
| Manual Trade Entry | Yes | Yes | Yes |
| Basic Scoring (3-metric) | Yes | Yes | Yes |
| Leaderboard View | Yes | Yes | Yes |
| Portfolio View | Yes | Yes | Yes |

### Premium Features

| Feature | Free | Premium | Premium Plus |
|---------|:----:|:-------:|:------------:|
| Alpaca Integration | No | Yes | Yes |
| Real-time Execution | No | Yes | Yes |
| Extended History | No | Yes | Yes |
| Monitor Aims (unlimited) | No | Yes | Yes |
| AI-suggested Monitor Aims | No | No | Yes |
| Advanced Analytics | No | Partial | Yes |
| 8-Metric Scoring | No | Yes | Yes |
| Data Export (CSV) | No | Yes | Yes |
| API Access | No | No | Yes |

### Trading Discipline Features

| Feature | Free | Premium | Premium Plus |
|---------|:----:|:-------:|:------------:|
| Conviction Levels | Yes | Yes | Yes |
| Risk Documentation | Yes | Yes | Yes |
| Abort Triggers | Yes | Yes | Yes |
| Stop Loss Tracking | Yes | Yes | Yes |
| Discipline Stats | Basic | Full | Full + AI Insights |
| Pattern Analysis | No | No | Yes |

---

## 3. Implementation Pattern

### Feature Flag Service

```typescript
// src/lib/features/feature-flags.ts

import { getEffectiveTier } from "@/lib/tier-resolver";

export type FeatureKey =
  | "alpaca_integration"
  | "realtime_execution"
  | "extended_history"
  | "unlimited_monitor_aims"
  | "ai_suggested_aims"
  | "advanced_analytics"
  | "eight_metric_scoring"
  | "data_export"
  | "api_access"
  | "discipline_insights"
  | "pattern_analysis";

const FEATURE_TIERS: Record<FeatureKey, ("free" | "premium" | "premium_plus")[]> = {
  alpaca_integration: ["premium", "premium_plus"],
  realtime_execution: ["premium", "premium_plus"],
  extended_history: ["premium", "premium_plus"],
  unlimited_monitor_aims: ["premium", "premium_plus"],
  ai_suggested_aims: ["premium_plus"],
  advanced_analytics: ["premium_plus"],  // Partial for premium handled separately
  eight_metric_scoring: ["premium", "premium_plus"],
  data_export: ["premium", "premium_plus"],
  api_access: ["premium_plus"],
  discipline_insights: ["premium_plus"],
  pattern_analysis: ["premium_plus"],
};

export async function hasFeature(userId: string, feature: FeatureKey): Promise<boolean> {
  const { tier } = await getEffectiveTier(userId);
  return FEATURE_TIERS[feature].includes(tier);
}

export async function getAvailableFeatures(userId: string): Promise<FeatureKey[]> {
  const { tier } = await getEffectiveTier(userId);
  return Object.entries(FEATURE_TIERS)
    .filter(([_, tiers]) => tiers.includes(tier))
    .map(([feature]) => feature as FeatureKey);
}
```

### Usage Limit Service

```typescript
// src/lib/features/usage-limits.ts

import { db } from "@/lib/db";
import { targets, aims, shots, watchlist, globalConfig } from "@/lib/db/schema";
import { getEffectiveTier } from "@/lib/tier-resolver";
import { eq, and, isNull, count } from "drizzle-orm";

export type ResourceType = "targets" | "aims" | "shots" | "watchlist" | "monitor_aims";

export type UsageStatus = {
  current: number;
  limit: number | null;  // null = unlimited
  percentage: number;
  status: "ok" | "warning" | "blocked";
  message?: string;
};

const DEFAULT_LIMITS = {
  free: {
    targets: 3,
    aims_per_target: 5,
    shots_per_aim: 3,
    watchlist: 10,
    monitor_aims_per_target: 2,
  },
  premium: {
    targets: 25,
    aims_per_target: 15,
    shots_per_aim: 10,
    watchlist: 100,
    monitor_aims_per_target: 10,
  },
  premium_plus: {
    targets: null,  // unlimited
    aims_per_target: null,
    shots_per_aim: null,
    watchlist: null,
    monitor_aims_per_target: null,
  },
};

export async function getUsageStatus(
  userId: string,
  resource: ResourceType,
  parentId?: string  // For aims (targetId) or shots (aimId)
): Promise<UsageStatus> {
  const { tier } = await getEffectiveTier(userId);
  const limits = DEFAULT_LIMITS[tier];

  let current: number;
  let limitKey: keyof typeof limits;

  switch (resource) {
    case "targets":
      limitKey = "targets";
      current = await db
        .select({ count: count() })
        .from(targets)
        .where(and(eq(targets.userId, userId), isNull(targets.deletedAt)))
        .then((r) => r[0].count);
      break;

    case "aims":
      if (!parentId) throw new Error("parentId required for aims");
      limitKey = "aims_per_target";
      current = await db
        .select({ count: count() })
        .from(aims)
        .where(and(eq(aims.targetId, parentId), isNull(aims.deletedAt)))
        .then((r) => r[0].count);
      break;

    case "shots":
      if (!parentId) throw new Error("parentId required for shots");
      limitKey = "shots_per_aim";
      current = await db
        .select({ count: count() })
        .from(shots)
        .where(and(eq(shots.aimId, parentId), isNull(shots.deletedAt)))
        .then((r) => r[0].count);
      break;

    case "watchlist":
      limitKey = "watchlist";
      current = await db
        .select({ count: count() })
        .from(watchlist)
        .where(eq(watchlist.userId, userId))
        .then((r) => r[0].count);
      break;

    case "monitor_aims":
      if (!parentId) throw new Error("parentId required for monitor_aims");
      limitKey = "monitor_aims_per_target";
      current = await db
        .select({ count: count() })
        .from(aims)
        .where(
          and(
            eq(aims.targetId, parentId),
            eq(aims.aimType, "monitor"),
            isNull(aims.deletedAt)
          )
        )
        .then((r) => r[0].count);
      break;
  }

  const limit = limits[limitKey];

  // Unlimited
  if (limit === null) {
    return { current, limit: null, percentage: 0, status: "ok" };
  }

  const percentage = Math.round((current / limit) * 100);

  if (current >= limit) {
    return {
      current,
      limit,
      percentage: 100,
      status: "blocked",
      message: `You've reached your limit of ${limit} ${resource.replace("_", " ")}. Upgrade to add more.`,
    };
  }

  if (percentage >= 90) {
    return {
      current,
      limit,
      percentage,
      status: "warning",
      message: `You've used ${current} of ${limit} ${resource.replace("_", " ")}.`,
    };
  }

  return { current, limit, percentage, status: "ok" };
}

export async function canCreate(
  userId: string,
  resource: ResourceType,
  parentId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getUsageStatus(userId, resource, parentId);

  if (status.status === "blocked") {
    return { allowed: false, reason: status.message };
  }

  return { allowed: true };
}
```

---

## 4. UI Components

### Usage Warning Banner

```typescript
// src/components/tier/usage-warning.tsx

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface UsageWarningProps {
  current: number;
  limit: number;
  resource: string;
}

export function UsageWarning({ current, limit, resource }: UsageWarningProps) {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You've used {current} of {limit} {resource}.
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/upgrade">View Plans</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

### Feature Gate Component

```typescript
// src/components/tier/feature-gate.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  hasAccess: boolean;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  children,
  hasAccess,
  fallback,
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
        <div className="text-center p-4">
          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {feature} requires Premium
          </p>
          <Button size="sm" asChild>
            <Link href="/settings/upgrade">Upgrade</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Blocked Creation Modal

```typescript
// src/components/tier/limit-reached-modal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

interface LimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: string;
  limit: number;
}

export function LimitReachedModal({
  open,
  onOpenChange,
  resource,
  limit,
}: LimitReachedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've reached your limit of {limit} {resource} on the Free plan.
            Upgrade to Premium for higher limits.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button asChild>
            <Link href="/settings/upgrade">View Plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. Server Action Pattern

### Protected Action with Limit Check

```typescript
// src/app/actions/targets.ts

"use server";

import { auth } from "@/auth";
import { canCreate, getUsageStatus } from "@/lib/features/usage-limits";

export async function createTarget(data: CreateTargetInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check limit before creating
  const { allowed, reason } = await canCreate(session.user.id, "targets");
  if (!allowed) {
    return { success: false, error: reason };
  }

  // Proceed with creation...
}

// Return usage status for UI
export async function getTargetUsage() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return getUsageStatus(session.user.id, "targets");
}
```

---

## 6. Feature Flag Checks in UI

### Dashboard Example

```typescript
// src/app/(protected)/dashboard/page.tsx

import { hasFeature } from "@/lib/features/feature-flags";
import { getUsageStatus } from "@/lib/features/usage-limits";
import { UsageWarning } from "@/components/tier/usage-warning";
import { FeatureGate } from "@/components/tier/feature-gate";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [targetUsage, hasAlpaca, hasAdvancedAnalytics] = await Promise.all([
    getUsageStatus(userId, "targets"),
    hasFeature(userId, "alpaca_integration"),
    hasFeature(userId, "advanced_analytics"),
  ]);

  return (
    <div>
      {targetUsage.status === "warning" && (
        <UsageWarning
          current={targetUsage.current}
          limit={targetUsage.limit!}
          resource="targets"
        />
      )}

      {/* Regular content */}
      <TargetsList />

      {/* Gated feature */}
      <FeatureGate feature="Alpaca Integration" hasAccess={hasAlpaca}>
        <AlpacaPortfolioWidget />
      </FeatureGate>
    </div>
  );
}
```

---

## 7. Admin Override

### Setting Global Tier Override

```typescript
// src/app/actions/admin.ts

"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { globalConfig, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function setGlobalTierOverride(
  tier: "premium" | "premium_plus",
  expiresAt: Date
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check admin role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (user?.role !== "admin") throw new Error("Forbidden");

  await db
    .insert(globalConfig)
    .values({
      key: "global_tier_override",
      value: { tier, expires_at: expiresAt.toISOString() },
      updatedBy: session.user.id,
    })
    .onConflictDoUpdate({
      target: globalConfig.key,
      set: {
        value: { tier, expires_at: expiresAt.toISOString() },
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
    });

  return { success: true };
}

export async function clearGlobalTierOverride() {
  const session = await auth();
  // ... admin check ...

  await db.delete(globalConfig).where(eq(globalConfig.key, "global_tier_override"));

  return { success: true };
}
```

---

## 8. Testing Feature Flags

### Manual Testing Checklist

| Scenario | Test Steps | Expected Result |
|----------|------------|-----------------|
| Free user at 90% targets | Create 3rd target (of 3) | Warning banner appears |
| Free user at 100% targets | Try to create 4th target | Modal blocks creation, shows upgrade |
| Premium user | Create 4+ targets | No warnings, creation succeeds |
| Global override active | Any user checks tier | Returns overridden tier |
| Admin grants tier | Admin sets user to premium | User sees premium features |
| Tier expires | Wait for expiration | User reverts to free |

---

## Appendix: Feature Inventory

Complete list of features and their tier requirements:

| ID | Feature | Free | Premium | Premium Plus | Location |
|----|---------|:----:|:-------:|:------------:|----------|
| F1 | Create Targets | 3 max | 25 max | Unlimited | /targets |
| F2 | Create Aims | 5/target | 15/target | Unlimited | /targets/[id] |
| F3 | Create Shots | 3/aim | 10/aim | Unlimited | /targets/[id]/aims/[id] |
| F4 | Watchlist | 10 max | 100 max | Unlimited | /watchlist |
| F5 | Monitor Aims | 2/target | 10/target | Unlimited | /targets/[id] |
| F6 | Alpaca Integration | No | Yes | Yes | /settings/alpaca |
| F7 | Real-time Execution | No | Yes | Yes | Shot creation |
| F8 | 8-Metric Scoring | No | Yes | Yes | /scoreboard |
| F9 | Extended History | 90 days | 1 year | Unlimited | /history |
| F10 | Data Export | No | CSV | CSV + API | /settings |
| F11 | AI Suggested Aims | No | No | Yes | Aim creation |
| F12 | Pattern Analysis | No | No | Yes | /insights |
| F13 | API Access | No | No | Yes | /settings/api |
| F14 | Discipline Insights | Basic | Full | Full + AI | /discipline |
