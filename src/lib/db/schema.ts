import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  json,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", [
  "viewer",
  "user",
  "power_user",
  "admin",
]);

export const targetTypeEnum = pgEnum("target_type", [
  "growth",
  "value",
  "momentum",
  "dividend",
  "speculative",
]);

export const targetStatusEnum = pgEnum("target_status", [
  "active",
  "watching",
  "archived",
]);

export const directionEnum = pgEnum("direction", ["buy", "sell"]);

export const triggerTypeEnum = pgEnum("trigger_type", ["market", "limit"]);

export const shotTypeEnum = pgEnum("shot_type", ["stock", "option"]);

export const shotStateEnum = pgEnum("shot_state", [
  "pending",
  "armed",
  "fired",
  "active",
  "closed",
]);

// ============================================================================
// Tables
// ============================================================================

/**
 * Users table - stores user accounts linked to Authentik SSO
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authentikSub: text("authentik_sub").unique().notNull(),
    email: text("email").unique().notNull(),
    name: text("name"),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_authentik_sub_idx").on(table.authentikSub),
    index("users_email_idx").on(table.email),
  ]
);

/**
 * Targets table - investment thesis and research targets
 */
export const targets = pgTable(
  "targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    thesis: text("thesis").notNull(),
    targetType: targetTypeEnum("target_type").notNull(),
    catalyst: text("catalyst"),
    tags: json("tags").$type<string[]>().default([]),
    status: targetStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("targets_user_id_idx").on(table.userId),
    index("targets_status_idx").on(table.status),
    index("targets_deleted_at_idx").on(table.deletedAt),
  ]
);

/**
 * Aims table - specific price targets for a target
 */
export const aims = pgTable(
  "aims",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    targetId: uuid("target_id")
      .references(() => targets.id, { onDelete: "cascade" })
      .notNull(),
    symbol: text("symbol").notNull(),
    targetPriceRealistic: decimal("target_price_realistic", {
      precision: 12,
      scale: 4,
    }).notNull(),
    targetPriceReach: decimal("target_price_reach", {
      precision: 12,
      scale: 4,
    }),
    targetDate: timestamp("target_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("aims_target_id_idx").on(table.targetId),
    index("aims_symbol_idx").on(table.symbol),
    index("aims_deleted_at_idx").on(table.deletedAt),
  ]
);

/**
 * Shots table - individual trade entries/exits
 */
export const shots = pgTable(
  "shots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    aimId: uuid("aim_id").references(() => aims.id, { onDelete: "set null" }),
    direction: directionEnum("direction").notNull(),
    entryPrice: decimal("entry_price", { precision: 12, scale: 4 }).notNull(),
    entryDate: timestamp("entry_date", { withTimezone: true }).notNull(),
    positionSize: decimal("position_size", { precision: 12, scale: 4 }),
    triggerType: triggerTypeEnum("trigger_type").default("market").notNull(),
    shotType: shotTypeEnum("shot_type").default("stock").notNull(),
    state: shotStateEnum("state").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("shots_aim_id_idx").on(table.aimId),
    index("shots_state_idx").on(table.state),
    index("shots_deleted_at_idx").on(table.deletedAt),
  ]
);

/**
 * Scores table - performance metrics for completed shots
 */
export const scores = pgTable(
  "scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shotId: uuid("shot_id")
      .references(() => shots.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    accuracy: decimal("accuracy", { precision: 5, scale: 4 }).notNull(),
    performance: decimal("performance", { precision: 8, scale: 4 }).notNull(),
    difficulty: decimal("difficulty", { precision: 5, scale: 4 }).notNull(),
    trajectory: decimal("trajectory", { precision: 5, scale: 4 }).notNull(),
    ppd: decimal("ppd", { precision: 10, scale: 4 }).notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("scores_shot_id_idx").on(table.shotId)]
);

/**
 * Audit logs table - tracks all user actions for compliance
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    payload: json("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_entity_type_idx").on(table.entityType),
    index("audit_logs_entity_id_idx").on(table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

/**
 * Price cache table - caches stock prices to reduce API calls
 */
export const priceCache = pgTable(
  "price_cache",
  {
    symbol: text("symbol").primaryKey(),
    price: decimal("price", { precision: 12, scale: 4 }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    source: text("source").notNull(),
  },
  (table) => [index("price_cache_fetched_at_idx").on(table.fetchedAt)]
);

/**
 * Alpaca credentials table - encrypted API credentials for paper trading
 */
export const alpacaCredentials = pgTable(
  "alpaca_credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    encryptedSecret: text("encrypted_secret").notNull(),
    iv: text("iv").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("alpaca_credentials_user_id_idx").on(table.userId)]
);

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  targets: many(targets),
  auditLogs: many(auditLogs),
  alpacaCredentials: one(alpacaCredentials),
}));

export const targetsRelations = relations(targets, ({ one, many }) => ({
  user: one(users, {
    fields: [targets.userId],
    references: [users.id],
  }),
  aims: many(aims),
}));

export const aimsRelations = relations(aims, ({ one, many }) => ({
  target: one(targets, {
    fields: [aims.targetId],
    references: [targets.id],
  }),
  shots: many(shots),
}));

export const shotsRelations = relations(shots, ({ one }) => ({
  aim: one(aims, {
    fields: [shots.aimId],
    references: [aims.id],
  }),
  score: one(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  shot: one(shots, {
    fields: [scores.shotId],
    references: [shots.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const alpacaCredentialsRelations = relations(
  alpacaCredentials,
  ({ one }) => ({
    user: one(users, {
      fields: [alpacaCredentials.userId],
      references: [users.id],
    }),
  })
);

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;

export type Aim = typeof aims.$inferSelect;
export type NewAim = typeof aims.$inferInsert;

export type Shot = typeof shots.$inferSelect;
export type NewShot = typeof shots.$inferInsert;

export type Score = typeof scores.$inferSelect;
export type NewScore = typeof scores.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type PriceCache = typeof priceCache.$inferSelect;
export type NewPriceCache = typeof priceCache.$inferInsert;

export type AlpacaCredentials = typeof alpacaCredentials.$inferSelect;
export type NewAlpacaCredentials = typeof alpacaCredentials.$inferInsert;

// Enum type exports for use in application code
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type TargetType = (typeof targetTypeEnum.enumValues)[number];
export type TargetStatus = (typeof targetStatusEnum.enumValues)[number];
export type Direction = (typeof directionEnum.enumValues)[number];
export type TriggerType = (typeof triggerTypeEnum.enumValues)[number];
export type ShotType = (typeof shotTypeEnum.enumValues)[number];
export type ShotState = (typeof shotStateEnum.enumValues)[number];
