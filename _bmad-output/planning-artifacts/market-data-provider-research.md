# Market Data Provider Research

**Date:** 2025-12-27
**Purpose:** Evaluate market data providers for symbol search feature
**Context:** Avoid using Alpaca for non-trading operations; need US stocks and ETFs for MVP

---

## Executive Summary

### Key Findings

1. **Finnhub offers the best free tier** - 60 calls/minute (3,600/hour) with comprehensive symbol search, company logos, and quote data. Ideal for MVP development.

2. **IEX Cloud has shut down** (August 2024) - Remove from consideration. Many developers migrated to Alpha Vantage, Finnhub, or FMP.

3. **Logo providers are shifting** - Clearbit Logo API shutting down December 2025. Logo.dev (same team) and LogoKit are recommended alternatives. Polygon, Finnhub, FMP, and Twelve Data all include logos in their APIs.

4. **For our caching strategy**, Finnhub or FMP provide the best value - generous free tiers that work well with 24hr symbol caching and 15min quote caching.

5. **Budget recommendation:** Start with Finnhub free tier, upgrade to FMP Starter ($14/month) or Finnhub ($50/month) if needed.

---

## Provider Comparison Matrix

| Provider | Symbol Search | Quotes | Logos | US Stocks | ETFs | Crypto | Intl | Free Rate Limit | Free Daily | Paid Starting |
|----------|--------------|--------|-------|-----------|------|--------|------|-----------------|------------|---------------|
| **Finnhub** | Excellent | Real-time | Yes | Yes | Yes | Yes | Yes | 60/min | Unlimited | $50/month |
| **FMP** | Excellent | Real-time | Yes | Yes | Yes | Yes | Yes | ~250/day | 250 | $14/month |
| **Polygon** | Excellent | Real-time | Yes | Yes | Yes | Yes | Limited | 5/min | Unlimited | $29/month |
| **Twelve Data** | Excellent | Delayed 15min | Yes | Yes | Yes | Yes | Yes | 8/min | 800 | $29/month |
| **Alpha Vantage** | Good | Delayed 15min | No | Yes | Yes | Yes | Limited | 5/min | 25 | $50/month |
| **MarketStack** | Good | Delayed | No | Yes | Yes | No | Yes | N/A | 100/month | $9.99/mo |
| **EODHD** | Good | EOD | No | Yes | Yes | Yes | Yes | N/A | 20 | $20/month |
| **Tiingo** | Good | EOD | No | Yes | Yes | Yes | No | 50 sym/hr | N/A | ~$10/mo |
| ~~IEX Cloud~~ | ~~Good~~ | ~~Real-time~~ | ~~No~~ | ~~Yes~~ | ~~Yes~~ | ~~No~~ | ~~No~~ | **SHUT DOWN** | **Aug 2024** | N/A |

---

## Detailed Provider Analysis

### 1. Finnhub

**Rating: HIGHLY RECOMMENDED for MVP**

#### Symbol Search API
- **Endpoint:** `GET /search?q={query}`
- **Response Fields:** symbol, description, displaySymbol, type
- **Search Quality:** Good fuzzy matching, searches by symbol and company name
- **Additional:** `GET /stock/symbol?exchange=US` for all symbols

#### Quote/Price API
- **Endpoint:** `GET /quote?symbol={symbol}`
- **Data Type:** Real-time
- **Fields:** c (current), h (high), l (low), o (open), pc (previous close), t (timestamp)

#### Logo Support
- **Included:** Yes, via Company Profile endpoint
- **Endpoint:** `GET /stock/profile2?symbol={symbol}`
- **Field:** `logo` - URL to company logo image

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes (15+ exchanges) |
| International | Yes (60+ exchanges) |

#### Rate Limits
| Tier | Rate Limit | Daily Limit |
|------|------------|-------------|
| Free | 60/min + 30/sec internal | Unlimited |
| Paid | Higher limits | Unlimited |

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 60 calls/min, most endpoints |
| Paid | $50/month per market | Higher rate limits, priority support |

#### Data Quality
- Real-time quotes from exchanges
- Comprehensive fundamental data
- Regular updates
- Known for reliability

