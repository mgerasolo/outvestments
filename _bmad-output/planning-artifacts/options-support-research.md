# Epic 19: Options Support Research

**Created:** 2025-12-28
**Status:** Research Complete
**Type:** Planning Artifact

---

## Executive Summary

This document captures research findings for adding options trading support to Outvestments. Alpaca fully supports options trading through their API, including paper trading. Implementation will require schema extensions, new API integrations, and UI components for options-specific workflows.

---

## 1. Alpaca Options API Availability

### Confirmation

Alpaca **does support** options trading through their API. Key findings:

- Options trading capability is **enabled by default** in Paper environment
- Full API access for order placement, contract data, and position management
- Greeks data available through the options chain endpoint
- Multi-leg strategies supported (but not on TradingView integration)

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /v2/orders` | Place options orders (same as stocks) |
| `GET /v2/options/contracts` | Fetch contract list with filters |
| `GET /v2/options/contracts/{symbol_or_id}` | Get individual contract details |
| `GET /v1beta1/options/snapshots/{underlying}` | Options chain with Greeks |
| `POST /v2/positions/{symbol_or_contract_id}/exercise` | Exercise options |
| `GET /v2/positions` | View options positions (same as stocks) |

### Trading Levels

Alpaca supports 4 options trading levels:

| Level | Strategies Allowed |
|-------|-------------------|
| 0 | Disabled |
| 1 | Covered calls, cash-secured puts |
| 2 | Level 1 + buying calls/puts |
| 3 | Level 2 + spreads (vertical spreads) |

### Order Limitations

- **Quantity:** Must be whole numbers (1 contract = 100 shares)
- **Time in Force:** Only `day` orders allowed
- **Order Types:** `market` and `limit` only
- **Extended Hours:** Not supported for options
- **Notional Orders:** Not supported

---

## 2. Contract Symbol Format (OCC Standard)

Options contracts use the OCC (Options Clearing Corporation) standard format:

```
[ROOT][YYMMDD][C/P][STRIKE_PRICE]
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| ROOT | Underlying symbol (1-6 chars, left-padded) | `AAPL`, `SPY` |
| YYMMDD | Expiration date | `250613` = June 13, 2025 |
| C/P | Contract type | `C` = Call, `P` = Put |
| STRIKE | 8 digits (5 integer + 3 decimal) | `00200000` = $200.00 |

### Examples

- `AAPL250613C00200000` = AAPL June 13, 2025 $200 Call
- `SPY250627P00400000` = SPY June 27, 2025 $400 Put
- `TSLA250321C00250500` = TSLA March 21, 2025 $250.50 Call

---

## 3. Greeks Data

Alpaca provides Greeks through the options chain endpoint (`/v1beta1/options/snapshots/{underlying}`).

### Available Greeks

| Greek | Description | Example Value |
|-------|-------------|---------------|
| Delta | Price change per $1 underlying move | -0.8968 |
| Gamma | Rate of delta change | 0.0021 |
| Theta | Daily time decay (negative for long) | -0.2658 |
| Vega | Price change per 1% IV change | 0.1654 |
| Rho | Price change per 1% interest rate change | -0.3060 |

### API Response Structure (Estimated)

```json
{
  "symbol": "AAPL250613C00200000",
  "greeks": {
    "delta": 0.4523,
    "gamma": 0.0089,
    "theta": -0.1234,
    "vega": 0.2156,
    "rho": 0.0876
  },
  "impliedVolatility": 0.2834
}
```

### Known Limitations

- 0DTE (zero days to expiration) options may have incomplete Greeks data
- Greeks are calculated periodically, not real-time
- Paper trading NTAs (non-trade activities like assignment) sync at start of next day

---

## 4. Schema Changes Required

### 4.1 New Enums

```typescript
// Option type (call/put)
export const optionTypeEnum = pgEnum("option_type", ["call", "put"]);

// Exercise style
export const exerciseStyleEnum = pgEnum("exercise_style", ["american", "european"]);

// Options trading level
export const optionsTradingLevelEnum = pgEnum("options_trading_level", [
  "level_0",  // Disabled
  "level_1",  // Covered calls, cash-secured puts
  "level_2",  // Level 1 + long calls/puts
  "level_3",  // Level 2 + spreads
]);
```

### 4.2 Options Contracts Table

