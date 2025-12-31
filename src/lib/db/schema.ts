import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  json,
  decimal,
  index,
  boolean,
  varchar,
  integer,
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
  "partially_closed",
]);

export const marketTypeEnum = pgEnum("market_type", [
  "stock",
  "etf",
  "crypto",
  "forex",
  "index",
]);

export const aimStatusEnum = pgEnum("aim_status", [
  "active",      // Aim is active, target date not yet reached
  "expiring",    // Within 7 days of target date
  "expired",     // Past target date, needs user action
  "closed",      // User manually closed the aim
  "hit",         // Target price was reached
  "rolled_over", // Extended to a new target date
]);

export const aimTypeEnum = pgEnum("aim_type", [
  "playable", // User intends to trade this (fire shots)
  "monitor",  // User is just tracking the prediction (no trades)
]);

// Scoring system enums
export const riskGradeEnum = pgEnum("risk_grade", ["A", "B", "C", "D", "F"]);

export const riskPlanQualityEnum = pgEnum("risk_plan_quality", [
  "none",
  "very_liberal",
  "reasonable",
  "structured",
]);

export const executionDisciplineEnum = pgEnum("execution_discipline", [
  "followed_cleanly",
  "minor_delay",
  "clear_violation",
  "severe_neglect",
]);

export const letterGradeEnum = pgEnum("letter_grade", [
  "AAA", "AA+", "AA", "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D",
  "F", "FF", "FFF",
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
    // Trading discipline fields
    confidenceLevel: decimal("confidence_level", { precision: 3, scale: 1 }), // 1-10 scale
    risks: text("risks"), // What concerns them about this trade
    exitTriggers: text("exit_triggers"), // What would make them exit early
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
    status: aimStatusEnum("status").default("active").notNull(),
    aimType: aimTypeEnum("aim_type").default("playable").notNull(),
    // Trading discipline fields
    stopLossPrice: decimal("stop_loss_price", { precision: 12, scale: 4 }), // Stop loss price level
    takeProfitPrice: decimal("take_profit_price", { precision: 12, scale: 4 }), // Take profit target
    exitConditions: text("exit_conditions"), // Additional exit conditions in their words
    // For rolled over aims, track the original and extension history
    rolledFromId: uuid("rolled_from_id"),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedReason: text("closed_reason"), // 'expired', 'hit', 'manual', 'liquidated'
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
    index("aims_status_idx").on(table.status),
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
    // Trading discipline fields
    stopLossPrice: decimal("stop_loss_price", { precision: 12, scale: 4 }), // Stop loss for this specific shot
    stopLossOrderId: text("stop_loss_order_id"), // Alpaca order ID if stop loss is placed
    // Alpaca order tracking fields
    alpacaOrderId: text("alpaca_order_id"),
    fillPrice: decimal("fill_price", { precision: 12, scale: 4 }),
    fillTimestamp: timestamp("fill_timestamp", { withTimezone: true }),
    filledQty: decimal("filled_qty", { precision: 12, scale: 4 }),
    alpacaStatus: text("alpaca_status"),
    // Partial close / Lot splitting fields
    parentShotId: uuid("parent_shot_id"), // Reference to original shot if this is from a split
    exitPrice: decimal("exit_price", { precision: 12, scale: 4 }), // Price at which position was closed
    exitDate: timestamp("exit_date", { withTimezone: true }), // When position was closed
    closedQuantity: decimal("closed_quantity", { precision: 12, scale: 4 }), // Quantity that was closed (for partial closes)
    realizedPL: decimal("realized_pl", { precision: 14, scale: 4 }), // Realized profit/loss for this close
    alpacaCloseOrderId: text("alpaca_close_order_id"), // Alpaca order ID for the close order
    // Raw transaction facts (calculated when position closes)
    daysHeld: integer("days_held"), // Number of days position was held
    returnPercentage: decimal("return_percentage", { precision: 10, scale: 4 }), // % return at close
    annualizedReturnPercentage: decimal("annualized_return_percentage", { precision: 10, scale: 4 }), // Annualized % return
    // Scoring metrics (original 3-metric system)
    accuracyScore: decimal("accuracy_score", { precision: 10, scale: 2 }), // (Actual Return / Target Return) × 100
    performanceScore: decimal("performance_score", { precision: 10, scale: 2 }), // (Your Return / Expected Market Return) × 67
    difficultyMultiplier: decimal("difficulty_multiplier", { precision: 3, scale: 2 }), // 0.5x to 2.5x based on target return range
    compositeScore: decimal("composite_score", { precision: 10, scale: 2 }), // Accuracy × Difficulty Multiplier
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
    index("shots_alpaca_order_id_idx").on(table.alpacaOrderId),
    index("shots_parent_shot_id_idx").on(table.parentShotId),
  ]
);

