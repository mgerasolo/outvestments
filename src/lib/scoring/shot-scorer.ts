/**
 * Shot Scorer - Execution quality scoring
 *
 * 4 metrics (weighted):
 * - Performance Score: 45%
 * - Shot Forecast Edge: 35%
 * - Perfect Shot Capture: 20%
 *
 * Plus:
 * - Risk Mitigation (converted to multiplier: 0.70 to 1.10)
 * - Adaptability Bonus (Pro only: -5 to +5)
 */

import type { ShotScoringInput, ShotScore, ShotMetricScores, RiskGrade, LetterGrade } from './types';
import { SHOT_WEIGHTS, DAYS_PER_MONTH, DAYS_PER_YEAR, SCORE_MIN, SCORE_MAX } from './constants';
import { scoreToGrade, clampScore } from './grade-mapper';
import { calculateForecastEdge } from './interpolators';
import { assessRisk, calculateAdaptabilityBonus } from './risk-assessor';

/**
 * Calculate Performance Score
 *
 * Time-weighted P&L relative to opportunity cost
 * Higher returns in shorter time = better score
 */
export function calculatePerformanceScore(
  entryPrice: number,
  exitPrice: number,
  durationDays: number,
  marketReturnPercent: number
): number {
  const returnPercent = (exitPrice - entryPrice) / entryPrice;

  // Annualize returns for comparison
  const annualizedReturn = durationDays > 0 ? (returnPercent / durationDays) * DAYS_PER_YEAR : 0;
  const annualizedMarket = durationDays > 0 ? (marketReturnPercent / durationDays) * DAYS_PER_YEAR : 0;

  // Calculate excess return (alpha)
  const alpha = annualizedReturn - annualizedMarket;

  // Map alpha to score (-50 to +50)
  // Roughly: +50% alpha = +50, -50% alpha = -50
  const score = alpha * 100;

  return clampScore(score);
}

/**
 * Calculate Perfect Shot Capture (PSC)
 *
 * How efficiently the available opportunity was captured
 * PSC = RealizedReturn / PerfectShotMax
 */
export function calculatePerfectShotCapture(
  entryPrice: number,
  exitPrice: number,
  peakPrice: number
): number {
  const realizedReturn = (exitPrice - entryPrice) / entryPrice;
  const perfectReturn = (peakPrice - entryPrice) / entryPrice;

  // Handle edge cases
  if (perfectReturn <= 0) {
    // No upside opportunity - score based on minimizing loss
    if (realizedReturn >= 0) return 50; // Made money when there was no upside
    return realizedReturn * 100; // Penalize based on loss
  }

  // Calculate capture ratio
  const captureRatio = realizedReturn / perfectReturn;

  // Map to score (-50 to +50)
  // 100% capture = 50, 50% capture = 0, 0% capture = -25, negative = -50
  if (captureRatio >= 1) return 50;
  if (captureRatio >= 0) {
    // Linear interpolation from 0 to 50 for 0% to 100% capture
    return (captureRatio - 0.5) * 100;
  }
  // Negative capture (loss when there was gain opportunity)
  return Math.max(-50, captureRatio * 50);
}

/**
 * Calculate Shot Forecast Edge
 *
 * Execution-level outperformance vs market while capital was deployed
 */
export function calculateShotForecastEdge(
  shotReturnPercent: number,
  marketReturnPercent: number
): number {
  return calculateForecastEdge(shotReturnPercent, marketReturnPercent);
}

/**
 * Calculate all shot metrics
 */
