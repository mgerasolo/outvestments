/**
 * Target Scorer - Aggregates Aims and Shots
 *
 * Dual scores:
 * - Prediction Score: Weighted average of Aim scores (thinking quality)
 * - Performance Score: Weighted average of Shot scores (execution quality)
 *
 * Plus comprehensive P&L, capital, and market comparison metrics
 */

import type { TargetScore, LetterGrade, AimScore, ShotScore } from './types';
import { DAYS_PER_MONTH, DAYS_PER_YEAR } from './constants';
import { scoreToGrade, clampScore } from './grade-mapper';

/**
 * Input for target scoring
 */
export interface TargetScoringInput {
  targetId: string;
  userId: string;

  // Aim scores for this target
  aimScores: AimScore[];

  // Shot scores for this target (aggregated across all aims)
  shotScores: ShotScore[];

  // Shot details for P&L calculation
  shotDetails: {
    shotId: string;
    entryPrice: number;
    exitPrice: number;
    positionSize: number;
    daysHeld: number;
    peakPrice: number;
  }[];

  // Target dates
  firstAimDate: Date;
  closeDate: Date;

  // Market comparison
  marketReturnPercent: number;
}

/**
 * Calculate prediction score (weighted average of aim scores)
 */
export function calculatePredictionScore(aimScores: AimScore[]): number | null {
  if (aimScores.length === 0) return null;

  // Equal weighting for now (could weight by difficulty or capital later)
  const sum = aimScores.reduce((acc, aim) => acc + aim.finalScore, 0);
  return sum / aimScores.length;
}

/**
 * Calculate performance score (capital-time weighted average of shot scores)
 */
