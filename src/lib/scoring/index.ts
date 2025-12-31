/**
 * Scoring System - Main exports
 *
 * 4-Level Hierarchy:
 * 1. User — Two career scores (Prediction Quality + Performance)
 * 2. Target — Thesis quality + P&L summary
 * 3. Aim — PRIMARY SCORING UNIT (4 metrics)
 * 4. Shot — Execution quality (4 metrics + risk + adaptability)
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Grade mapping
export {
  scoreToGrade,
  riskScoreToGrade,
  clampScore,
  isPassingGrade,
  gradeToRank,
  compareGrades,
  getGradeTier,
} from './grade-mapper';

// Interpolation utilities
export {
  calculateMagnitudeAccuracy,
  calculateForecastEdge,
  calculateDirectionalAccuracy,
  clampScore as clampScoreInterpolator,
} from './interpolators';

// Risk assessment
export {
  assessRisk,
  determinePlanQuality,
  determineExecutionDiscipline,
  getRiskGradeDescription,
  calculateAdaptabilityBonus,
} from './risk-assessor';
export type { RiskAssessmentInput, RiskAssessmentResult } from './risk-assessor';

// Aim scoring
export {
  calculateDifficulty,
  annualizeReturn,
  calculateThesisValidity,
  calculateAimMetrics,
  calculateAimFinalScore,
  calculateTimeNormalizedProfits as calculateAimTimeNormalizedProfits,
  calculateAimScore,
} from './aim-scorer';

// Shot scoring
export {
  calculatePerformanceScore,
  calculatePerfectShotCapture,
  calculateShotForecastEdge,
  calculateShotMetrics,
  calculateShotBaseScore,
  calculateTimeNormalizedProfits as calculateShotTimeNormalizedProfits,
  calculateCapitalTimeWeight,
  calculateShotScore,
} from './shot-scorer';

// Target scoring
export {
  calculatePredictionScore,
  calculatePerformanceScore as calculateTargetPerformanceScore,
  calculatePnlMetrics,
  calculateTimeMetrics,
  calculatePredictionAccuracy,
  calculateWinLossStats,
  calculateAverageProfits,
  calculateTargetScore,
} from './target-scorer';
export type { TargetScoringInput } from './target-scorer';

// User career scoring
export {
  calculateCareerPredictionScore,
  calculateCareerPerformanceScore,
  calculateTotalPnl,
  calculateUserCareerScore,
  getCareerLevel,
  calculateScoreTrend,
} from './user-scorer';
export type { UserCareerScoringInput } from './user-scorer';
