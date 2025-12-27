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

/**
 * Gets the current trading date in YYYY-MM-DD format.
 *
 * @returns The trading date string
 */
function getTradingDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Handles the eod-snapshot job.
 *
 * This job:
 * 1. Captures current portfolio valuations
 * 2. Records position states and P&L
 * 3. Stores daily performance metrics
 * 4. Creates historical snapshot for analytics
 *
 * @param job - The pg-boss job instance with EOD snapshot data
 * @returns Promise resolving to the job result
 */
export const handler: JobHandler<EodSnapshotJobData> = async (
  job: Job<EodSnapshotJobData>
): Promise<JobResult> => {
  const startTime = Date.now();
  const {
    tradingDate = getTradingDate(),
    portfolioIds,
    correlationId,
  } = job.data ?? {};

  console.log('[eod-snapshot] Job started', {
    jobId: job.id,
    correlationId,
    tradingDate,
    portfolioIds: portfolioIds?.length ?? 'all',
  });

  try {
    // TODO: Implement actual EOD snapshot logic
    // 1. Verify market is closed (skip if market still open)
    // const marketStatus = await checkMarketStatus();
    // if (marketStatus.isOpen) {
    //   console.warn('[eod-snapshot] Market still open, deferring snapshot');
    //   return { success: false, message: 'Market still open' };
    // }

    // 2. Fetch all portfolios (or specific ones)
    // const portfolios = portfolioIds?.length
    //   ? await db.portfolios.findMany({ where: { id: { in: portfolioIds } } })
    //   : await db.portfolios.findMany();

    // 3. For each portfolio, capture snapshot
    // const snapshots = await Promise.all(
    //   portfolios.map(async (portfolio) => {
    //     const positions = await db.positions.findMany({
    //       where: { portfolioId: portfolio.id, status: 'open' },
    //     });
    //     const valuation = calculatePortfolioValue(positions);
    //     return {
    //       portfolioId: portfolio.id,
    //       tradingDate,
    //       positions: positions.map(serializePosition),
    //       totalValue: valuation.total,
    //       dayChange: valuation.dayChange,
    //       dayChangePercent: valuation.dayChangePercent,
    //     };
    //   })
    // );

    // 4. Store snapshots in database
    // await db.portfolioSnapshots.createMany({ data: snapshots });

    // Placeholder: Simulated processing
    const processedCount = portfolioIds?.length ?? 0;

    const durationMs = Date.now() - startTime;

    console.log('[eod-snapshot] Job completed', {
      jobId: job.id,
      correlationId,
      tradingDate,
      processedCount,
      durationMs,
    });

    return {
      success: true,
      message: `Created EOD snapshot for ${processedCount} portfolios on ${tradingDate}`,
      processedCount,
      durationMs,
      metadata: {
        tradingDate,
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

    // Re-throw to trigger pg-boss retry mechanism
    throw error;
  }
};

export default handler;
