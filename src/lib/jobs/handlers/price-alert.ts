/**
 * Price alert job handler.
 *
 * Periodic job to check watchlist alert prices against current market prices.
 * Runs every 5 minutes during market hours.
 *
 * @module lib/jobs/handlers/price-alert
 */

import type {
  Job,
  JobResult,
  JobHandler,
  PriceAlertJobData,
} from '@/lib/jobs/types';
import { db } from '@/lib/db';
import { watchlist, priceCache, auditLogs } from '@/lib/db/schema';
import { isNotNull, sql } from 'drizzle-orm';

/**
 * Checks if market is currently open (approximate).
 * Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
 */
function isMarketOpen(): boolean {
  const now = new Date();
  const etOffset = -5; // EST (adjust for EDT if needed)
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const etHours = (utcHours + 24 + etOffset) % 24;
  const dayOfWeek = now.getUTCDay();

  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = etHours > 9 || (etHours === 9 && utcMinutes >= 30);
  const marketClose = etHours < 16;

  return marketOpen && marketClose;
}

/**
 * Alert trigger result for a single symbol.
 */
interface AlertTrigger {
  userId: string;
  symbol: string;
  alertPrice: number;
  currentPrice: number;
  direction: 'above' | 'below';
}

/**
 * Handles the price-alert job.
 *
 * This job:
 * 1. Fetches all watchlist items with alert prices set
 * 2. Gets current prices for those symbols
 * 3. Checks if any alert thresholds have been crossed
 * 4. Logs triggered alerts to audit log (notifications handled separately)
 *
 * @param job - The pg-boss job instance with price alert data
 * @returns Promise resolving to the job result
 */
export const handler: JobHandler<PriceAlertJobData> = async (
  job: Job<PriceAlertJobData>
): Promise<JobResult> => {
  const startTime = Date.now();
  const { correlationId, skipMarketCheck = false } = job.data ?? {};

  console.log('[price-alert] Job started', {
    jobId: job.id,
    correlationId,
    skipMarketCheck,
  });

  try {
    // Skip if market is closed (unless override is set)
    if (!skipMarketCheck && !isMarketOpen()) {
      const durationMs = Date.now() - startTime;
      console.log('[price-alert] Market closed, skipping', {
        jobId: job.id,
        correlationId,
        durationMs,
      });

      return {
        success: true,
        message: 'Skipped - market is closed',
        processedCount: 0,
        durationMs,
        metadata: {
          marketClosed: true,
        },
      };
    }

    // 1. Fetch all watchlist items with alert prices
    const alertItems = await db
      .select({
        userId: watchlist.userId,
        symbol: watchlist.symbol,
        alertPrice: watchlist.alertPrice,
      })
      .from(watchlist)
      .where(isNotNull(watchlist.alertPrice));

    if (alertItems.length === 0) {
      const durationMs = Date.now() - startTime;
      console.log('[price-alert] No alert items found', {
        jobId: job.id,
        durationMs,
      });

      return {
        success: true,
        message: 'No watchlist alerts configured',
        processedCount: 0,
        durationMs,
      };
    }

    // 2. Get unique symbols
    const symbols = [...new Set(alertItems.map((item) => item.symbol))];

    console.log(`[price-alert] Checking ${alertItems.length} alerts across ${symbols.length} symbols`);

    // 3. Fetch current prices from cache
    const cachedPrices = await db
      .select({
        symbol: priceCache.symbol,
        price: priceCache.price,
      })
      .from(priceCache)
      .where(sql`${priceCache.symbol} = ANY(${symbols})`);

    const priceMap = new Map(
      cachedPrices.map((p) => [p.symbol, parseFloat(p.price)])
    );

    // 4. Check for triggered alerts
    const triggeredAlerts: AlertTrigger[] = [];

    for (const item of alertItems) {
      const currentPrice = priceMap.get(item.symbol);
      const alertPrice = item.alertPrice ? parseFloat(item.alertPrice) : null;

      if (currentPrice === undefined || alertPrice === null) {
        continue;
      }

      // We need to track if this alert has been triggered before
      // For now, we log all crossings. In production, you'd track last known state
      // to detect crossing direction (price moved from below to above, or above to below)

      const crossedAbove = currentPrice >= alertPrice;
      const crossedBelow = currentPrice <= alertPrice;

      // For simplicity, we trigger if price equals or exceeds the alert price
      // A more sophisticated implementation would track direction
      if (crossedAbove || crossedBelow) {
        triggeredAlerts.push({
          userId: item.userId,
          symbol: item.symbol,
          alertPrice,
          currentPrice,
          direction: crossedAbove ? 'above' : 'below',
        });
      }
    }

    // 5. Log triggered alerts to audit log
    if (triggeredAlerts.length > 0) {
      await db.insert(auditLogs).values(
        triggeredAlerts.map((alert) => ({
          userId: alert.userId,
          action: 'PRICE_ALERT_TRIGGERED',
          entityType: 'watchlist',
          payload: {
            symbol: alert.symbol,
            alertPrice: alert.alertPrice,
            currentPrice: alert.currentPrice,
            direction: alert.direction,
            triggeredAt: new Date().toISOString(),
          },
        }))
      );

      console.log('[price-alert] Triggered alerts', {
        count: triggeredAlerts.length,
        symbols: triggeredAlerts.map((a) => a.symbol),
      });
    }

    const durationMs = Date.now() - startTime;

    console.log('[price-alert] Job completed', {
      jobId: job.id,
      correlationId,
      alertsChecked: alertItems.length,
      alertsTriggered: triggeredAlerts.length,
      durationMs,
    });

    return {
      success: true,
      message: `Checked ${alertItems.length} alerts, ${triggeredAlerts.length} triggered`,
      processedCount: alertItems.length,
      durationMs,
      metadata: {
        symbolsChecked: symbols.length,
        alertsTriggered: triggeredAlerts.length,
        triggeredSymbols: triggeredAlerts.map((a) => a.symbol),
      },
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('[price-alert] Job failed', {
      jobId: job.id,
      correlationId,
      error: errorMessage,
      durationMs,
    });

    throw error;
  }
};

export default handler;
