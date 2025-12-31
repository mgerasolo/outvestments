# Phase 2: Database Schema Additions

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-30

## Overview

This document defines the exact Drizzle schema additions for Phase 2 monetization features. All additions follow existing patterns in `src/lib/db/schema.ts`.

---

## 1. New Enums

```typescript
// User tier levels
export const userTierEnum = pgEnum("user_tier", [
  "free",
  "premium",
  "premium_plus",
]);

// How the user got their tier
export const tierSourceEnum = pgEnum("tier_source", [
  "default",        // Free tier (no action taken)
  "trial",          // 14-day trial
  "promo",          // Promo code redemption
  "admin",          // Admin manually granted
  "global_override", // System-wide promotion ("this week everyone gets premium")
  "subscription",   // Stripe subscription (Phase 4+)
  "affiliate",      // Affiliate partner benefit
]);

// Conviction level for targets
export const convictionLevelEnum = pgEnum("conviction_level", [
  "high",
  "medium",
  "low",
]);

// Aim type (playable vs monitor)
export const aimTypeEnum = pgEnum("aim_type", [
  "playable",  // Full execution, scoring, leaderboard
  "monitor",   // Paper tracking only, isolated scoring
]);

// Promo code type
export const promoTypeEnum = pgEnum("promo_type", [
  "tier_grant",       // Grants a tier for X days
  "trial_extension",  // Extends trial by X days
]);
```

---

## 2. Users Table Additions

Add these fields to the existing `users` table:

```typescript
// In users table definition, add:
tier: userTierEnum("tier").default("free").notNull(),
tierSource: tierSourceEnum("tier_source").default("default").notNull(),
tierExpiresAt: timestamp("tier_expires_at", { withTimezone: true }),
trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
referralCode: varchar("referral_code", { length: 20 }).unique(),
referredByUserId: uuid("referred_by_user_id"),
```

**Indexes to add:**
```typescript
index("users_tier_idx").on(table.tier),
index("users_tier_expires_at_idx").on(table.tierExpiresAt),
index("users_referral_code_idx").on(table.referralCode),
```

---

## 3. Targets Table Additions

Add conviction level to existing `targets` table:

```typescript
// In targets table definition, add:
convictionLevel: convictionLevelEnum("conviction_level").default("medium").notNull(),
risksIdentified: text("risks_identified"),  // User-documented risks
abortTrigger: text("abort_trigger"),        // What would make them abandon this thesis
abortTriggered: boolean("abort_triggered").default(false),
abortTriggeredAt: timestamp("abort_triggered_at", { withTimezone: true }),
```

**Note:** `confidenceLevel` (1-10 scale) already exists. `convictionLevel` is the enum (high/medium/low) for categorization. Keep both - they serve different purposes.

---

## 4. Aims Table Additions

Add aim type to existing `aims` table:

```typescript
// In aims table definition, add:
aimType: aimTypeEnum("aim_type").default("playable").notNull(),
// For monitor aims - track the entry price when monitoring started
monitorEntryPrice: decimal("monitor_entry_price", { precision: 12, scale: 4 }),
// For monitor aims - what happened (for learning analytics)
monitorOutcome: text("monitor_outcome"),  // 'correct', 'incorrect', 'partial'
aiSuggested: boolean("ai_suggested").default(false),  // Premium feature flag
```

**Index to add:**
```typescript
index("aims_aim_type_idx").on(table.aimType),
```

---

## 5. Shots Table Additions

Enhance trading discipline tracking:

```typescript
// In shots table definition, add (if not already present):
profitTargetPrice: decimal("profit_target_price", { precision: 12, scale: 4 }),
profitTargetPercent: decimal("profit_target_percent", { precision: 5, scale: 2 }),
stopLossPercent: decimal("stop_loss_percent", { precision: 5, scale: 2 }),
maxLossAmount: decimal("max_loss_amount", { precision: 12, scale: 2 }),
exitTrigger: text("exit_trigger"),  // User's documented exit conditions
exitReason: text("exit_reason"),    // Why they actually exited
stopLossHonored: boolean("stop_loss_honored"),  // Did they follow their stop loss?
profitTargetHonored: boolean("profit_target_honored"),  // Did they follow their profit target?
```

---

## 6. New Tables: Monetization

### 6.1 Global Config

System-wide configuration (for global tier overrides, feature flags).

```typescript
export const globalConfig = pgTable(
  "global_config",
  {
    key: varchar("key", { length: 100 }).primaryKey(),
    value: json("value").$type<unknown>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedBy: uuid("updated_by").references(() => users.id),
  }
);
```