export function calculateShotMetrics(input: ShotScoringInput): ShotMetricScores {
  const durationDays = Math.ceil(
    (input.exitDate.getTime() - input.entryDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const shotReturnPercent = (input.exitPrice - input.entryPrice) / input.entryPrice;

  // Calculate individual metrics
  const performanceScore = calculatePerformanceScore(
    input.entryPrice,
    input.exitPrice,
    durationDays,
    input.marketReturnPercent
  );

  const shotForecastEdge = calculateShotForecastEdge(
    shotReturnPercent,
    input.marketReturnPercent
  );

  const perfectShotCapture = calculatePerfectShotCapture(
    input.entryPrice,
    input.exitPrice,
    input.peakPrice
  );

  // Calculate risk mitigation score
  const riskAssessment = assessRisk({
    planQuality: input.riskPlanQuality,
    executionDiscipline: input.executionDiscipline,
  });

  return {
    performanceScore: clampScore(performanceScore),
    shotForecastEdge: clampScore(shotForecastEdge),
    perfectShotCapture: clampScore(perfectShotCapture),
    riskMitigationScore: riskAssessment.riskScore,
  };
}

/**
 * Calculate weighted base score from metrics
 */
export function calculateShotBaseScore(metrics: ShotMetricScores): number {
  const weightedSum =
    metrics.performanceScore * SHOT_WEIGHTS.performanceScore +
    metrics.shotForecastEdge * SHOT_WEIGHTS.shotForecastEdge +
    metrics.perfectShotCapture * SHOT_WEIGHTS.perfectShotCapture;

  return weightedSum;
}

/**
 * Calculate time-normalized profits for a shot
 */
export function calculateTimeNormalizedProfits(
  returnPercent: number,
  durationDays: number
): { perDay: number; perMonth: number; perYear: number } {
  if (durationDays <= 0) {
    return { perDay: 0, perMonth: 0, perYear: 0 };
  }

  const perDay = returnPercent / durationDays;
  const perMonth = perDay * DAYS_PER_MONTH;
  const perYear = perDay * DAYS_PER_YEAR;

  return { perDay, perMonth, perYear };
}

/**
 * Calculate capital-time weight for aggregation
 *
 * Weight = PositionSize × DaysHeld
 * Used for capital-weighted averaging across shots
 */
export function calculateCapitalTimeWeight(
  positionSize: number,
  durationDays: number
): number {
  return positionSize * durationDays;
}

/**
 * Calculate complete shot score
 */
export function calculateShotScore(input: ShotScoringInput): ShotScore {
  // Calculate duration
  const durationDays = Math.ceil(
    (input.exitDate.getTime() - input.entryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate metrics
  const metrics = calculateShotMetrics(input);

  // Calculate base score
  const baseScore = calculateShotBaseScore(metrics);

  // Get risk assessment
  const riskAssessment = assessRisk({
    planQuality: input.riskPlanQuality,
    executionDiscipline: input.executionDiscipline,
  });

  // Calculate adaptability bonus
  const adaptability = calculateAdaptabilityBonus(
    input.adaptabilityScore || 0,
    input.isPro
  );

  // Calculate final score
  // FinalShotScore = (BaseScore × RiskMultiplier) + AdaptabilityBonus
  let finalScore = baseScore * riskAssessment.riskMultiplier + adaptability.bonus;
  finalScore = clampScore(finalScore);

  // Get letter grade
  const letterGrade = scoreToGrade(finalScore);

  // Calculate time-normalized returns
  const returnPercent = (input.exitPrice - input.entryPrice) / input.entryPrice;
  const profits = calculateTimeNormalizedProfits(returnPercent, durationDays);

  // Calculate capital-time weight
  const capitalTimeWeight = calculateCapitalTimeWeight(input.positionSize, durationDays);

  return {
    shotId: input.shotId,
    aimId: input.aimId,
    metrics,
    riskGrade: riskAssessment.riskGrade,
    riskMultiplier: riskAssessment.riskMultiplier,
    adaptabilityScore: input.adaptabilityScore || 0,
    adaptabilityBonus: adaptability.bonus,
    adaptabilityLocked: adaptability.locked,
    baseScore,
    finalScore,
    letterGrade,
    profitPerDay: profits.perDay,
    profitPerMonth: profits.perMonth,
    profitPerYear: profits.perYear,
    capitalTimeWeight,
    calculatedAt: new Date(),
  };
}
