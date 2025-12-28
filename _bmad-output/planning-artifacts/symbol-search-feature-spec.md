# Symbol Search & Autocomplete Feature Spec

**Status:** In Progress - Backend Architecture Phase
**Created:** 2025-12-27
**Updated:** 2025-12-28
**PM:** John (BMAD PM Agent)
**Stakeholder:** Matt

---

## Overview

Implement a stock/ETF symbol search with autocomplete dropdown that appears anywhere users need to enter a ticker symbol. **Symbol data is synced daily to a local database** - searches query the local DB, not external APIs.

## User Story

> As a user entering a stock symbol, I want to see a dropdown with matching symbols, company names, logos, and current prices so I can confidently select the correct asset without memorizing exact ticker symbols.

## Requirements

### MVP (Phase I)
- [ ] US Stocks symbol search
- [ ] ETFs symbol search
- [ ] Autocomplete dropdown on all symbol input fields
- [ ] Display: Symbol, Company Name, Logo, Exchange/Market
- [ ] Daily sync job to refresh symbol database

### Phase II (Future)
- [ ] Crypto assets
- [ ] International markets
- [ ] Real-time quotes in dropdown (optional enhancement)

---

## Technical Specification

### Architecture: Local Database + Daily Sync

```
┌─────────────────────────────────────────────────────────────┐
│                  DAILY SYNC JOB (Cron/Scheduled)            │
│  Runs once per day (e.g., 4am ET before market open)        │
│  - Pulls full symbol list from provider                     │
│  - Upserts to local `symbols` table                         │
│  - Downloads/updates logos                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                              │
│  symbols table:                                              │
│  - symbol (PK)                                               │
│  - name                                                      │
│  - exchange                                                  │
│  - market_type (stocks, etf, crypto, international)         │
│  - logo_url                                                  │
│  - currency                                                  │
│  - is_active                                                 │
│  - last_synced_at                                           │
│                                                              │
│  Indexes: symbol, name (for search), market_type            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Components                      │
│  SymbolSearchInput → debounced (150ms, faster now!)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  GET /api/symbols/search?q={query}&markets=stocks,etf       │
│      → Queries LOCAL DB, not external API                   │
│      → Returns instantly (<50ms)                            │
│                                                              │
│  GET /api/symbols/{symbol}/quote                            │
│      → Hits external API (with caching)                     │
│      → Used only when user needs current price              │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```typescript
// Add to src/lib/db/schema.ts

export const symbols = pgTable('symbols', {
  symbol: varchar('symbol', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  exchange: varchar('exchange', { length: 50 }),
  marketType: varchar('market_type', { length: 20 }).notNull(), // 'stocks' | 'etf' | 'crypto' | 'international'
  logoUrl: varchar('logo_url', { length: 500 }),
  currency: varchar('currency', { length: 10 }).default('USD'),
  isActive: boolean('is_active').default(true),
  lastSyncedAt: timestamp('last_synced_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nameIdx: index('symbols_name_idx').on(table.name),
  marketTypeIdx: index('symbols_market_type_idx').on(table.marketType),
  // For fast prefix/contains search
  symbolNameSearchIdx: index('symbols_search_idx').on(table.symbol, table.name),
}));
```

### Search Query (Fast Local DB)

```typescript
// src/app/actions/symbols.ts

export async function searchSymbols(query: string, markets: string[] = ['stocks', 'etf']) {
  if (query.length < 2) return [];

  const searchTerm = `%${query.toLowerCase()}%`;

  return await db
    .select()
    .from(symbols)
    .where(
      and(
        inArray(symbols.marketType, markets),
        eq(symbols.isActive, true),
        or(
          ilike(symbols.symbol, searchTerm),
          ilike(symbols.name, searchTerm)
        )
      )
    )
    .orderBy(
      // Prioritize exact symbol matches, then prefix matches
      sql`CASE
        WHEN LOWER(symbol) = ${query.toLowerCase()} THEN 0
        WHEN LOWER(symbol) LIKE ${query.toLowerCase() + '%'} THEN 1
        ELSE 2
      END`,
      symbols.symbol
    )
    .limit(20);
}
```

### Daily Sync Job

```typescript
// src/lib/market-data/sync-symbols.ts

interface SymbolSyncProvider {
  name: string;
  fetchAllSymbols(markets: MarketType[]): Promise<SymbolData[]>;
}

export async function syncSymbols(provider: SymbolSyncProvider) {
  console.log(`[Symbol Sync] Starting daily sync from ${provider.name}`);

  const allSymbols = await provider.fetchAllSymbols(['stocks', 'etf']);

  // Batch upsert to database
  for (const batch of chunk(allSymbols, 500)) {
    await db
      .insert(symbols)
      .values(batch)
      .onConflictDoUpdate({
        target: symbols.symbol,
        set: {
          name: sql`excluded.name`,
          exchange: sql`excluded.exchange`,
          logoUrl: sql`excluded.logo_url`,
          isActive: true,
          lastSyncedAt: new Date(),
        }
      });
  }

  // Mark symbols not in sync as inactive (delisted)
  const syncedSymbols = allSymbols.map(s => s.symbol);
  await db
    .update(symbols)
    .set({ isActive: false })
    .where(
      and(
        notInArray(symbols.symbol, syncedSymbols),
        eq(symbols.isActive, true)
      )
    );

  console.log(`[Symbol Sync] Completed: ${allSymbols.length} symbols synced`);
}
```

### Sync Job Scheduling Options

1. **Cron job on server** - `0 4 * * * node scripts/sync-symbols.js`
2. **Vercel Cron** (if deployed there) - `vercel.json` cron config
3. **n8n workflow** - Trigger at 4am ET daily
4. **Manual trigger** - Admin endpoint `/api/admin/sync-symbols`

### Data Types

```typescript
// src/lib/market-data/types.ts

type MarketType = 'stocks' | 'etf' | 'crypto' | 'international';

interface SymbolData {
  symbol: string;           // "AAPL"
  name: string;             // "Apple Inc."
  exchange: string;         // "NASDAQ"
  marketType: MarketType;   // "stocks"
  logoUrl?: string;         // "https://logo.clearbit.com/apple.com"
  currency: string;         // "USD"
}

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  isDelayed: boolean;
}

