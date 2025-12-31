/**
 * Scoring System Constants
 *
 * All weights, grade mappings, and configuration values
 */

import type { LetterGrade, RiskGrade, RiskPlanQuality, ExecutionDiscipline } from './types';

// ============================================================================
// Score Scale
// ============================================================================

/**
 * Centered scale: -50 to +50
 * 0 = Market baseline (C grade)
 */
export const SCORE_MIN = -50;
export const SCORE_MAX = 50;
export const SCORE_BASELINE = 0;

// ============================================================================
// Aim Scoring Weights
// ============================================================================

/**
 * Aim metric weights (must sum to 1.0)
 * - Directional Accuracy: 20%
 * - Magnitude Accuracy: 30%
 * - Forecast Edge: 35%
 * - Thesis Validity: 15% (subjective, user-assessed)
 */
export const AIM_WEIGHTS = {
  directionalAccuracy: 0.20,
  magnitudeAccuracy: 0.30,
  forecastEdge: 0.35,
  thesisValidity: 0.15,
} as const;

/**
 * IMPORTANT: Final Aim Score is a weighted AVERAGE, not a sum.
 * It stays on the centered scale (-50 to +50).
 * Difficulty is displayed INDEPENDENTLY alongside the score.
 * Whether to multiply them is TBD based on real-world data.
 */
export const AIM_SCORE_IS_WEIGHTED_AVERAGE = true;

/**
 * Difficulty multiplier settings
 * Formula: 1.0 + (alpha_decimal / 2.0)
 * Example: 50% alpha = 0.5 → 1.0 + (0.5/2) = 1.25×
 */
export const DIFFICULTY_MIN = 1.0;
export const DIFFICULTY_MAX = 5.0;
export const DIFFICULTY_DIVISOR = 2.0;

/**
 * Expected Market Return (EMR) baseline
 * Used for difficulty calculation
 */
export const EMR_BASELINE = 0.10; // 10% CAGR

// ============================================================================
// Shot Scoring Weights
// ============================================================================

/**
 * Shot metric weights (must sum to 1.0)
 * - Performance Score: 45%
 * - Shot Forecast Edge: 35%
 * - Perfect Shot Capture: 20%
 */
export const SHOT_WEIGHTS = {
  performanceScore: 0.45,
  shotForecastEdge: 0.35,
  perfectShotCapture: 0.20,
} as const;

/**
 * Adaptability bonus caps
 */
export const ADAPTABILITY_BONUS_MIN = -5;
export const ADAPTABILITY_BONUS_MAX = 5;
export const ADAPTABILITY_SCORE_DIVISOR = 10;

// ============================================================================
// Risk Assessment
// ============================================================================

/**
 * Risk plan quality base scores
 */
export const RISK_PLAN_BASE_SCORES: Record<RiskPlanQuality, number> = {
  none: -20,
  very_liberal: -5,
  reasonable: 0,
  structured: 15,
};

/**
 * Execution discipline adjustments
 */
export const EXECUTION_DISCIPLINE_ADJUSTMENTS: Record<ExecutionDiscipline, number> = {
  followed_cleanly: 20,
  minor_delay: 0,
  clear_violation: -15,
  severe_neglect: -30,
};

/**
 * Risk score to grade mapping
 */
export const RISK_GRADE_THRESHOLDS: { min: number; grade: RiskGrade }[] = [
  { min: 30, grade: 'A' },
  { min: 15, grade: 'B' },
  { min: -5, grade: 'C' },
  { min: -20, grade: 'D' },
  { min: -50, grade: 'F' },
];

/**
 * Risk grade to multiplier mapping
 */
export const RISK_MULTIPLIERS: Record<RiskGrade, number> = {
  A: 1.10,
  B: 1.05,
  C: 1.00,
  D: 0.85,
  F: 0.70,
};

// ============================================================================
// Letter Grade Mapping (FFF → AAA)
// ============================================================================