/**
 * Scores table - performance metrics for completed shots (LEGACY - kept for migration)
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

// ============================================================================
// New 4-Level Scoring System Tables
// ============================================================================

/**
 * Aim Scores - PRIMARY SCORING UNIT
 * Measures prediction quality (thinking skill)
 *
 * 4 metrics (-50 to +50):
 * - Directional Accuracy (20%)
 * - Magnitude Accuracy (30%)
 * - Forecast Edge (35%)
 * - Thesis Validity (15%)
 *
 * Difficulty shown independently (1.0 to 5.0)
 */
export const aimScores = pgTable(
  "aim_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    aimId: uuid("aim_id")
      .references(() => aims.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Individual metrics (-50 to +50)
    directionalAccuracy: decimal("directional_accuracy", { precision: 6, scale: 2 }).notNull(),
    magnitudeAccuracy: decimal("magnitude_accuracy", { precision: 6, scale: 2 }).notNull(),
    forecastEdge: decimal("forecast_edge", { precision: 6, scale: 2 }).notNull(),
    thesisValidity: decimal("thesis_validity", { precision: 6, scale: 2 }).notNull(),

    // Difficulty (displayed independently, TBD if multiplied)
    difficultyMultiplier: decimal("difficulty_multiplier", { precision: 4, scale: 2 }).notNull(),

    // Final weighted average score (-50 to +50)
    finalScore: decimal("final_score", { precision: 6, scale: 2 }).notNull(),
    letterGrade: letterGradeEnum("letter_grade").notNull(),

    // Discipline tracking
    risksDocumented: boolean("risks_documented").default(false).notNull(),
    thesisValidityCapped: boolean("thesis_validity_capped").default(false).notNull(),

    // Self-reflection (optional)
    selfRating: integer("self_rating"), // 1-5
    selfReflectionNotes: text("self_reflection_notes"),

    // Time-normalized returns (Predicted)
    predictedProfitPerDay: decimal("predicted_profit_per_day", { precision: 10, scale: 6 }),
    predictedProfitPerMonth: decimal("predicted_profit_per_month", { precision: 10, scale: 4 }),
    predictedProfitPerYear: decimal("predicted_profit_per_year", { precision: 10, scale: 4 }),

    // Time-normalized returns (Actual)
    actualProfitPerDay: decimal("actual_profit_per_day", { precision: 10, scale: 6 }),
    actualProfitPerMonth: decimal("actual_profit_per_month", { precision: 10, scale: 4 }),
    actualProfitPerYear: decimal("actual_profit_per_year", { precision: 10, scale: 4 }),

    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("aim_scores_aim_id_idx").on(table.aimId)]
);

/**
 * Shot Scores - Execution quality scoring
 *
 * 4 metrics (-50 to +50):
 * - Performance Score (45%)
 * - Shot Forecast Edge (35%)
 * - Perfect Shot Capture (20%)
 * - Risk Mitigation (converted to multiplier)
 *
 * Risk Grade: A=1.10×, B=1.05×, C=1.00×, D=0.85×, F=0.70×
 * Adaptability: Pro-only bonus (±5)
 */
export const shotScores = pgTable(
  "shot_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    shotId: uuid("shot_id")
      .references(() => shots.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Individual metrics (-50 to +50)
    performanceScore: decimal("performance_score", { precision: 6, scale: 2 }).notNull(),
    shotForecastEdge: decimal("shot_forecast_edge", { precision: 6, scale: 2 }).notNull(),
    perfectShotCapture: decimal("perfect_shot_capture", { precision: 6, scale: 2 }).notNull(),
    riskMitigationScore: decimal("risk_mitigation_score", { precision: 6, scale: 2 }).notNull(),

    // Risk assessment
    riskGrade: riskGradeEnum("risk_grade").notNull(),
    riskMultiplier: decimal("risk_multiplier", { precision: 4, scale: 2 }).notNull(),

    // Adaptability (Pro tier only)
    adaptabilityScore: decimal("adaptability_score", { precision: 6, scale: 2 }),
    adaptabilityBonus: decimal("adaptability_bonus", { precision: 4, scale: 2 }).default("0"),
    adaptabilityLocked: boolean("adaptability_locked").default(true).notNull(),

    // Final computed score (-50 to +50 range, after risk multiplier + adaptability bonus)
    finalScore: decimal("final_score", { precision: 6, scale: 2 }).notNull(),
    letterGrade: letterGradeEnum("letter_grade").notNull(),

    // Capital tracking for aggregation
    capitalTimeWeight: decimal("capital_time_weight", { precision: 10, scale: 4 }),

    // Time-normalized returns
    profitPerDay: decimal("profit_per_day", { precision: 10, scale: 6 }),
    profitPerMonth: decimal("profit_per_month", { precision: 10, scale: 4 }),
    profitPerYear: decimal("profit_per_year", { precision: 10, scale: 4 }),

    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("shot_scores_shot_id_idx").on(table.shotId)]
);