**Usage examples:**
- `global_tier_override`: `{ "tier": "premium", "expires_at": "2025-01-15T00:00:00Z" }`
- `tier_limits_free`: `{ "max_targets": 3, "max_aims_per_target": 5, "max_shots_per_aim": 3 }`

### 6.2 Promo Codes

```typescript
export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).unique().notNull(),
    type: promoTypeEnum("type").notNull(),
    tierToGrant: userTierEnum("tier_to_grant"),  // For tier_grant type
    daysToGrant: integer("days_to_grant"),        // Duration of grant
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    maxUses: integer("max_uses"),                 // Null = unlimited
    maxUsesPerUser: integer("max_uses_per_user").default(1),
    currentUses: integer("current_uses").default(0).notNull(),
    newUsersOnly: boolean("new_users_only").default(false),
    minTier: userTierEnum("min_tier"),            // Minimum tier to use this code
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by").references(() => users.id),
  },
  (table) => [
    index("promo_codes_code_idx").on(table.code),
    index("promo_codes_is_active_idx").on(table.isActive),
    index("promo_codes_valid_until_idx").on(table.validUntil),
  ]
);
```

### 6.3 Promo Redemptions

```typescript
export const promoRedemptions = pgTable(
  "promo_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    promoCodeId: uuid("promo_code_id")
      .references(() => promoCodes.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    appliedUntil: timestamp("applied_until", { withTimezone: true }),
    tierGranted: userTierEnum("tier_granted"),
  },
  (table) => [
    index("promo_redemptions_user_id_idx").on(table.userId),
    index("promo_redemptions_promo_code_id_idx").on(table.promoCodeId),
    index("promo_redemptions_unique_idx").on(table.userId, table.promoCodeId),
  ]
);
```

### 6.4 Referrals

```typescript
export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referrerUserId: uuid("referrer_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    referredUserId: uuid("referred_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    codeUsed: varchar("code_used", { length: 20 }).notNull(),
    referredAt: timestamp("referred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // For future: track when referee converts to paid (Phase 4+)
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    rewardGrantedAt: timestamp("reward_granted_at", { withTimezone: true }),
    rewardType: text("reward_type"),
  },
  (table) => [
    index("referrals_referrer_idx").on(table.referrerUserId),
    index("referrals_referred_idx").on(table.referredUserId),
    index("referrals_code_used_idx").on(table.codeUsed),
  ]
);
```

### 6.5 User Acquisition Tracking

```typescript
export const userAcquisition = pgTable(
  "user_acquisition",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    source: varchar("source", { length: 50 }),  // 'organic', 'referral', 'affiliate', 'social'
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),
    utmTerm: varchar("utm_term", { length: 100 }),
    utmContent: varchar("utm_content", { length: 100 }),
    referralCodeUsed: varchar("referral_code_used", { length: 20 }),
    affiliateCodeUsed: varchar("affiliate_code_used", { length: 50 }),
    landingPage: text("landing_page"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_acquisition_user_id_idx").on(table.userId),
    index("user_acquisition_source_idx").on(table.source),
    index("user_acquisition_referral_code_idx").on(table.referralCodeUsed),
  ]
);
```

### 6.6 User Discipline Stats (Aggregates)

```typescript
export const userDisciplineStats = pgTable(
  "user_discipline_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    totalShots: integer("total_shots").default(0).notNull(),
    stopLossHonoredCount: integer("stop_loss_honored_count").default(0).notNull(),
    stopLossIgnoredCount: integer("stop_loss_ignored_count").default(0).notNull(),
    profitTargetHonoredCount: integer("profit_target_honored_count").default(0).notNull(),
    profitTargetIgnoredCount: integer("profit_target_ignored_count").default(0).notNull(),
    abortTriggerHonoredCount: integer("abort_trigger_honored_count").default(0).notNull(),
    abortTriggerIgnoredCount: integer("abort_trigger_ignored_count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_discipline_stats_user_id_idx").on(table.userId),
  ]
);
```

---

## 7. Tier Resolution Logic

**Resolution Order:** `global_override > admin > subscription > promo > trial > free`

```typescript
// src/lib/tier-resolver.ts

import { db } from "@/lib/db";
import { users, globalConfig } from "@/lib/db/schema";

export type EffectiveTier = {
  tier: "free" | "premium" | "premium_plus";
  source: string;
  expiresAt: Date | null;
};

export async function getEffectiveTier(userId: string): Promise<EffectiveTier> {
  // 1. Check global override first
  const globalOverride = await db.query.globalConfig.findFirst({
    where: eq(globalConfig.key, "global_tier_override"),
  });

  if (globalOverride?.value) {
    const override = globalOverride.value as { tier: string; expires_at: string };
    const expiresAt = new Date(override.expires_at);
    if (expiresAt > new Date()) {
      return {
        tier: override.tier as EffectiveTier["tier"],
        source: "global_override",
        expiresAt,
      };
    }
  }

  // 2. Get user's stored tier
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new Error("User not found");

  // 3. Check if tier is expired
  if (user.tierExpiresAt && user.tierExpiresAt < new Date()) {
    // Tier expired, return free
    return { tier: "free", source: "default", expiresAt: null };
  }

  // 4. Return user's tier
  return {
    tier: user.tier,
    source: user.tierSource,
    expiresAt: user.tierExpiresAt,
  };
}
```

