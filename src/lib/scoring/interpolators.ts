/**
 * Interpolators - Linear interpolation for smooth scoring curves
 *
 * Used for:
 * - Magnitude Accuracy (overestimate vs underestimate curves)
 * - Forecast Edge (relative multiple to score)
 * - Any metric that uses anchor points
 */

import {
  MAGNITUDE_OVERESTIMATE_POINTS,
  MAGNITUDE_UNDERESTIMATE_POINTS,
  FORECAST_EDGE_POINTS,
  SCORE_MIN,
  SCORE_MAX,
} from './constants';

/**
 * Interpolation point type
 */
interface InterpolationPoint {
  ratio?: number;
  multiple?: number;
  score: number;
}

/**
 * Linear interpolation between two points
 */
function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

/**
 * Interpolate a score from a set of points
 * Points should be sorted in descending order by x-value
 */
function interpolate(
  value: number,
  points: InterpolationPoint[],
  key: 'ratio' | 'multiple' = 'ratio'
): number {
  // Handle edge cases
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].score;

  const getValue = (p: InterpolationPoint) => key === 'ratio' ? p.ratio! : p.multiple!;

  // If value is above the highest point, use the highest score
  if (value >= getValue(points[0])) {
    return points[0].score;
  }

  // If value is below the lowest point, use the lowest score
  if (value <= getValue(points[points.length - 1])) {
    return points[points.length - 1].score;
  }

  // Find the two points to interpolate between
  for (let i = 0; i < points.length - 1; i++) {
    const x0 = getValue(points[i]);
    const x1 = getValue(points[i + 1]);

    if (value <= x0 && value >= x1) {
      return lerp(value, x1, x0, points[i + 1].score, points[i].score);
    }
  }

  // Default fallback
  return 0;
}

/**
 * Calculate Magnitude Accuracy score
 *
 * @param predictedMove - Predicted percentage move (e.g., 0.40 for 40%)
 * @param actualMove - Actual percentage move
 * @returns Score from -50 to +50
 */
export function calculateMagnitudeAccuracy(
  predictedMove: number,
  actualMove: number
): number {
  // Handle edge cases
  if (predictedMove === 0 && actualMove === 0) return 50; // Both correct (no move predicted, no move happened)
  if (predictedMove === 0) return -25; // Predicted no move but it moved
  if (actualMove === 0) return -10; // Predicted move but it didn't move

  // Determine if overestimate or underestimate
  const absolutePredicted = Math.abs(predictedMove);
  const absoluteActual = Math.abs(actualMove);

  // Check direction consistency
  const sameDirection = (predictedMove > 0) === (actualMove > 0);

  if (!sameDirection) {
    // Wrong direction - use the worse case (overestimate penalties)
    const ratio = 0; // Effectively 0% accuracy
    return interpolate(ratio, MAGNITUDE_OVERESTIMATE_POINTS, 'ratio');
  }

  if (absolutePredicted > absoluteActual) {
    // Overestimated (too aggressive) - harsher penalty
    const ratio = absoluteActual / absolutePredicted;
    return interpolate(ratio, MAGNITUDE_OVERESTIMATE_POINTS, 'ratio');
  } else {
    // Underestimated (too conservative) - softer penalty
    const ratio = absolutePredicted / absoluteActual;
    return interpolate(ratio, MAGNITUDE_UNDERESTIMATE_POINTS, 'ratio');
  }
}

/**
 * Calculate Forecast Edge score
 *
 * @param assetReturn - Asset return percentage (e.g., 0.25 for 25%)
 * @param marketReturn - Market return percentage over same period
 * @returns Score from -50 to +50
 */
export function calculateForecastEdge(
  assetReturn: number,
  marketReturn: number
): number {
  // Handle edge cases
  if (marketReturn === 0) {
    // Market flat - use absolute return bands
    if (assetReturn >= 0.20) return 50;
    if (assetReturn >= 0.10) return 35;
    if (assetReturn >= 0.05) return 20;
    if (assetReturn >= 0) return 10;
    if (assetReturn >= -0.05) return -10;
    if (assetReturn >= -0.10) return -25;
    return -50;
  }

  // Handle negative market returns
  if (marketReturn < 0) {
    if (assetReturn >= 0) {
      // You made money when market lost - excellent
      const lossAvoidance = Math.abs(assetReturn - marketReturn) / Math.abs(marketReturn);
      return Math.min(50, 30 + lossAvoidance * 20);
    } else {
      // Both lost - how much less did you lose?
      const relativePerformance = assetReturn / marketReturn;
      if (relativePerformance < 1) {
        // Lost less than market (good)
        return interpolate(1 / relativePerformance, FORECAST_EDGE_POINTS, 'multiple');
      } else {
        // Lost more than market (bad)
        return interpolate(1 / relativePerformance, FORECAST_EDGE_POINTS, 'multiple');
      }
    }
  }

  // Normal case: positive market return
  const relativeMultiple = assetReturn / marketReturn;
  return interpolate(relativeMultiple, FORECAST_EDGE_POINTS, 'multiple');
}

/**
 * Calculate Directional Accuracy score
 *
 * @param predictedDirection - 1 for up, -1 for down
 * @param actualMovePercent - Actual percentage move (signed)
 * @param strongMoveThreshold - Threshold for "strong" move (default 10%)
 * @param modestMoveThreshold - Threshold for "modest" move (default 3%)
 * @returns Score from -50 to +50
 */
export function calculateDirectionalAccuracy(
  predictedDirection: 1 | -1,
  actualMovePercent: number,
  strongMoveThreshold: number = 0.10,
  modestMoveThreshold: number = 0.03
): number {
  const absoluteMove = Math.abs(actualMovePercent);
  const actualDirection = actualMovePercent >= 0 ? 1 : -1;
  const isCorrect = predictedDirection === actualDirection;

  // Flat / inconclusive
  if (absoluteMove < 0.01) {
    return 0;
  }

  // Strong move
  if (absoluteMove >= strongMoveThreshold) {
    return isCorrect ? 50 : -50;
  }

  // Modest move
  if (absoluteMove >= modestMoveThreshold) {
    return isCorrect ? 25 : -25;
  }

  // Weak move (between 1% and 3%)
  // Interpolate between flat (0) and modest (±25)
  const t = (absoluteMove - 0.01) / (modestMoveThreshold - 0.01);
  return isCorrect ? t * 25 : -t * 25;
}

/**
 * Clamp a score to the valid range
 */
export function clampScore(score: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
}