/**
 * Target Scores - Aggregated from Aims and Shots
 *
 * Dual scores:
 * - Prediction Score (from Aims - thinking quality)
 * - Performance Score (from Shots - execution quality)
 *
 * Plus comprehensive P&L and capital metrics
 */
export const targetScores = pgTable(
  "target_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    targetId: uuid("target_id")
      .references(() => targets.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Dual scores
    predictionScore: decimal("prediction_score", { precision: 6, scale: 2 }),
    predictionGrade: letterGradeEnum("prediction_grade"),
    performanceScore: decimal("performance_score", { precision: 6, scale: 2 }),
    performanceGrade: letterGradeEnum("performance_grade"),

    // Financial results
    totalPnlDollars: decimal("total_pnl_dollars", { precision: 14, scale: 2 }),
    totalPnlPercent: decimal("total_pnl_percent", { precision: 10, scale: 4 }),
    maxPossibleReturnPercent: decimal("max_possible_return_percent", { precision: 10, scale: 4 }),

    // Capital metrics
    totalCapitalInvested: decimal("total_capital_invested", { precision: 14, scale: 2 }),
    peakCapitalAtOnce: decimal("peak_capital_at_once", { precision: 14, scale: 2 }),
    capitalEfficiency: decimal("capital_efficiency", { precision: 6, scale: 4 }),

    // Time & completion
    targetDurationDays: integer("target_duration_days"),
    heldUntilEnd: boolean("held_until_end"),
    avgHoldingPeriodDays: integer("avg_holding_period_days"),

    // Prediction accuracy
    predictedReturnPercent: decimal("predicted_return_percent", { precision: 10, scale: 4 }),
    actualReturnPercent: decimal("actual_return_percent", { precision: 10, scale: 4 }),
    predictionAccuracyRatio: decimal("prediction_accuracy_ratio", { precision: 6, scale: 4 }),

    // Win/Loss stats
    winningAimsCount: integer("winning_aims_count"),
    totalAimsCount: integer("total_aims_count"),
    winRatio: decimal("win_ratio", { precision: 4, scale: 2 }),

    // Market comparison
    marketReturnPercent: decimal("market_return_percent", { precision: 10, scale: 4 }),
    alphaVsMarket: decimal("alpha_vs_market", { precision: 10, scale: 4 }),

    // Time-normalized returns (weighted average across shots)
    avgProfitPerDay: decimal("avg_profit_per_day", { precision: 10, scale: 6 }),
    avgProfitPerMonth: decimal("avg_profit_per_month", { precision: 10, scale: 4 }),
    avgProfitPerYear: decimal("avg_profit_per_year", { precision: 10, scale: 4 }),

    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("target_scores_target_id_idx").on(table.targetId)]
);

/**
 * User Career Scores - Aggregated from all Targets
 *
 * Two distinct career scores:
 * - Prediction Quality (from Aims - how good are your ideas)
 * - Performance (from Shots - how well do you execute)
 */
export const userCareerScores = pgTable(
  "user_career_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Two distinct career scores
    predictionQualityScore: decimal("prediction_quality_score", { precision: 6, scale: 2 }),
    predictionGrade: letterGradeEnum("prediction_grade"),
    performanceScore: decimal("performance_score", { precision: 6, scale: 2 }),
    performanceGrade: letterGradeEnum("performance_grade"),

    // Aggregate stats
    totalAimsScored: integer("total_aims_scored").default(0),
    totalShotsScored: integer("total_shots_scored").default(0),
    totalPnlDollars: decimal("total_pnl_dollars", { precision: 14, scale: 2 }),

    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("user_career_scores_user_id_idx").on(table.userId)]
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
 * Symbols table - master list of tradable symbols (stocks, ETFs, crypto)
 * Synced daily from Finnhub API
 */