---

## 8. Tier Limits Configuration

Store in `global_config` table:

```typescript
// Key: tier_limits
// Value:
{
  "free": {
    "max_targets": 3,
    "max_aims_per_target": 5,
    "max_shots_per_aim": 3,
    "max_watchlist_items": 10
  },
  "premium": {
    "max_targets": 25,
    "max_aims_per_target": 15,
    "max_shots_per_aim": 10,
    "max_watchlist_items": 100
  },
  "premium_plus": {
    "max_targets": null,  // unlimited
    "max_aims_per_target": null,
    "max_shots_per_aim": null,
    "max_watchlist_items": null
  }
}
```

---

## 9. Relations Updates

Add to existing relations:

```typescript
// Add to usersRelations
promoRedemptions: many(promoRedemptions),
referralsMade: many(referrals, { relationName: "referrer" }),
referredBy: one(referrals, { relationName: "referred" }),
acquisition: one(userAcquisition),
disciplineStats: one(userDisciplineStats),

// New relation definitions
export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  redemptions: many(promoRedemptions),
}));

export const promoRedemptionsRelations = relations(promoRedemptions, ({ one }) => ({
  promoCode: one(promoCodes, {
    fields: [promoRedemptions.promoCodeId],
    references: [promoCodes.id],
  }),
  user: one(users, {
    fields: [promoRedemptions.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerUserId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const userAcquisitionRelations = relations(userAcquisition, ({ one }) => ({
  user: one(users, {
    fields: [userAcquisition.userId],
    references: [users.id],
  }),
}));

export const userDisciplineStatsRelations = relations(userDisciplineStats, ({ one }) => ({
  user: one(users, {
    fields: [userDisciplineStats.userId],
    references: [users.id],
  }),
}));
```

---

## 10. Type Exports

Add to existing type exports:

```typescript
export type UserTier = (typeof userTierEnum.enumValues)[number];
export type TierSource = (typeof tierSourceEnum.enumValues)[number];
export type ConvictionLevel = (typeof convictionLevelEnum.enumValues)[number];
export type AimType = (typeof aimTypeEnum.enumValues)[number];
export type PromoType = (typeof promoTypeEnum.enumValues)[number];

export type GlobalConfig = typeof globalConfig.$inferSelect;
export type NewGlobalConfig = typeof globalConfig.$inferInsert;

export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;

export type PromoRedemption = typeof promoRedemptions.$inferSelect;
export type NewPromoRedemption = typeof promoRedemptions.$inferInsert;

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

export type UserAcquisition = typeof userAcquisition.$inferSelect;
export type NewUserAcquisition = typeof userAcquisition.$inferInsert;

export type UserDisciplineStats = typeof userDisciplineStats.$inferSelect;
export type NewUserDisciplineStats = typeof userDisciplineStats.$inferInsert;
```

---

## 11. Migration Notes

1. Run `npx drizzle-kit generate` after adding schema changes
2. Review generated SQL before pushing
3. For production: `npx drizzle-kit push` or use Docker entrypoint migration

**Breaking changes:** None - all additions are new columns with defaults or new tables.

---

## Appendix: Full Schema Diff Summary

| Table | Change Type | Fields Added |
|-------|-------------|--------------|
| `users` | MODIFY | `tier`, `tier_source`, `tier_expires_at`, `trial_started_at`, `trial_ends_at`, `referral_code`, `referred_by_user_id` |
| `targets` | MODIFY | `conviction_level`, `risks_identified`, `abort_trigger`, `abort_triggered`, `abort_triggered_at` |
| `aims` | MODIFY | `aim_type`, `monitor_entry_price`, `monitor_outcome`, `ai_suggested` |
| `shots` | MODIFY | `profit_target_price`, `profit_target_percent`, `stop_loss_percent`, `max_loss_amount`, `exit_trigger`, `exit_reason`, `stop_loss_honored`, `profit_target_honored` |
| `global_config` | NEW | Full table |
| `promo_codes` | NEW | Full table |
| `promo_redemptions` | NEW | Full table |
| `referrals` | NEW | Full table |
| `user_acquisition` | NEW | Full table |
| `user_discipline_stats` | NEW | Full table |