export function calculatePerformanceScore(
  shotScores: ShotScore[],
  shotDetails: TargetScoringInput['shotDetails']
): number | null {
  if (shotScores.length === 0) return null;

  // Create lookup for capital-time weights
  const weightMap = new Map<string, number>();
  for (const detail of shotDetails) {
    const weight = detail.positionSize * detail.daysHeld;
    weightMap.set(detail.shotId, weight);
  }

  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  for (const shot of shotScores) {
    const weight = weightMap.get(shot.shotId) || 1;
    weightedSum += shot.finalScore * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/**
 * Calculate P&L metrics
 */
export function calculatePnlMetrics(
  shotDetails: TargetScoringInput['shotDetails']
): {
  totalPnlDollars: number;
  totalPnlPercent: number;
  maxPossibleReturnPercent: number;
  totalCapitalInvested: number;
  peakCapitalAtOnce: number;
  capitalEfficiency: number;
} {
  if (shotDetails.length === 0) {
    return {
      totalPnlDollars: 0,
      totalPnlPercent: 0,
      maxPossibleReturnPercent: 0,
      totalCapitalInvested: 0,
      peakCapitalAtOnce: 0,
      capitalEfficiency: 0,
    };
  }

  let totalPnlDollars = 0;
  let totalCapitalInvested = 0;
  let maxPossibleDollars = 0;

  for (const shot of shotDetails) {
    const quantity = shot.positionSize / shot.entryPrice;
    const pnl = (shot.exitPrice - shot.entryPrice) * quantity;
    const maxPnl = (shot.peakPrice - shot.entryPrice) * quantity;

    totalPnlDollars += pnl;
    totalCapitalInvested += shot.positionSize;
    maxPossibleDollars += Math.max(0, maxPnl);
  }

  const totalPnlPercent = totalCapitalInvested > 0
    ? totalPnlDollars / totalCapitalInvested
    : 0;

  const maxPossibleReturnPercent = totalCapitalInvested > 0
    ? maxPossibleDollars / totalCapitalInvested
    : 0;

  // For peakCapitalAtOnce, we'd need overlapping position data
  // Simplified: use total capital for now
  const peakCapitalAtOnce = totalCapitalInvested;

  const capitalEfficiency = peakCapitalAtOnce > 0
    ? totalPnlDollars / peakCapitalAtOnce
    : 0;

  return {
    totalPnlDollars,
    totalPnlPercent,
    maxPossibleReturnPercent,
    totalCapitalInvested,
    peakCapitalAtOnce,
    capitalEfficiency,
  };
}

/**
 * Calculate time metrics
 */
export function calculateTimeMetrics(
  shotDetails: TargetScoringInput['shotDetails'],
  firstAimDate: Date,
  closeDate: Date
): {
  targetDurationDays: number;
  avgHoldingPeriodDays: number;
  heldUntilEnd: boolean;
} {
  const targetDurationDays = Math.ceil(
    (closeDate.getTime() - firstAimDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const avgHoldingPeriodDays = shotDetails.length > 0
    ? Math.round(shotDetails.reduce((sum, s) => sum + s.daysHeld, 0) / shotDetails.length)
    : 0;

  // Check if any shot was held until the end
  // This would require exit dates, simplified assumption for now
  const heldUntilEnd = shotDetails.some(s => s.daysHeld >= targetDurationDays * 0.8);

  return {
    targetDurationDays,
    avgHoldingPeriodDays,
    heldUntilEnd,
  };
}

/**
 * Calculate prediction accuracy metrics
 */
export function calculatePredictionAccuracy(
  aimScores: AimScore[]
): {
  predictedReturnPercent: number;
  actualReturnPercent: number;
  predictionAccuracyRatio: number;
} {
  if (aimScores.length === 0) {
    return {
      predictedReturnPercent: 0,
      actualReturnPercent: 0,
      predictionAccuracyRatio: 0,
    };
  }

  // Use annualized returns for comparison
  const avgPredictedAnnualized = aimScores.reduce(
    (sum, aim) => sum + aim.predictedProfitPerYear,
    0
  ) / aimScores.length;

  const avgActualAnnualized = aimScores.reduce(
    (sum, aim) => sum + aim.actualProfitPerYear,
    0
  ) / aimScores.length;

  const predictionAccuracyRatio = avgPredictedAnnualized !== 0
    ? avgActualAnnualized / avgPredictedAnnualized
    : 0;

  return {
    predictedReturnPercent: avgPredictedAnnualized,
    actualReturnPercent: avgActualAnnualized,
    predictionAccuracyRatio,
  };
}

/**
 * Calculate win/loss stats
 */
export function calculateWinLossStats(
  aimScores: AimScore[]
): {
  winningAimsCount: number;
  totalAimsCount: number;
  winRatio: number;
} {
  const totalAimsCount = aimScores.length;

  // Winning aim = positive directional accuracy (correct direction)
  const winningAimsCount = aimScores.filter(
    aim => aim.metrics.directionalAccuracy > 0
  ).length;

  const winRatio = totalAimsCount > 0 ? winningAimsCount / totalAimsCount : 0;

  return {
    winningAimsCount,
    totalAimsCount,
    winRatio,
  };
}

/**
 * Calculate time-normalized average profits
 */
export function calculateAverageProfits(
  shotScores: ShotScore[],
  shotDetails: TargetScoringInput['shotDetails']
): {
  avgProfitPerDay: number;
  avgProfitPerMonth: number;
  avgProfitPerYear: number;
} {
  if (shotScores.length === 0) {
    return { avgProfitPerDay: 0, avgProfitPerMonth: 0, avgProfitPerYear: 0 };
  }

  // Create weight map
  const weightMap = new Map<string, number>();
  for (const detail of shotDetails) {
    weightMap.set(detail.shotId, detail.positionSize);
  }

  // Capital-weighted average of profit per day
  let totalWeight = 0;
  let weightedPpdSum = 0;

  for (const shot of shotScores) {
    const weight = weightMap.get(shot.shotId) || 1;
    weightedPpdSum += shot.profitPerDay * weight;
    totalWeight += weight;
  }

  const avgProfitPerDay = totalWeight > 0 ? weightedPpdSum / totalWeight : 0;
  const avgProfitPerMonth = avgProfitPerDay * DAYS_PER_MONTH;
  const avgProfitPerYear = avgProfitPerDay * DAYS_PER_YEAR;

  return { avgProfitPerDay, avgProfitPerMonth, avgProfitPerYear };
}

/**
 * Calculate complete target score
 */
export function calculateTargetScore(input: TargetScoringInput): TargetScore {
  // Calculate dual scores
  const predictionScore = calculatePredictionScore(input.aimScores);
  const performanceScore = calculatePerformanceScore(input.shotScores, input.shotDetails);

  const predictionGrade = predictionScore !== null
    ? scoreToGrade(predictionScore)
    : undefined;
  const performanceGrade = performanceScore !== null
    ? scoreToGrade(performanceScore)
    : undefined;

  // Calculate P&L metrics
  const pnl = calculatePnlMetrics(input.shotDetails);

  // Calculate time metrics
  const time = calculateTimeMetrics(input.shotDetails, input.firstAimDate, input.closeDate);

  // Calculate prediction accuracy
  const accuracy = calculatePredictionAccuracy(input.aimScores);

  // Calculate win/loss stats
  const winLoss = calculateWinLossStats(input.aimScores);

  // Calculate alpha vs market
  const alphaVsMarket = pnl.totalPnlPercent - input.marketReturnPercent;

  // Calculate average profits
  const profits = calculateAverageProfits(input.shotScores, input.shotDetails);

  return {
    targetId: input.targetId,
    userId: input.userId,

    predictionScore: predictionScore ?? 0,
    predictionGrade: predictionGrade ?? 'C',
    performanceScore: performanceScore ?? 0,
    performanceGrade: performanceGrade ?? 'C',

    totalPnlDollars: pnl.totalPnlDollars,
    totalPnlPercent: pnl.totalPnlPercent,
    maxPossibleReturnPercent: pnl.maxPossibleReturnPercent,

    totalCapitalInvested: pnl.totalCapitalInvested,
    peakCapitalAtOnce: pnl.peakCapitalAtOnce,
    capitalEfficiency: pnl.capitalEfficiency,

    targetDurationDays: time.targetDurationDays,
    heldUntilEnd: time.heldUntilEnd,
    avgHoldingPeriodDays: time.avgHoldingPeriodDays,

    predictedReturnPercent: accuracy.predictedReturnPercent,
    actualReturnPercent: accuracy.actualReturnPercent,
    predictionAccuracyRatio: accuracy.predictionAccuracyRatio,

    winningAimsCount: winLoss.winningAimsCount,
    totalAimsCount: winLoss.totalAimsCount,
    winRatio: winLoss.winRatio,

    marketReturnPercent: input.marketReturnPercent,
    alphaVsMarket,

    avgProfitPerDay: profits.avgProfitPerDay,
    avgProfitPerMonth: profits.avgProfitPerMonth,
    avgProfitPerYear: profits.avgProfitPerYear,

    calculatedAt: new Date(),
  };
}
