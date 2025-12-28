/**
 * Quotes service module
 *
 * Provides real-time stock quotes with 30-minute caching.
 * Uses Alpaca Market Data API with circuit breaker protection.
 */

export {
  getQuote,
  getQuotes,
  getCacheStats,
  invalidateCache,
  purgeStaleCache,
  type Quote,
  type QuoteResult,
  type BatchQuoteResult,
} from "./service";
