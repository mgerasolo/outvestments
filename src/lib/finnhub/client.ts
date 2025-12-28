/**
 * Finnhub API Client
 * Used for fetching symbol data, company profiles, and quotes
 *
 * API Docs: https://finnhub.io/docs/api
 * Rate Limit: 60 calls/minute on free tier
 */

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

interface FinnhubSymbol {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
  mic?: string;
  figi?: string;
  shareClassFIGI?: string;
  currency?: string;
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export class FinnhubClient {
  private apiKey: string;
  private requestCount = 0;
  private lastMinuteReset = Date.now();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FINNHUB_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("FINNHUB_API_KEY is required");
    }
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    if (now - this.lastMinuteReset > 60000) {
      this.requestCount = 0;
      this.lastMinuteReset = now;
    }

    // Stay well under 60/min limit
    if (this.requestCount >= 55) {
      const waitTime = 60000 - (now - this.lastMinuteReset) + 1000;
      console.log(`[Finnhub] Rate limit approaching, waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastMinuteReset = Date.now();
    }

    this.requestCount++;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    await this.throttle();

    const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
    url.searchParams.set("token", this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        console.log("[Finnhub] Rate limited, waiting 60s...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return this.fetch(endpoint, params);
      }
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all stock symbols for an exchange
   * @param exchange - Exchange code (e.g., "US" for all US exchanges)
   */
  async getSymbols(exchange: string = "US"): Promise<FinnhubSymbol[]> {
    return this.fetch<FinnhubSymbol[]>("/stock/symbol", { exchange });
  }

  /**
   * Get company profile including logo
   * @param symbol - Stock symbol (e.g., "AAPL")
   */
  async getProfile(symbol: string): Promise<FinnhubProfile | null> {
    try {
      const profile = await this.fetch<FinnhubProfile>("/stock/profile2", { symbol });
      // Finnhub returns empty object for unknown symbols
      if (!profile || !profile.name) {
        return null;
      }
      return profile;
    } catch {
      return null;
    }
  }

  /**
   * Get current quote for a symbol
   * @param symbol - Stock symbol (e.g., "AAPL")
   */
  async getQuote(symbol: string): Promise<FinnhubQuote> {
    return this.fetch<FinnhubQuote>("/quote", { symbol });
  }

  /**
   * Search for symbols by query
   * @param query - Search query
   */
  async searchSymbols(query: string): Promise<{ count: number; result: FinnhubSymbol[] }> {
    return this.fetch("/search", { q: query });
  }
}

// Singleton instance
let clientInstance: FinnhubClient | null = null;

export function getFinnhubClient(): FinnhubClient {
  if (!clientInstance) {
    clientInstance = new FinnhubClient();
  }
  return clientInstance;
}

export type { FinnhubSymbol, FinnhubProfile, FinnhubQuote };