/**
 * Score thresholds for letter grades
 * Centered scale: 0 = C (market baseline)
 *
 * AAA (+50), AA+ (+45-49), AA (+40-44), A+ (+35-39), A (+30-34), A- (+25-29)
 * B+ (+20-24), B (+15-19), B- (+10-14)
 * C+ (+5-9), C (-4 to +4), C- (-5 to -9)
 * D (-10 to -19)
 * F (-20 to -29), FF (-30 to -39), FFF (-40 to -50)
 */
export const LETTER_GRADE_THRESHOLDS: { min: number; grade: LetterGrade }[] = [
  { min: 50, grade: 'AAA' },
  { min: 45, grade: 'AA+' },
  { min: 40, grade: 'AA' },
  { min: 35, grade: 'A+' },
  { min: 30, grade: 'A' },
  { min: 25, grade: 'A-' },
  { min: 20, grade: 'B+' },
  { min: 15, grade: 'B' },
  { min: 10, grade: 'B-' },
  { min: 5, grade: 'C+' },
  { min: -4, grade: 'C' },
  { min: -9, grade: 'C-' },
  { min: -19, grade: 'D' },
  { min: -29, grade: 'F' },
  { min: -39, grade: 'FF' },
  { min: -50, grade: 'FFF' },
];

/**
 * Grade colors for UI display
 */
