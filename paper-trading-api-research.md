# Paper Trading API Platform Research

## Executive Summary

**Key Findings:**

1. **Alpaca is the clear winner** for a gamified paper trading platform - it offers free paper trading with real-time IEX data, robust API documentation, and a legitimate path to supporting multiple users through their Broker API.

2. **TD Ameritrade/Schwab API is not viable** - The TD Ameritrade API was discontinued in May 2024, and paper trading was never supported via API. The new Schwab Trader API does not support paper trading.

3. **Interactive Brokers requires a funded live account** for full paper trading access, making it less ideal for a purely simulated platform with many users.

4. **Polygon.io (now Massive)** is excellent for market data but does not provide paper trading execution - consider pairing with Alpaca.

5. **For multi-user support**, Alpaca's Broker API is specifically designed for fintech platforms managing multiple accounts, though it requires a partnership arrangement.

---

## Platform Comparison Table

| Feature | Alpaca | Tradier | Interactive Brokers | Polygon.io (Massive) | Alpha Vantage |
|---------|--------|---------|--------------------|--------------------|---------------|
| **Free Tier** | Yes (Paper-only account) | Yes (requires brokerage account) | Free trial available | Yes (limited) | Yes (very limited) |
| **Paper Trading API** | Full support | Sandbox available | Full support | No (data only) | No (data only) |
| **Real-time Data** | IEX data (free tier) | 15-min delayed (sandbox) | Yes (with subscription) | EOD only (free) | Limited |
| **Historical Data** | Yes | Yes | Yes | 2 years (free) | Yes |
| **Rate Limits** | 200/min (free), 1000/min (paid) | 60-120/min | 50 req/sec (Web API) | 5/min (free) | 25/day, 5/min |
| **Multi-user Support** | Via Broker API | Personal use only | Per-account | N/A | N/A |
| **Documentation** | Excellent | Good | Complex | Good | Good |
| **Order Execution Sim** | Yes | Yes | Yes | No | No |
| **Ease of Integration** | Easy | Moderate | Complex | Easy | Easy |

---

## Detailed Platform Analysis

### 1. Alpaca Paper Trading API

**Overview:** Alpaca is a developer-first API platform offering commission-free trading for stocks, options, and crypto. They provide a dedicated paper trading environment that mirrors their production API.

**Pricing:**
- Paper-only account: FREE
- No funded account required for paper trading
- Real-time IEX market data included free
- Algo Trader Plus subscription: $9/month (increases rate limits to 1000/min)
- Elite plans: $0.0025-$0.004 per share for live trading

**API Features:**
- Full REST API and WebSocket streaming
- Market, limit, stop, and complex order types
- Real-time portfolio tracking
- Paper account starts with configurable virtual cash (up to $1M)
- 10% chance of partial fills for realistic simulation
- API spec identical between paper and live environments

**Rate Limits:**
- 200 requests/minute (paper and live)
- 10 requests/second burst limit
- Can increase to 1000/min with paid plan or non-retail account

**Multi-user Support:**
- Single paper account per individual (personal use)
- **Broker API** available for fintech platforms to manage multiple end-user accounts
- Broker API requires partnership agreement and compliance setup
- Used by Robinhood, Webull, and other major platforms

**Documentation Quality:** Excellent
- Comprehensive API docs at docs.alpaca.markets
- Official SDKs in Python, JavaScript, Go, C#, and more
- Active community forum
- MCP server available for AI integration

**Pros:**
- Free paper trading with no funded account required
- Real-time IEX data included
- Simple, modern REST API
- Excellent documentation
- Clear path to multi-user via Broker API
- Commission-free live trading available

**Cons:**
- Only IEX data on free tier (not consolidated NBBO)
- Rate limits may be restrictive for high-frequency use cases
- Broker API requires business partnership