export const symbols = pgTable(
  "symbols",
  {
    symbol: varchar("symbol", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    exchange: varchar("exchange", { length: 100 }),
    marketType: marketTypeEnum("market_type").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    logoUrl: varchar("logo_url", { length: 500 }),
    finnhubIndustry: varchar("finnhub_industry", { length: 100 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("symbols_name_idx").on(table.name),
    index("symbols_market_type_idx").on(table.marketType),
    index("symbols_is_active_idx").on(table.isActive),
  ]
);

/**
 * Portfolio snapshots table - daily EOD snapshots of portfolio state
 */
export const portfolioSnapshots = pgTable(
  "portfolio_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tradingDate: timestamp("trading_date", { withTimezone: true }).notNull(),
    portfolioValue: decimal("portfolio_value", { precision: 14, scale: 2 }).notNull(),
    cash: decimal("cash", { precision: 14, scale: 2 }).notNull(),
    buyingPower: decimal("buying_power", { precision: 14, scale: 2 }).notNull(),
    dayPL: decimal("day_pl", { precision: 14, scale: 2 }).notNull(),
    dayPLPercent: decimal("day_pl_percent", { precision: 8, scale: 4 }).notNull(),
    positionsSnapshot: json("positions_snapshot").$type<Array<{
      symbol: string;
      qty: string;
      marketValue: string;
      avgEntryPrice: string;
      currentPrice: string;
      unrealizedPL: string;
      unrealizedPLPercent: string;
    }>>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("portfolio_snapshots_user_id_idx").on(table.userId),
    index("portfolio_snapshots_trading_date_idx").on(table.tradingDate),
    index("portfolio_snapshots_user_date_idx").on(table.userId, table.tradingDate),
  ]
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

/**
 * Watchlist table - user's stock watchlist with notes and price alerts
 */
export const watchlist = pgTable(
  "watchlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    symbol: text("symbol").notNull(),
    notes: text("notes"),
    alertPrice: decimal("alert_price", { precision: 12, scale: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("watchlist_user_id_idx").on(table.userId),
    index("watchlist_symbol_idx").on(table.symbol),
    index("watchlist_user_symbol_idx").on(table.userId, table.symbol),
  ]
);

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  targets: many(targets),
  auditLogs: many(auditLogs),
  alpacaCredentials: one(alpacaCredentials),
  portfolioSnapshots: many(portfolioSnapshots),
  watchlist: many(watchlist),
}));

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [portfolioSnapshots.userId],
    references: [users.id],
  }),
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

export const shotsRelations = relations(shots, ({ one, many }) => ({
  aim: one(aims, {
    fields: [shots.aimId],
    references: [aims.id],
  }),
  score: one(scores),
  parentShot: one(shots, {
    fields: [shots.parentShotId],
    references: [shots.id],
    relationName: "shotSplits",
  }),
  childShots: many(shots, {
    relationName: "shotSplits",
  }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  shot: one(shots, {
    fields: [scores.shotId],
    references: [shots.id],
  }),
}));

// New scoring system relations
export const aimScoresRelations = relations(aimScores, ({ one }) => ({
  aim: one(aims, {
    fields: [aimScores.aimId],
    references: [aims.id],
  }),
}));

export const shotScoresRelations = relations(shotScores, ({ one }) => ({
  shot: one(shots, {
    fields: [shotScores.shotId],
    references: [shots.id],
  }),
}));

export const targetScoresRelations = relations(targetScores, ({ one }) => ({
  target: one(targets, {
    fields: [targetScores.targetId],
    references: [targets.id],
  }),
}));

export const userCareerScoresRelations = relations(userCareerScores, ({ one }) => ({
  user: one(users, {
    fields: [userCareerScores.userId],
    references: [users.id],
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

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
}));

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

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type NewPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert;

export type Symbol = typeof symbols.$inferSelect;
export type NewSymbol = typeof symbols.$inferInsert;

export type WatchlistItem = typeof watchlist.$inferSelect;
export type NewWatchlistItem = typeof watchlist.$inferInsert;

// New scoring system types
export type AimScore = typeof aimScores.$inferSelect;
export type NewAimScore = typeof aimScores.$inferInsert;

export type ShotScore = typeof shotScores.$inferSelect;
export type NewShotScore = typeof shotScores.$inferInsert;

export type TargetScore = typeof targetScores.$inferSelect;
export type NewTargetScore = typeof targetScores.$inferInsert;

export type UserCareerScore = typeof userCareerScores.$inferSelect;
export type NewUserCareerScore = typeof userCareerScores.$inferInsert;

// Enum type exports for use in application code
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type TargetType = (typeof targetTypeEnum.enumValues)[number];
export type TargetStatus = (typeof targetStatusEnum.enumValues)[number];
export type Direction = (typeof directionEnum.enumValues)[number];
export type TriggerType = (typeof triggerTypeEnum.enumValues)[number];
export type ShotType = (typeof shotTypeEnum.enumValues)[number];
export type ShotState = (typeof shotStateEnum.enumValues)[number];
export type MarketType = (typeof marketTypeEnum.enumValues)[number];
export type AimStatus = (typeof aimStatusEnum.enumValues)[number];
export type AimType = (typeof aimTypeEnum.enumValues)[number];

// Scoring system enum exports
export type RiskGrade = (typeof riskGradeEnum.enumValues)[number];
export type RiskPlanQuality = (typeof riskPlanQualityEnum.enumValues)[number];
export type ExecutionDiscipline = (typeof executionDisciplineEnum.enumValues)[number];
export type LetterGrade = (typeof letterGradeEnum.enumValues)[number];