// Provider interface for daily sync
interface SymbolSyncProvider {
  name: string;
  fetchAllSymbols(markets: MarketType[]): Promise<SymbolData[]>;
  fetchLogos?(symbols: string[]): Promise<Map<string, string>>;
}

// Provider interface for real-time quotes (if needed)
interface QuoteProvider {
  name: string;
  getQuote(symbol: string): Promise<Quote>;
  getBatchQuotes(symbols: string[]): Promise<Quote[]>;
}
```

### Frontend Component

```typescript
// src/components/ui/symbol-search-input.tsx

interface SymbolSearchInputProps {
  value: string;
  onChange: (symbol: string, result?: SymbolData) => void;
  markets?: MarketType[];  // default: ['stocks', 'etf']
  placeholder?: string;
  disabled?: boolean;
  showPrice?: boolean;     // If true, fetch quote on selection
}

// Features:
// - Debounced search (150ms - faster since it's local DB)
// - Keyboard navigation (up/down/enter/escape)
// - Loading state (minimal, DB is fast)
// - Empty state ("No results for 'xyz'")
// - Click outside to close
// - Mobile-friendly touch targets
// - Shows logo if available
```

### Integration Points

The SymbolSearchInput should replace manual text inputs in:

1. **Aim Creation** - Symbol field
2. **Shot Execution** - Any symbol input in shot forms
3. **Any future symbol entry point**

---

## Implementation Plan

### Phase 1: Database & Sync Infrastructure
1. Add `symbols` table to schema
2. Run migration (`drizzle-kit push`)
3. Create sync provider interface
4. Implement mock provider for development
5. Create sync script (`scripts/sync-symbols.ts`)
6. Add admin endpoint to trigger sync

### Phase 2: API & Frontend
1. Create `/api/symbols/search` endpoint
2. Build `SymbolSearchInput` component
3. Integrate into Aim creation form
4. Integrate into Shot execution form

### Phase 3: Provider Implementation (After PM Research)
1. Implement real provider (Polygon, Finnhub, etc.)
2. Set up daily cron job
3. Handle logo fetching (separate provider if needed)

### Phase 4: Quotes (Optional Enhancement)
1. Add quote provider interface
2. Implement quote caching (15min TTL)
3. Add price display to dropdown

---

## API Usage Comparison

| Approach | API Calls/Day | Notes |
|----------|---------------|-------|
| **OLD: Live search** | 100-1000+ | Every keystroke = API call |
| **NEW: Daily sync** | 1-2 | Bulk download once, search local |

**Winner: Daily sync is ~100x more efficient.**

---

## Open Questions (Pending PM Research)

1. Which provider offers bulk symbol download? (Not all do)
2. What's the best source for logos?
3. How many symbols total? (Affects DB size, ~10-50k expected)
4. Do we need real-time quotes in dropdown, or just on selection?

---

## Acceptance Criteria

- [ ] User can type partial symbol or company name
- [ ] Dropdown appears after 2+ characters (150ms debounce)
- [ ] Dropdown shows: Symbol, Name, Logo, Exchange
- [ ] Clicking result populates the input field
- [ ] Keyboard navigation works
- [ ] Works on mobile
- [ ] Search response time < 100ms (local DB)
- [ ] Daily sync job runs successfully
- [ ] Delisted symbols marked inactive

---

## Related Files

- `src/lib/db/schema.ts` - Add symbols table here
- `src/app/actions/` - Add symbol search action
- `src/components/ui/` - SymbolSearchInput component
- `scripts/` - Sync job script