**Pros:**
- Most generous free tier (60/min vs 5/min for others)
- Includes company logos
- Real-time data on free tier
- Good international coverage

**Cons:**
- $50/month per market for paid tier is expensive
- Some advanced features require paid plans

---

### 2. Financial Modeling Prep (FMP)

**Rating: RECOMMENDED - Best for fundamentals + logos**

#### Symbol Search API
- **Endpoint:** `GET /v3/search?query={query}`
- **Name Search:** `GET /v3/search-name?query={query}`
- **Response Fields:** symbol, name, currency, stockExchange, exchangeShortName
- **Search Quality:** Excellent, supports partial matching
- **Additional:** CUSIP, ISIN, CIK lookups available

#### Quote/Price API
- **Endpoint:** `GET /v3/quote/{symbol}`
- **Data Type:** Real-time
- **Fields:** price, changesPercentage, change, dayLow, dayHigh, yearHigh, yearLow, marketCap, volume, avgVolume, open, previousClose

#### Logo Support
- **Included:** Yes
- **Endpoint:** Company Profile includes `image` field
- **Note:** Legacy API deprecated; use Stable API

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes |
| International | Yes (70+ exchanges) |

#### Rate Limits
| Tier | Rate Limit | Bandwidth Limit (30 days) |
|------|------------|--------------------------|
| Free | Not specified | 500MB |
| Starter | Higher | 20GB |
| Premium | Higher | 50GB |

**Note:** FMP uses bandwidth-based limits rather than request counts. 250 requests/day is approximate.

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 250 requests/day, 500MB/month |
| Starter | $14/month | 20GB bandwidth |
| Premium | $29/month | 50GB bandwidth |
| Ultimate | $49/month | 150GB bandwidth |

#### Data Quality
- Uses SEC filings as source
- 30+ years historical data
- Comprehensive fundamentals
- 150+ API endpoints

**Pros:**
- Affordable paid plans ($14-$49/month)
- Excellent fundamental data
- Company logos included
- Great search functionality

**Cons:**
- Bandwidth-based limits can be confusing
- Free tier limited to 250 requests/day
- Legacy API deprecated

---

### 3. Polygon.io (now Massive.com)

**Rating: GOOD - Premium option for real-time needs**

#### Symbol Search API
- **Endpoint:** `GET /v3/reference/tickers?search={query}`
- **Response Fields:** ticker, name, market, locale, primary_exchange, type, active, currency_name, cik, composite_figi
- **Search Quality:** Excellent, supports partial matching and fuzzy search
- **Additional:** Filter by market, exchange, type

#### Quote/Price API
- **Endpoint:** `GET /v2/snapshot/locale/us/markets/stocks/tickers/{ticker}`
- **Data Type:** Real-time (paid), End-of-day (free)
- **Fields:** Comprehensive tick-level data

#### Logo Support
- **Included:** Yes
- **Endpoint:** `GET /v3/reference/tickers/{ticker}`
- **Fields:** `branding.logo_url`, `branding.icon_url`
- **Note:** Requires API key in URL when accessing logo files

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes (comprehensive) |
| ETFs | Yes |
| Crypto | Yes |
| International | Limited (US focus) |
| Options | Yes |

#### Rate Limits
| Tier | Rate Limit |
|------|------------|
| Free | 5/min |
| Paid | Unlimited (recommended <100/sec) |

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Basic (Free) | $0 | 5 calls/min, EOD data only |
| Stocks Starter | $29/month | 15-min delayed, unlimited calls |
| Stocks Developer | $79/month | Real-time data |
| Options | $29-$79/month | Options-specific plans |

#### Data Quality
- Tick-level precision
- Direct exchange feeds
- Excellent for US markets
- Industry-leading latency

**Pros:**
- Includes company logos and icons
- Excellent US market coverage
- Tick-level data available
- Good documentation

**Cons:**
- Very restrictive free tier (5/min)
- US-centric
- Expensive for full real-time access

---

### 4. Twelve Data

**Rating: GOOD - Balanced option**

#### Symbol Search API
- **Endpoint:** `GET /symbol_search?symbol={query}`
- **Response Fields:** symbol, instrument_name, exchange, mic_code, exchange_timezone, instrument_type, country
- **Search Quality:** Excellent, "most effective search in the industry"
- **Additional:** List all symbols by type/exchange