```typescript
export const optionContracts = pgTable(
  "option_contracts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // OCC symbol (e.g., "AAPL250613C00200000")
    occSymbol: varchar("occ_symbol", { length: 21 }).unique().notNull(),

    // Underlying asset
    underlyingSymbol: varchar("underlying_symbol", { length: 10 }).notNull(),

    // Contract specifications
    optionType: optionTypeEnum("option_type").notNull(),
    strikePrice: decimal("strike_price", { precision: 12, scale: 4 }).notNull(),
    expirationDate: timestamp("expiration_date", { withTimezone: true }).notNull(),
    exerciseStyle: exerciseStyleEnum("exercise_style").default("american").notNull(),
    contractMultiplier: decimal("contract_multiplier", { precision: 8, scale: 2 }).default("100").notNull(),

    // Market data (cached)
    openInterest: decimal("open_interest", { precision: 12, scale: 0 }),
    lastPrice: decimal("last_price", { precision: 12, scale: 4 }),
    bidPrice: decimal("bid_price", { precision: 12, scale: 4 }),
    askPrice: decimal("ask_price", { precision: 12, scale: 4 }),
    volume: decimal("volume", { precision: 12, scale: 0 }),

    // Greeks (cached from API)
    delta: decimal("delta", { precision: 8, scale: 6 }),
    gamma: decimal("gamma", { precision: 8, scale: 6 }),
    theta: decimal("theta", { precision: 8, scale: 6 }),
    vega: decimal("vega", { precision: 8, scale: 6 }),
    rho: decimal("rho", { precision: 8, scale: 6 }),
    impliedVolatility: decimal("implied_volatility", { precision: 8, scale: 6 }),

    // Timestamps
    greeksUpdatedAt: timestamp("greeks_updated_at", { withTimezone: true }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("option_contracts_underlying_idx").on(table.underlyingSymbol),
    index("option_contracts_expiration_idx").on(table.expirationDate),
    index("option_contracts_strike_idx").on(table.strikePrice),
    index("option_contracts_type_idx").on(table.optionType),
  ]
);
```

### 4.3 Shots Table Extensions

The existing `shots` table needs extensions for options trades:

```typescript
// Additional columns for shots table
{
  // Options-specific fields (null for stock trades)
  optionContractId: uuid("option_contract_id")
    .references(() => optionContracts.id),

  // Contract quantity (1 contract = 100 shares typically)
  contractQuantity: decimal("contract_quantity", { precision: 10, scale: 0 }),

  // Premium paid/received per contract
  premiumPerContract: decimal("premium_per_contract", { precision: 12, scale: 4 }),

  // Greeks at entry (snapshot for analysis)
  entryDelta: decimal("entry_delta", { precision: 8, scale: 6 }),
  entryGamma: decimal("entry_gamma", { precision: 8, scale: 6 }),
  entryTheta: decimal("entry_theta", { precision: 8, scale: 6 }),
  entryVega: decimal("entry_vega", { precision: 8, scale: 6 }),
  entryIV: decimal("entry_iv", { precision: 8, scale: 6 }),

  // Exit Greeks (for P&L attribution)
  exitDelta: decimal("exit_delta", { precision: 8, scale: 6 }),
  exitGamma: decimal("exit_gamma", { precision: 8, scale: 6 }),
  exitTheta: decimal("exit_theta", { precision: 8, scale: 6 }),
  exitVega: decimal("exit_vega", { precision: 8, scale: 6 }),
  exitIV: decimal("exit_iv", { precision: 8, scale: 6 }),

  // Options outcome tracking
  exercised: boolean("exercised").default(false),
  assigned: boolean("assigned").default(false),
  expiredWorthless: boolean("expired_worthless").default(false),
}
```

### 4.4 User Options Settings

```typescript
// Extension to users or new table
export const userOptionsSettings = pgTable(
  "user_options_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),

    // Trading level (from Alpaca account)
    approvedLevel: optionsTradingLevelEnum("approved_level").default("level_0").notNull(),

    // User preferences
    defaultContractQty: decimal("default_contract_qty", { precision: 10, scale: 0 }).default("1"),
    showGreeks: boolean("show_greeks").default(true),

    // Risk settings
    maxContractsPerTrade: decimal("max_contracts_per_trade", { precision: 10, scale: 0 }),
    maxDaysToExpiration: decimal("max_days_to_expiration", { precision: 6, scale: 0 }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("user_options_settings_user_idx").on(table.userId)]
);
```

### 4.5 Options Strategies Table (Future)

For multi-leg strategies:

```typescript
export const optionStrategies = pgTable(
  "option_strategies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    strategyType: varchar("strategy_type", { length: 50 }).notNull(), // "vertical_spread", "iron_condor", etc.

    // Linked shots for the strategy legs
    legs: json("legs").$type<{
      shotId: string;
      legType: "long" | "short";
      optionType: "call" | "put";
      strikePrice: string;
      expirationDate: string;
    }[]>().default([]),

    // Net debit/credit
    netPremium: decimal("net_premium", { precision: 14, scale: 4 }),

    // Risk/reward
    maxProfit: decimal("max_profit", { precision: 14, scale: 4 }),
    maxLoss: decimal("max_loss", { precision: 14, scale: 4 }),
    breakEvenPrices: json("break_even_prices").$type<string[]>().default([]),

    status: varchar("status", { length: 20 }).default("active").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("option_strategies_user_idx").on(table.userId),
    index("option_strategies_type_idx").on(table.strategyType),
  ]
);
```

---

## 5. Implementation Considerations

### 5.1 Circuit Breaker Updates

Add new circuit for options-specific endpoints:

```typescript
export const CIRCUITS = {
  ALPACA_TRADING: "alpaca:trading",
  ALPACA_ACCOUNT: "alpaca:account",
  ALPACA_MARKET_DATA: "alpaca:market-data",
  ALPACA_ORDERS: "alpaca:orders",
  ALPACA_OPTIONS_CHAIN: "alpaca:options-chain", // NEW
  ALPACA_OPTIONS_CONTRACTS: "alpaca:options-contracts", // NEW
} as const;
```

### 5.2 New Server Actions Needed

```typescript
// src/app/actions/options.ts
export async function getOptionsChain(underlyingSymbol: string): Promise<OptionsChainResult>;
export async function getOptionContract(occSymbol: string): Promise<OptionContractResult>;
export async function placeOptionOrder(data: OptionOrderData): Promise<OrderResult>;
export async function exerciseOption(contractId: string): Promise<ExerciseResult>;
export async function getOptionGreeks(occSymbol: string): Promise<GreeksResult>;
```

### 5.3 UI Components Needed

1. **Options Chain Viewer** - Display calls/puts by strike and expiration
2. **Greeks Display** - Delta, Gamma, Theta, Vega badges/cards
3. **Strike Price Selector** - Interactive strike selection
4. **Expiration Date Picker** - Options-aware date picker
5. **P&L Calculator** - Theoretical profit/loss visualization
6. **Strategy Builder** - Multi-leg strategy composer (Phase 2)

### 5.4 Scoring System Updates

The existing scoring system needs options-specific metrics:

- **Premium capture rate** - How much premium was captured vs max potential
- **Greeks accuracy** - Did Greeks predict movement correctly
- **Time decay utilization** - Theta efficiency for short options
- **IV ranking** - Entry IV percentile vs historical

---

## 6. Migration Path

### Phase 1: Foundation

1. Add `option_contracts` table
2. Extend `shots` table with options fields
3. Add `shotType` enum value for "option" (already exists)
4. Create options chain API integration
5. Add Greeks caching

### Phase 2: Basic Trading

1. Long calls/puts order flow
2. Options position display
3. Greeks display on dashboard
4. Options-specific close position handling

### Phase 3: Advanced Features

1. Covered calls/cash-secured puts
2. Multi-leg strategies
3. Strategy builder UI
4. P&L attribution by Greeks

---

## 7. Risk Considerations

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Greeks data staleness | Implement refresh intervals, show "as of" timestamp |
| 0DTE Greeks unavailable | Fallback to calculated approximations or hide |
| Contract lookup latency | Cache contracts, prefetch common chains |
| Assignment handling | Paper trading syncs next day - document this |

### User Experience Risks

| Risk | Mitigation |
|------|------------|
| Complexity for new users | Progressive disclosure, "simple mode" |
| Options terminology confusion | Inline tooltips, glossary |
| Expiration surprise | Clear expiration warnings, countdown |

---

## 8. References

### Alpaca Documentation

- [Options Trading Overview](https://docs.alpaca.markets/docs/options-trading)
- [Option Chain API](https://docs.alpaca.markets/reference/optionchain)
- [Options Trading Levels](https://alpaca.markets/options)
- [How to Trade Options with Alpaca](https://alpaca.markets/learn/how-to-trade-options-with-alpaca)
- [Alpaca MCP Server (includes options)](https://github.com/alpacahq/alpaca-mcp-server)

### Options Education

- [Option Greeks Explained](https://alpaca.markets/learn/option-greeks)
- [What are the Option Greeks](https://alpaca.markets/support/what-are-the-option-greeks)
- [Gamma Scalping Strategy](https://alpaca.markets/learn/gamma-scalping)

---

## 9. Next Steps

1. **Approval Decision:** Proceed with Epic 19 implementation?
2. **Prioritization:** Which phase to tackle first?
3. **Resource Allocation:** Backend vs frontend focus
4. **Timeline:** Estimated effort for Phase 1

---

*Document prepared as part of Epic 19 planning. No code changes made.*