export const GRADE_COLORS: Record<LetterGrade, { bg: string; text: string; border: string }> = {
  'AAA': { bg: 'bg-amber-500', text: 'text-amber-900', border: 'border-amber-400' },
  'AA+': { bg: 'bg-emerald-500', text: 'text-emerald-900', border: 'border-emerald-400' },
  'AA': { bg: 'bg-emerald-400', text: 'text-emerald-900', border: 'border-emerald-300' },
  'A+': { bg: 'bg-green-500', text: 'text-green-900', border: 'border-green-400' },
  'A': { bg: 'bg-green-400', text: 'text-green-900', border: 'border-green-300' },
  'A-': { bg: 'bg-green-300', text: 'text-green-900', border: 'border-green-200' },
  'B+': { bg: 'bg-blue-400', text: 'text-blue-900', border: 'border-blue-300' },
  'B': { bg: 'bg-blue-300', text: 'text-blue-900', border: 'border-blue-200' },
  'B-': { bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-100' },
  'C+': { bg: 'bg-slate-300', text: 'text-slate-900', border: 'border-slate-200' },
  'C': { bg: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-100' },
  'C-': { bg: 'bg-slate-300', text: 'text-slate-900', border: 'border-slate-200' },
  'D': { bg: 'bg-orange-300', text: 'text-orange-900', border: 'border-orange-200' },
  'F': { bg: 'bg-red-300', text: 'text-red-900', border: 'border-red-200' },
  'FF': { bg: 'bg-red-400', text: 'text-red-900', border: 'border-red-300' },
  'FFF': { bg: 'bg-red-500', text: 'text-red-100', border: 'border-red-400' },
};

/**
 * Grade descriptions for tooltips
 */
export const GRADE_DESCRIPTIONS: Record<LetterGrade, string> = {
  'AAA': 'Legendary - Perfect execution',
  'AA+': 'Exceptional - Outstanding performance',
  'AA': 'Outstanding - Excellent results',
  'A+': 'Excellent - Very strong',
  'A': 'Very Good - Solid performance',
  'A-': 'Good - Above average',
  'B+': 'Above Average - Better than baseline',
  'B': 'Solid - Respectable performance',
  'B-': 'Decent - Slight edge over baseline',
  'C+': 'Slightly Above Baseline',
  'C': 'Baseline - Market average',
  'C-': 'Slightly Below Baseline',
  'D': 'Below Average - Underperformed',
  'F': 'Poor - Significant underperformance',
  'FF': 'Very Poor - Major losses',
  'FFF': 'Failing - Catastrophic results',
};

// ============================================================================
// Magnitude Accuracy Interpolation Points
// ============================================================================

/**
 * Case A: Overestimated (Too Aggressive)
 * Accuracy Ratio = Actual Move / Predicted Move
 */
export const MAGNITUDE_OVERESTIMATE_POINTS: { ratio: number; score: number }[] = [
  { ratio: 1.0, score: 50 },   // Perfect
  { ratio: 0.90, score: 40 },
  { ratio: 0.80, score: 30 },
  { ratio: 0.70, score: 20 },
  { ratio: 0.60, score: 10 },
  { ratio: 0.50, score: 0 },
  { ratio: 0.40, score: -10 },
  { ratio: 0.30, score: -20 },
  { ratio: 0.20, score: -35 },
  { ratio: 0.10, score: -50 },
  { ratio: 0.0, score: -50 },
];

/**
 * Case B: Underestimated (Too Conservative - Softer Penalty)
 * Accuracy Ratio = Predicted Move / Actual Move
 */
export const MAGNITUDE_UNDERESTIMATE_POINTS: { ratio: number; score: number }[] = [
  { ratio: 1.0, score: 50 },   // Perfect
  { ratio: 0.90, score: 40 },
  { ratio: 0.80, score: 35 },
  { ratio: 0.70, score: 30 },
  { ratio: 0.60, score: 25 },
  { ratio: 0.50, score: 15 },
  { ratio: 0.40, score: 5 },
  { ratio: 0.30, score: -5 },
  { ratio: 0.20, score: -15 },
  { ratio: 0.10, score: -25 },  // Cap at -25 for conservative
  { ratio: 0.0, score: -25 },
];

// ============================================================================
// Forecast Edge Scoring Points
// ============================================================================

/**
 * Relative Performance Multiple to Score mapping
 * Relative Multiple = Asset Return / Market Return
 */
export const FORECAST_EDGE_POINTS: { multiple: number; score: number }[] = [
  { multiple: 4.0, score: 50 },
  { multiple: 3.0, score: 42 },
  { multiple: 2.0, score: 35 },
  { multiple: 1.5, score: 20 },
  { multiple: 1.2, score: 10 },
  { multiple: 1.0, score: 0 },
  { multiple: 0.8, score: -25 },
  { multiple: 0.6, score: -35 },
  { multiple: 0.4, score: -45 },
  { multiple: 0.2, score: -50 },
  { multiple: 0.0, score: -50 },
];

// ============================================================================
// Directional Accuracy Scoring
// ============================================================================

/**
 * Directional accuracy based on move magnitude
 * volatility-adjusted thresholds
 */
export const DIRECTIONAL_THRESHOLDS = {
  strongMove: 0.10,    // 10% move = strong
  modestMove: 0.03,    // 3% move = modest
  noise: 0.01,         // 1% = noise/flat
};

export const DIRECTIONAL_SCORES = {
  stronglyWrong: -50,
  wrong: -25,
  flat: 0,
  correct: 25,
  stronglyCorrect: 50,
};

// ============================================================================
// Thesis Validity Scoring
// ============================================================================

/**
 * Thesis Validity scoring based on event occurrence and price reaction
 */
export const THESIS_VALIDITY_SCORES: {
  eventOccurred: boolean;
  priceReaction: 'expected' | 'muted' | 'opposite';
  score: number;
}[] = [
  { eventOccurred: true, priceReaction: 'expected', score: 50 },
  { eventOccurred: true, priceReaction: 'muted', score: 25 },
  { eventOccurred: false, priceReaction: 'expected', score: 15 }, // Partial
  { eventOccurred: true, priceReaction: 'opposite', score: -15 },
  { eventOccurred: false, priceReaction: 'muted', score: -25 },
  { eventOccurred: false, priceReaction: 'opposite', score: -50 },
];

// ============================================================================
// Time Normalization
// ============================================================================

export const DAYS_PER_MONTH = 30;
export const DAYS_PER_YEAR = 365;