**Sources:**
- [Alpaca Paper Trading Docs](https://docs.alpaca.markets/docs/paper-trading)
- [Alpaca Trading API](https://docs.alpaca.markets/docs/trading-api)
- [Alpaca Broker API](https://docs.alpaca.markets/broker)
- [Alpaca Rate Limits](https://alpaca.markets/support/usage-limit-api-calls)

---

### 2. Tradier Sandbox API

**Overview:** Tradier provides a brokerage API with a sandbox environment for testing. It requires creating a brokerage account first.

**Pricing:**
- Free sandbox access with brokerage account
- Production API free for personal use
- Partnership available for commercial use

**API Features:**
- REST API for orders, positions, account data
- Streaming market data available
- Options trading supported
- Standard order types

**Rate Limits:**
- 60-120 requests per minute
- Rate limit headers provided in responses
- Streaming API recommended to avoid polling limits

**Multi-user Support:**
- APIs entitled for personal use only unless you are a Tradier Partner
- Partner program available for commercial applications

**Data Limitations:**
- **15-minute delayed market data in sandbox**
- No real-time streaming for paper trading
- This is a significant limitation for a realistic trading simulation

**Documentation Quality:** Good
- Clear API documentation
- Reasonable examples provided

**Pros:**
- Free sandbox environment
- Options trading supported
- Reasonable rate limits

**Cons:**
- **15-minute delayed data in sandbox is a major limitation**
- Requires brokerage account creation
- Personal use restriction without partner agreement
- Less popular/community support than Alpaca

**Sources:**
- [Tradier Developer Portal](https://developer.tradier.com/)
- [Tradier Paper Trading FAQ](https://support.tradier.com/how-do-i-enroll-in-paper-trading)
- [Tradier Rate Limiting](https://documentation.tradier.com/brokerage-api/overview/rate-limiting)

---

### 3. TD Ameritrade / Schwab (NOT RECOMMENDED)

**Overview:** TD Ameritrade's API was discontinued following the Schwab acquisition. The replacement Schwab Trader API does not support paper trading.

**Current Status (December 2025):**
- TD Ameritrade API endpoints shut down May 10, 2024
- Developer portal registration disabled
- No legacy API access available
- **Paper trading was NEVER supported via API** - only through thinkorswim GUI

**Schwab Trader API:**
- Available at developer.schwab.com
- Requires app approval (takes several days)
- 120 requests/minute rate limit
- **No paper trading API support**
- paperMoney feature only accessible through thinkorswim platform, not programmatically

**Verdict:** Not viable for a paper trading platform.

**Sources:**
- [TD Ameritrade API Status](https://blog.traderspost.io/article/does-td-ameritrade-have-api)
- [TD Ameritrade API in 2025](https://blog.pickmytrade.trade/td-ameritrade-have-api-2025/)
- [Schwab Developer Portal](https://developer.schwab.com/products/trader-api--individual)

---

### 4. Interactive Brokers Paper Trading

**Overview:** IBKR offers comprehensive paper trading with full API access, but is designed for traders who intend to eventually use live accounts.

**Pricing:**
- Free trial account available (no time limit, but may be closed after extended inactivity)
- Full paper trading for funded account holders
- $1M virtual equity provided
- Market data subscriptions may be required for real-time data

**API Features:**
- TWS API (native application-based)
- Web API (REST-based, 50 req/sec)
- Client Portal API (10 req/sec)
- Full order types including complex orders
- Global market access (150+ markets, 33 countries)
- Paper trades executed by same simulator as production

**Rate Limits:**
- Web API: 50 requests/second global limit
- Client Portal: 10 requests/second
- Historical data: 60 requests per 10 minutes
- Pacing violations can result in 10-minute penalty box

**Multi-user Support:**
- Each user needs their own IBKR account
- Institutional API available for RIAs and advisors
- More complex onboarding than Alpaca

**Documentation Quality:** Complex but comprehensive
- Extensive documentation
- Steep learning curve
- Multiple API options can be confusing

**Pros:**
- Most comprehensive trading simulator
- Global market access
- Same infrastructure as $100B+ broker
- Works after hours and weekends
- Sophisticated order types

**Cons:**
- Complexity - multiple APIs, steep learning curve
- Pacing violations can be frustrating
- Free trial may be closed after inactivity
- Full features require funded account
- Market data subscriptions may add costs
- Not as developer-friendly as Alpaca

**Sources:**
- [IBKR API Solutions](https://www.interactivebrokers.com/en/trading/ib-api.php)
- [IBKR Paper Trading Account](https://www.interactivebrokers.com/campus/trading-lessons/request-paper-trading-account/)
- [IBKR Free Trial](https://www.interactivebrokers.com/en/trading/free-trial.php)
- [TWS API Historical Limitations](https://interactivebrokers.github.io/tws-api/historical_limitations.html)

---

### 5. Polygon.io (now Massive.com) - Market Data Only

**Overview:** Polygon.io (rebranded to Massive) is a market data provider, NOT a trading platform. Consider pairing with Alpaca for order execution.

**Pricing:**
- Free tier: End of day data, 5 API calls/minute
- Starter: ~$100/month (15-min delayed real-time, 10yr history)
- Advanced: ~$500/month (full real-time, complete history)
- Enterprise: Custom pricing

**Free Tier Includes:**
- End of day US equities, forex, crypto data
- 2 years of historical data at minute granularity
- No credit card required

**API Features:**
- Real-time and historical tick data
- REST and WebSocket APIs
- Standardized JSON and CSV formats
- Used by Robinhood, Alpaca, Webull, Tradier

**Rate Limits (Free):**
- 5 API calls per minute
- Limited real-time access

**Note:** Alpaca already includes IEX market data for free. Polygon.io would only be needed if you require consolidated NBBO data or more extensive historical data.

**Sources:**
- [Polygon.io (Massive) Pricing](https://polygon.io/pricing)
- [Polygon.io API Overview](https://polygon.io/)

---

### 6. Alpha Vantage - Market Data Only

**Overview:** Free financial data API, primarily for historical and fundamental data. Not suitable as a primary data source for paper trading due to severe rate limits.

**Pricing:**
- Free: 25 requests/day, 5 requests/minute
- Premium: $49.99-$249.99/month (no daily caps)

**Free Tier Limitations:**
- Only 25 API requests per day
- 5 requests per minute
- Insufficient for any real-time trading application

**Verdict:** Not suitable for a paper trading platform due to rate limits.

**Sources:**
- [Alpha Vantage Support](https://www.alphavantage.co/support/)
- [Alpha Vantage Premium](https://www.alphavantage.co/premium/)

---

## Recommendation for Outvestments

### Primary Recommendation: Alpaca Paper Trading API

**Immediate Implementation (MVP):**
- Use Alpaca's free Paper-Only Account
- Each user creates their own Alpaca paper account
- Your platform orchestrates via stored API keys
- Free IEX real-time data included
- 200 requests/minute rate limit is sufficient for moderate usage

**Architecture:**
```
User -> Outvestments Platform -> Alpaca Paper API
                              -> (Optional) Polygon.io for enhanced data
```

**Multi-User Scaling Options:**

1. **Individual Accounts (Simple):** Each Outvestments user creates their own Alpaca paper account and provides API keys to your platform. This complies with Alpaca's personal use terms.

2. **Broker API (Enterprise):** When ready to scale, apply for Alpaca's Broker API partnership. This allows you to:
   - Create and manage accounts programmatically
   - Full control over user onboarding
   - White-label brokerage services
   - Requires compliance setup and partnership agreement

### Secondary Data Source (If Needed): Polygon.io

Only add Polygon.io if you need:
- Consolidated NBBO data (vs. IEX-only from Alpaca free)
- More extensive historical data (>2 years)
- Additional market data features

**Cost:** Start with free tier for development, budget ~$100/month for production.

### Why NOT the Others:

| Platform | Reason to Avoid |
|----------|-----------------|
| TD Ameritrade/Schwab | API discontinued, no paper trading API |
| Interactive Brokers | Complex setup, requires eventual account funding, pacing violations |
| Tradier | 15-minute delayed data in sandbox is unusable for realistic simulation |
| Alpha Vantage | 25 requests/day is insufficient |

---

## Implementation Checklist

### Phase 1: MVP with Alpaca
- [ ] Create Alpaca Paper-Only Account
- [ ] Generate API keys
- [ ] Implement core trading endpoints:
  - GET /v2/account (account info)
  - POST /v2/orders (place orders)
  - GET /v2/orders (list orders)
  - GET /v2/positions (current holdings)
  - DELETE /v2/orders/{id} (cancel order)
- [ ] Implement market data endpoints:
  - GET /v2/stocks/{symbol}/quotes (real-time quotes)
  - GET /v2/stocks/{symbol}/bars (historical OHLCV)
- [ ] Set up WebSocket for real-time updates

### Phase 2: Multi-User Support
- [ ] Design user API key storage (encrypted)
- [ ] Implement per-user rate limiting
- [ ] Add account reset functionality
- [ ] Build leaderboard based on portfolio performance

### Phase 3: Scale (If Needed)
- [ ] Evaluate Broker API partnership
- [ ] Consider Polygon.io for enhanced data
- [ ] Implement caching layer for market data

---

## API Endpoints Quick Reference

### Alpaca Paper Trading Endpoints

Base URL: `https://paper-api.alpaca.markets`

**Authentication Headers:**
```
APCA-API-KEY-ID: {your-api-key}
APCA-API-SECRET-KEY: {your-secret-key}
```

**Key Endpoints:**
```
GET  /v2/account                    # Account info
GET  /v2/positions                  # All positions
GET  /v2/positions/{symbol}         # Specific position
POST /v2/orders                     # Place order
GET  /v2/orders                     # List orders
GET  /v2/orders/{order_id}          # Get order
DELETE /v2/orders/{order_id}        # Cancel order
DELETE /v2/positions/{symbol}       # Close position
```

**Market Data (IEX):**
```
GET /v2/stocks/{symbol}/quotes      # Latest quote
GET /v2/stocks/{symbol}/bars        # Historical bars
GET /v2/stocks/snapshots            # Multiple stocks
```

---

## Conclusion

**Alpaca Paper Trading API** is the clear choice for the Outvestments platform based on:

1. **Free tier** with real-time data and no funded account requirement
2. **Excellent documentation** and developer experience
3. **Clear path to multi-user** via Broker API when needed
4. **Active community** and modern REST API design
5. **Used by major platforms** (Robinhood, Webull) validating reliability

Start with individual paper accounts for the MVP, then evaluate Broker API partnership as user growth warrants.

---

## Sources

- [Alpaca Paper Trading](https://docs.alpaca.markets/docs/paper-trading)
- [Alpaca Trading API](https://docs.alpaca.markets/docs/trading-api)
- [Alpaca Broker API](https://alpaca.markets/broker)
- [Alpaca Rate Limits](https://alpaca.markets/support/usage-limit-api-calls)
- [Tradier Developer Portal](https://developer.tradier.com/)
- [Tradier Rate Limiting](https://documentation.tradier.com/brokerage-api/overview/rate-limiting)
- [Interactive Brokers API](https://www.interactivebrokers.com/en/trading/ib-api.php)
- [IBKR Paper Trading](https://www.interactivebrokers.com/campus/trading-lessons/request-paper-trading-account/)
- [Polygon.io Pricing](https://polygon.io/pricing)
- [TD Ameritrade API Status](https://blog.pickmytrade.trade/td-ameritrade-have-api-2025/)
- [Schwab Developer Portal](https://developer.schwab.com/products/trader-api--individual)
- [Alpha Vantage Support](https://www.alphavantage.co/support/)
