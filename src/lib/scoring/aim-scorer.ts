/**
 * Aim Scorer - PRIMARY SCORING UNIT
 *
 * 4 metrics (weighted average, stays on -50 to +50 scale):
 * - Directional Accuracy: 20%
 * - Magnitude Accuracy: 30%
 * - Forecast Edge: 35%
 * - Thesis Validity: 15%
 *
 * Difficulty is calculated and displayed independently (1.0 to 5.0)
 */

import type { AimScoringInput, AimScore, AimMetricScores, LetterGrade } from './types';
import { AIM_WEIGHTS, DIFFICULTY_MIN, DIFFICULTY_MAX, DIFFICULTY_DIVISOR, EMR_BASELINE, DAYS_PER_MONTH, DAYS_PER_YEAR, THESIS_VALIDITY_SCORES } from './constants';
import { scoreToGrade, clampScore } from './grade-mapper';
import { calculateDirectionalAccuracy, calculateMagnitudeAccuracy, calculateForecastEdge } from './interpolators';

/**
 * Calculate the difficulty multiplier for an aim
 *
 * Formula: 1.0 + (alpha_decimal / 2.0)
 * Where alpha = predicted_return - market_baseline (annualized)
 *
 * Example: 50% predicted return, 10% baseline → alpha = 0.40
 *          Difficulty = 1.0 + (0.40 / 2) = 1.20
 */
export function calculateDifficulty(
  predictedReturnPercent: number,
  durationDays: number,
  marketBaseline: number = EMR_BASELINE
): number {
  // Annualize the predicted return
  const annualizedReturn = annualizeReturn(predictedReturnPercent, durationDays);

  // Calculate alpha (excess return over baseline)
  const alpha = annualizedReturn - marketBaseline;

  // Apply difficulty formula
  const difficulty = 1.0 + (alpha / DIFFICULTY_DIVISOR);

  // Clamp to valid range
  return Math.max(DIFFICULTY_MIN, Math.min(DIFFICULTY_MAX, difficulty));
}

/**
 * Annualize a return percentage
 */
export function annualizeReturn(returnPercent: number, durationDays: number): number {
  if (durationDays <= 0) return 0;
  return (returnPercent / durationDays) * DAYS_PER_YEAR;
}

/**
 * Calculate thesis validity score
 *
 * Based on:
 * - Did the catalyst event occur?
 * - Did price react as expected?
 * - Were risks documented? (caps at 0 if not)
 */
export function calculateThesisValidity(
  catalystOccurred: boolean | undefined,
  priceReactionAligned: boolean | undefined,
  risksDocumented: boolean
): { score: number; capped: boolean } {
  // If catalyst data not provided, default to neutral
  if (catalystOccurred === undefined) {
    return { score: 0, capped: false };
  }

  // Find matching score from lookup table
  let score = 0;
  const priceReaction = priceReactionAligned === undefined
    ? 'muted'
    : (priceReactionAligned ? 'expected' : 'opposite');

  for (const entry of THESIS_VALIDITY_SCORES) {
    if (entry.eventOccurred === catalystOccurred && entry.priceReaction === priceReaction) {
      score = entry.score;
      break;
    }
  }

  // Cap at 0 if risks not documented
  const capped = !risksDocumented && score > 0;
  if (capped) {
    score = 0;
  }

  return { score, capped };
}

/**
 * Calculate all aim metrics
 */
export function calculateAimMetrics(input: AimScoringInput): AimMetricScores {
  // Calculate predicted and actual moves
  const predictedMovePercent = (input.targetPrice - input.entryPrice) / input.entryPrice;
  const actualMovePercent = (input.actualPrice - input.entryPrice) / input.entryPrice;

  // Determine predicted direction
  const predictedDirection: 1 | -1 = predictedMovePercent >= 0 ? 1 : -1;

  // Calculate individual metrics
  const directionalAccuracy = calculateDirectionalAccuracy(predictedDirection, actualMovePercent);
  const magnitudeAccuracy = calculateMagnitudeAccuracy(predictedMovePercent, actualMovePercent);
  const forecastEdge = calculateForecastEdge(actualMovePercent, input.marketReturnPercent);
  const { score: thesisValidity } = calculateThesisValidity(
    input.catalystOccurred,
    input.priceReactionAligned,
    input.risksDocumented
  );

  return {
    directionalAccuracy: clampScore(directionalAccuracy),
    magnitudeAccuracy: clampScore(magnitudeAccuracy),
    forecastEdge: clampScore(forecastEdge),
    thesisValidity: clampScore(thesisValidity),
  };
}

/**
 * Calculate weighted average of aim metrics
 * Result stays on -50 to +50 scale
 */
export function calculateAimFinalScore(metrics: AimMetricScores): number {
  const weightedSum =
    metrics.directionalAccuracy * AIM_WEIGHTS.directionalAccuracy +
    metrics.magnitudeAccuracy * AIM_WEIGHTS.magnitudeAccuracy +
    metrics.forecastEdge * AIM_WEIGHTS.forecastEdge +
    metrics.thesisValidity * AIM_WEIGHTS.thesisValidity;

  return clampScore(weightedSum);
}

/**
 * Calculate time-normalized profits for an aim
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
 * Calculate complete aim score
 */
export function calculateAimScore(input: AimScoringInput): AimScore {
  // Calculate metrics
  const metrics = calculateAimMetrics(input);

  // Calculate difficulty
  const predictedMovePercent = (input.targetPrice - input.entryPrice) / input.entryPrice;
  const durationDays = Math.ceil(
    (input.closeDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const difficultyMultiplier = calculateDifficulty(predictedMovePercent, durationDays);

  // Calculate final score (weighted average, NOT multiplied by difficulty)
  const finalScore = calculateAimFinalScore(metrics);

  // Get letter grade
  const letterGrade = scoreToGrade(finalScore);

  // Calculate time-normalized returns
  const actualMovePercent = (input.actualPrice - input.entryPrice) / input.entryPrice;
  const predictedDurationDays = Math.ceil(
    (input.targetDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const predicted = calculateTimeNormalizedProfits(predictedMovePercent, predictedDurationDays);
  const actual = calculateTimeNormalizedProfits(actualMovePercent, durationDays);

  // Check thesis validity capping
  const { capped: thesisValidityCapped } = calculateThesisValidity(
    input.catalystOccurred,
    input.priceReactionAligned,
    input.risksDocumented
  );

  return {
    aimId: input.aimId,
    metrics,
    difficultyMultiplier,
    finalScore,
    letterGrade,
    predictedProfitPerDay: predicted.perDay,
    predictedProfitPerMonth: predicted.perMonth,
    predictedProfitPerYear: predicted.perYear,
    actualProfitPerDay: actual.perDay,
    actualProfitPerMonth: actual.perMonth,
    actualProfitPerYear: actual.perYear,
    risksDocumented: input.risksDocumented,
    thesisValidityCapped,
    selfRating: input.selfRating,
    selfReflectionNotes: input.selfReflectionNotes,
    calculatedAt: new Date(),
  };
}
