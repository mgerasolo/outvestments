/**
 * End-of-day snapshot job handler.
 *
 * Daily 4:30 PM ET job to capture end-of-day portfolio state
 * including positions, valuations, and performance metrics.
 *
 * @module lib/jobs/handlers/eod-snapshot
 */

import type {
  Job,
  EodSnapshotJobData,
  JobResult,
  JobHandler,
} from '@/lib/jobs/types';
import { db } from '@/lib/db';
import { users, alpacaCredentials, portfolioSnapshots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';

/**
 * Gets the current trading date in YYYY-MM-DD format.
 */
function getTradingDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Decrypt Alpaca credentials for a user
 */
function decryptCredentials(encrypted: { encryptedKey: string; encryptedSecret: string; iv: string }) {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'base64');
  const iv = Buffer.from(encrypted.iv, 'hex');

  const decipherKey = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let apiKey = decipherKey.update(encrypted.encryptedKey, 'hex', 'utf8');
  apiKey += decipherKey.final('utf8');

  const decipherSecret = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let apiSecret = decipherSecret.update(encrypted.encryptedSecret, 'hex', 'utf8');
  apiSecret += decipherSecret.final('utf8');

  return { apiKey, apiSecret };
}

/**
 * Fetch portfolio from Alpaca for a user
 */
async function fetchAlpacaPortfolio(apiKey: string, apiSecret: string) {
  const headers = {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': apiSecret,
  };

  // Fetch account and positions in parallel
  const [accountRes, positionsRes] = await Promise.all([
    fetch(`${ALPACA_BASE_URL}/v2/account`, { headers }),
    fetch(`${ALPACA_BASE_URL}/v2/positions`, { headers }),
  ]);

  if (!accountRes.ok) {
    throw new Error(`Alpaca account fetch failed: ${accountRes.status}`);
  }

  const account = await accountRes.json();
  const positions = positionsRes.ok ? await positionsRes.json() : [];

  return { account, positions };
}

/**
 * Handles the eod-snapshot job.
 *
 * This job:
 * 1. Fetches all users with Alpaca credentials
 * 2. For each user, fetches their current portfolio state
 * 3. Stores a snapshot in the database
 */
export const handler: JobHandler<EodSnapshotJobData> = async (
  job: Job<EodSnapshotJobData>
): Promise<JobResult> => {
  const startTime = Date.now();
  const {
    tradingDate = getTradingDate(),
    correlationId,
  } = job.data ?? {};

  console.log('[eod-snapshot] Job started', {
    jobId: job.id,
    correlationId,
    tradingDate,
  });

  try {
    // 1. Fetch all users with Alpaca credentials
    const usersWithCredentials = await db
      .select({
        userId: users.id,
        encryptedKey: alpacaCredentials.encryptedKey,
        encryptedSecret: alpacaCredentials.encryptedSecret,
        iv: alpacaCredentials.iv,
      })
      .from(users)
      .innerJoin(alpacaCredentials, eq(users.id, alpacaCredentials.userId));

    console.log(`[eod-snapshot] Found ${usersWithCredentials.length} users with Alpaca credentials`);

    let processedCount = 0;
    let errorCount = 0;

    // 2. For each user, fetch portfolio and create snapshot
    for (const userCreds of usersWithCredentials) {
      try {
        // Decrypt credentials
        const { apiKey, apiSecret } = decryptCredentials({
          encryptedKey: userCreds.encryptedKey,
          encryptedSecret: userCreds.encryptedSecret,
          iv: userCreds.iv,
        });

        // Fetch portfolio from Alpaca
        const { account, positions } = await fetchAlpacaPortfolio(apiKey, apiSecret);

        // Create snapshot
        const portfolioValue = parseFloat(account.portfolio_value || '0');
        const cash = parseFloat(account.cash || '0');
        const buyingPower = parseFloat(account.buying_power || '0');
        const lastEquity = parseFloat(account.last_equity || '0');
        const dayPL = portfolioValue - lastEquity;
        const dayPLPercent = lastEquity > 0 ? (dayPL / lastEquity) * 100 : 0;

        const positionsSnapshot = positions.map((p: Record<string, string>) => ({
          symbol: p.symbol,
          qty: p.qty,
          marketValue: p.market_value,
          avgEntryPrice: p.avg_entry_price,
          currentPrice: p.current_price,
          unrealizedPL: p.unrealized_pl,
          unrealizedPLPercent: p.unrealized_plpc,
        }));

        // Insert snapshot
        await db.insert(portfolioSnapshots).values({
          userId: userCreds.userId,
          tradingDate: new Date(`${tradingDate}T16:30:00-05:00`), // 4:30 PM ET
          portfolioValue: portfolioValue.toFixed(2),
          cash: cash.toFixed(2),
          buyingPower: buyingPower.toFixed(2),
          dayPL: dayPL.toFixed(2),
          dayPLPercent: dayPLPercent.toFixed(4),
          positionsSnapshot,
        });

        processedCount++;
        console.log(`[eod-snapshot] Created snapshot for user ${userCreds.userId}`, {
          portfolioValue,
          positions: positions.length,
        });

      } catch (userError) {
        errorCount++;
        console.error(`[eod-snapshot] Failed for user ${userCreds.userId}:`, userError);
        // Continue with other users
      }
    }

    const durationMs = Date.now() - startTime;

    console.log('[eod-snapshot] Job completed', {
      jobId: job.id,
      correlationId,
      tradingDate,
      processedCount,
      errorCount,
      durationMs,
    });

    return {
      success: true,
      message: `Created EOD snapshots for ${processedCount} users on ${tradingDate}`,
      processedCount,
      durationMs,
      metadata: {
        tradingDate,
        errorCount,
      },
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('[eod-snapshot] Job failed', {
      jobId: job.id,
      correlationId,
      tradingDate,
      error: errorMessage,
      durationMs,
    });

    throw error;
  }
};

export default handler;
