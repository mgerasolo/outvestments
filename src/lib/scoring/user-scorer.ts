/**
 * User Scorer - Career-level aggregation
 *
 * Aggregates all Target scores into two distinct career scores:
 * - Prediction Quality: How good are your ideas (from Aims)
 * - Performance: How well do you execute (from Shots)
 */

import type { UserCareerScore, TargetScore, LetterGrade } from './types';
import { scoreToGrade } from './grade-mapper';

/**
 * Input for user career scoring
 */
export interface UserCareerScoringInput {
  userId: string;

  // All completed target scores for this user
  targetScores: TargetScore[];

  // Total counts for stats
  totalAimsScored: number;
  totalShotsScored: number;
}

/**
 * Calculate user career prediction quality score
 * Capital-weighted average of Target prediction scores
 */
export function calculateCareerPredictionScore(
  targetScores: TargetScore[]
): number | null {
  const validTargets = targetScores.filter(
    t => t.predictionScore !== null && t.predictionScore !== undefined
  );

  if (validTargets.length === 0) return null;

  // Weight by total capital invested in each target
  let totalWeight = 0;
  let weightedSum = 0;

  for (const target of validTargets) {
    const weight = target.totalCapitalInvested || 1;
    weightedSum += (target.predictionScore ?? 0) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/**
 * Calculate user career performance score
 * Capital-weighted average of Target performance scores
 */
export function calculateCareerPerformanceScore(
  targetScores: TargetScore[]
): number | null {
  const validTargets = targetScores.filter(
    t => t.performanceScore !== null && t.performanceScore !== undefined
  );

  if (validTargets.length === 0) return null;

  // Weight by total capital invested in each target
  let totalWeight = 0;
  let weightedSum = 0;

  for (const target of validTargets) {
    const weight = target.totalCapitalInvested || 1;
    weightedSum += (target.performanceScore ?? 0) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

/**
 * Calculate total P&L across all targets
 */
export function calculateTotalPnl(targetScores: TargetScore[]): number {
  return targetScores.reduce(
    (sum, target) => sum + (target.totalPnlDollars ?? 0),
    0
  );
}

/**
 * Calculate complete user career score
 */
export function calculateUserCareerScore(
  input: UserCareerScoringInput
): UserCareerScore {
  const predictionQualityScore = calculateCareerPredictionScore(input.targetScores);
  const performanceScore = calculateCareerPerformanceScore(input.targetScores);

  const predictionGrade = predictionQualityScore !== null
    ? scoreToGrade(predictionQualityScore)
    : 'C' as LetterGrade;

  const performanceGrade = performanceScore !== null
    ? scoreToGrade(performanceScore)
    : 'C' as LetterGrade;

  const totalPnlDollars = calculateTotalPnl(input.targetScores);

  return {
    userId: input.userId,
    predictionQualityScore: predictionQualityScore ?? 0,
    predictionGrade,
    performanceScore: performanceScore ?? 0,
    performanceGrade,
    totalAimsScored: input.totalAimsScored,
    totalShotsScored: input.totalShotsScored,
    totalPnlDollars,
    calculatedAt: new Date(),
  };
}

/**
 * Get career level description based on experience
 */
export function getCareerLevel(
  totalAimsScored: number,
  totalShotsScored: number
): { level: string; description: string } {
  const totalActivity = totalAimsScored + totalShotsScored;

  if (totalActivity >= 500) {
    return { level: 'Elite', description: 'Seasoned market veteran' };
  }
  if (totalActivity >= 200) {
    return { level: 'Expert', description: 'Experienced trader' };
  }
  if (totalActivity >= 100) {
    return { level: 'Advanced', description: 'Skilled investor' };
  }
  if (totalActivity >= 50) {
    return { level: 'Intermediate', description: 'Growing experience' };
  }
  if (totalActivity >= 20) {
    return { level: 'Beginner', description: 'Learning the ropes' };
  }
  return { level: 'Novice', description: 'Just getting started' };
}

/**
 * Calculate score trend over time
 * Returns direction and magnitude of recent performance change
 */
export function calculateScoreTrend(
  recentTargetScores: TargetScore[], // Last 5-10 targets
  olderTargetScores: TargetScore[]   // Previous 5-10 targets
): {
  predictionTrend: 'up' | 'down' | 'stable';
  performanceTrend: 'up' | 'down' | 'stable';
  predictionDelta: number;
  performanceDelta: number;
} {
  const recentPrediction = calculateCareerPredictionScore(recentTargetScores);
  const olderPrediction = calculateCareerPredictionScore(olderTargetScores);
  const recentPerformance = calculateCareerPerformanceScore(recentTargetScores);
  const olderPerformance = calculateCareerPerformanceScore(olderTargetScores);

  const predictionDelta = (recentPrediction ?? 0) - (olderPrediction ?? 0);
  const performanceDelta = (recentPerformance ?? 0) - (olderPerformance ?? 0);

  // Threshold for "stable" (within 3 points)
  const threshold = 3;

  const predictionTrend = predictionDelta > threshold
    ? 'up'
    : predictionDelta < -threshold
      ? 'down'
      : 'stable';

  const performanceTrend = performanceDelta > threshold
    ? 'up'
    : performanceDelta < -threshold
      ? 'down'
      : 'stable';

  return {
    predictionTrend,
    performanceTrend,
    predictionDelta,
    performanceDelta,
  };
}