#### Quote/Price API
- **Endpoint:** `GET /quote?symbol={symbol}`
- **Data Type:** 15-min delayed (free), real-time (paid)
- **Fields:** open, high, low, close, volume, previous_close, change, percent_change

#### Logo Support
- **Included:** Yes, free
- **Endpoint:** `https://api.twelvedata.com/logo/{domain}` or `https://logo.twelvedata.com/crypto/{symbol}.png`
- **Note:** Logos at no cost

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes (180+ exchanges) |
| International | Yes (90+ exchanges) |
| Forex | Yes |

#### Rate Limits
| Tier | Per Minute | Daily |
|------|------------|-------|
| Free (Basic) | 8 | 800 |
| Grow | 55-377 | Unlimited |
| Pro | 610-1,597 | Unlimited |
| Ultra | 2,584-10,946 | Unlimited |

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Basic (Free) | $0 | 8/min, 800/day, 15-min delayed |
| Grow | $29/month | 55+ calls/min, no daily limit |
| Pro | $99/month | 610+ calls/min, real-time |
| Ultra | $329/month | 2,584+ calls/min, SLA |

**Discounts:** 20% for students/startups, free for non-profits

#### Data Quality
- 100,000+ symbols
- Good coverage breadth
- Real-time on paid plans
- Includes fundamentals

**Pros:**
- Free logos
- Good international coverage
- Student/startup discounts
- Reasonable paid pricing

**Cons:**
- Modest free tier (8/min, 800/day)
- 15-min delay on free tier

---

### 5. Alpha Vantage

**Rating: LIMITED - Only for light use**

#### Symbol Search API
- **Endpoint:** `GET ?function=SYMBOL_SEARCH&keywords={query}`
- **Response Fields:** symbol, name, type, region, marketOpen, marketClose, timezone, currency, matchScore
- **Search Quality:** Good, includes match scoring
- **Additional:** LISTING_STATUS for full symbol lists (CSV)

#### Quote/Price API
- **Endpoint:** `GET ?function=GLOBAL_QUOTE&symbol={symbol}`
- **Data Type:** 15-min delayed (free), real-time (premium)
- **Fields:** open, high, low, price, volume, latestTradingDay, previousClose, change, changePercent

#### Logo Support
- **Included:** No
- **Alternative:** Use Logo.dev or LogoKit

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes |
| International | Limited |

#### Rate Limits
| Tier | Per Minute | Daily |
|------|------------|-------|
| Free | 5 | 25 |
| Premium | 75-1,200 | Unlimited |

**CRITICAL:** Free tier is only **25 requests per day** as of 2025.

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 5/min, 25/day |
| Premium | $50+/month | 75-1,200/min, no daily limit |

#### Data Quality
- NASDAQ-licensed provider
- Good historical data
- Limited fundamentals on free tier

**Pros:**
- Simple API
- Good documentation
- NASDAQ-licensed

**Cons:**
- **Only 25 requests/day on free tier**
- No logos
- Limited compared to competitors

---

### 6. MarketStack

**Rating: LIMITED - Budget option for basic needs**

#### Symbol Search API
- **Endpoint:** `GET /v2/tickers?search={query}`
- **Response Fields:** symbol, name, stock_exchange, country
- **Search Quality:** Basic

#### Quote/Price API
- **Endpoint:** `GET /v1/eod?symbols={symbol}`
- **Data Type:** End-of-day (free), Intraday (paid only)
- **Fields:** open, high, low, close, volume, adj_close

#### Logo Support
- **Included:** No
- **Alternative:** Use Logo.dev or LogoKit

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | No |
| International | Yes (72 exchanges) |

#### Rate Limits
| Tier | Rate Limit | Monthly Limit |
|------|------------|---------------|
| Free | 1/min (some endpoints) | 100 requests |

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 100 requests/month (!), 1 year history |
| Basic | $9.99/month | 10,000 requests |
| Standard | $49.99/month | 100,000 requests |
| Business | $149.99/month | 500,000 requests |

**Note:** V1 API deprecated June 30, 2025. Use V2.

#### Data Quality
- 30+ years historical data
- Good international coverage
- IEX entitlement required for bid/ask data as of Feb 2025

**Pros:**
- Low starting price ($9.99/month)
- Good international coverage

**Cons:**
- Only 100 requests/month on free tier
- No crypto
- No logos
- Intraday data requires paid plan

---

### 7. EODHD (EOD Historical Data)

**Rating: BUDGET OPTION - Good for historical data**

#### Symbol Search API
- **Endpoint:** Symbol lookup available
- **Response Fields:** Symbol, name, exchange
- **Search Quality:** Basic

#### Quote/Price API
- **Data Type:** End-of-day primary, real-time on higher tiers
- **Fields:** OHLCV standard

#### Logo Support
- **Included:** No
- **Alternative:** Use Logo.dev or LogoKit

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes |
| International | Yes (150,000+ tickers) |

#### Rate Limits
| Tier | Per Minute | Daily |
|------|------------|-------|
| Free | N/A | 20 |
| Paid | 1,000 | 100,000 |

**Note:** Some endpoints cost 5-10 API calls each.

#### Pricing
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 20/day, 1 year history |
| EOD All World | $20/month | 100K/day, full history |
| EOD+Intraday | $30/month | Intraday data |
| All-In-One | $100/month | Everything |

**Discount:** 50% off for students

#### Data Quality
- Good for historical analysis
- 30+ years of data
- Less focus on real-time

**Pros:**
- Affordable for historical data
- Excellent historical depth
- Student discount

**Cons:**
- Very limited free tier (20/day)
- EOD focus, not real-time
- No logos

---

### 8. Tiingo

**Rating: NICHE - Good for quant research**

#### Symbol Search API
- Limited search functionality
- Better for known symbols

#### Quote/Price API
- **Data Type:** End-of-day (free), real-time (paid)
- **Fields:** OHLCV, adjusted prices

#### Logo Support
- **Included:** No

#### Market Coverage
| Market | Supported |
|--------|-----------|
| US Stocks | Yes |
| ETFs | Yes |
| Crypto | Yes (40+ exchanges) |
| International | Limited |

#### Rate Limits
- Free: 50 symbols/hour
- Paid: Higher limits

#### Pricing
- Free tier available
- Paid plans from ~$10/month
- Academic pricing available

#### Data Quality
- Focused on quant research
- 30+ years stock data
- Good for backtesting

**Pros:**
- Academic pricing
- Good for research
- Long historical data

**Cons:**
- Limited symbol search
- No logos
- Less polished than competitors

---

## Logo Provider Analysis

Since not all data providers include logos, here are dedicated logo APIs:

### Logo.dev (Recommended)

**Status:** Official migration path from Clearbit Logo API

| Feature | Details |
|---------|---------|
| Endpoint | `https://img.logo.dev/{domain}` |
| Features | Dark/light themes, stock ticker lookup, crypto support |
| Free Tier | Yes (requires attribution) |
| Paid | $300/year (no attribution) |
| Coverage | Comprehensive |

**Pros:** Same team as Clearbit, best migration path, stock ticker support

### LogoKit

**Status:** Clearbit alternative with generous free tier

| Feature | Details |
|---------|---------|
| Endpoint | `https://logokit.com/api/logo/{domain}` |
| Free Tier | 5,000 requests/day |
| Paid | $30/month |
| Coverage | 50M+ logos, stocks, ETFs, crypto |
| Features | <100ms latency, intelligent fallbacks |

**Pros:** Best free tier, stock/crypto support, fast

### RiteKit

| Feature | Details |
|---------|---------|
| Free Tier | 100 credits/month |
| Paid | Varies |
| Features | SVG logos, transparent backgrounds |

---

## Recommendations

### For Outvestments MVP

**Primary Recommendation: Finnhub**

| Reason | Details |
|--------|---------|
| Rate Limit | 60/min (3,600/hour) - best free tier |
| Logos | Included in Company Profile |
| Real-time | Yes, on free tier |
| Coverage | US stocks, ETFs, crypto |
| Caching Compatibility | Excellent with 24hr symbol / 15min quote caching |

**Implementation:**
```typescript
// Symbol search
GET https://finnhub.io/api/v1/search?q=AAPL&token={key}

// Quote
GET https://finnhub.io/api/v1/quote?symbol=AAPL&token={key}

// Company profile with logo
GET https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token={key}
```

### Alternative: Financial Modeling Prep

Use if you need:
- Better fundamental data
- More affordable paid tier ($14/month vs $50/month)
- SEC-sourced data

### For Logos (if provider doesn't include)

**Use LogoKit** for:
- 5,000 free requests/day
- Stock ticker support
- Fast response times

```typescript
// By domain
GET https://logokit.com/api/logo/apple.com

// By ticker
GET https://logokit.com/api/stock/AAPL
```

---

## Implementation Strategy

### Phase I: MVP (US Stocks + ETFs)

1. **Data Provider:** Finnhub (free tier)
   - 60 calls/min = 86,400 calls/day theoretical max
   - With caching: effectively unlimited for our use case

2. **Caching Strategy:**
   ```
   Symbol data: 24 hours
   Company profiles (logos): 7 days
   Quotes: 15 minutes
   Search results: 1 hour
   ```

3. **Rate Limit Management:**
   - Implement request queue
   - Prioritize user-initiated requests
   - Background refresh during off-peak

### Phase II: Crypto + International

1. **Upgrade Path:**
   - If Finnhub free tier insufficient: FMP Starter ($14/month)
   - For real-time needs: Twelve Data Grow ($29/month)

2. **Additional Coverage:**
   - Finnhub already includes crypto/international
   - May need exchange-specific APIs for depth

### Cost Projection

| Scenario | Monthly Cost |
|----------|--------------|
| MVP (free tiers) | $0 |
| Light usage (FMP Starter) | $14 |
| Moderate usage (Finnhub paid) | $50 |
| Heavy usage (Twelve Data Pro) | $99 |

---

## Appendix: API Response Examples

### Finnhub Symbol Search
```json
{
  "count": 4,
  "result": [
    {
      "description": "APPLE INC",
      "displaySymbol": "AAPL",
      "symbol": "AAPL",
      "type": "Common Stock"
    }
  ]
}
```

### Finnhub Quote
```json
{
  "c": 178.72,
  "d": 0.89,
  "dp": 0.5,
  "h": 179.63,
  "l": 177.35,
  "o": 178.55,
  "pc": 177.83,
  "t": 1703721600
}
```

### Finnhub Company Profile (with logo)
```json
{
  "country": "US",
  "currency": "USD",
  "exchange": "NASDAQ NMS - GLOBAL MARKET",
  "finnhubIndustry": "Technology",
  "ipo": "1980-12-12",
  "logo": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png",
  "marketCapitalization": 2794806.0,
  "name": "Apple Inc",
  "phone": "14089961010",
  "shareOutstanding": 15634.23,
  "ticker": "AAPL",
  "weburl": "https://www.apple.com/"
}
```

---

## Sources

### Provider Documentation
- [Polygon.io Documentation](https://polygon.io/docs/stocks/get_v3_reference_tickers)
- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Financial Modeling Prep Docs](https://site.financialmodelingprep.com/developer/docs)
- [Twelve Data Documentation](https://twelvedata.com/docs)
- [MarketStack Documentation](https://marketstack.com/documentation)
- [EODHD Documentation](https://eodhd.com/financial-apis/quick-start-with-our-financial-data-apis)
- [Tiingo Pricing](https://www.tiingo.com/about/pricing)

### Logo Providers
- [Logo.dev Documentation](https://docs.logo.dev/migrations/clearbit)
- [LogoKit](https://logokit.com/clearbit-alternative)
- [Clearbit Shutdown Notice](https://developers.hubspot.com/changelog/upcoming-sunset-of-clearbits-free-logo-api)

### Comparison Articles
- [Financial Data APIs 2025: Complete Guide](https://www.ksred.com/the-complete-guide-to-financial-data-apis-building-your-own-stock-market-data-pipeline-in-2025/)
- [IEX Cloud Shutdown Analysis](https://www.alphavantage.co/iexcloud_shutdown_analysis_and_migration/)
- [Best Real-Time Stock APIs 2025](https://site.financialmodelingprep.com/education/other/best-realtime-stock-market-data-apis-in-)
