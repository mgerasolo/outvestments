/**
 * Scoring System Types
 *
 * 4-Level Hierarchy:
 * 1. User — Two career scores (Prediction Quality + Performance)
 * 2. Target — Thesis quality + P&L summary
 * 3. Aim — PRIMARY SCORING UNIT (5 metrics)
 * 4. Shot — Execution quality (5 metrics)
 */

// ============================================================================
// Grade Types
// ============================================================================

/**
 * Letter grades from FFF (worst) to AAA (best)
 * Centered scale where C = 0 (market baseline)
 */
export type LetterGrade =
  | 'AAA' | 'AA+' | 'AA' | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D'
  | 'F' | 'FF' | 'FFF';

/**
 * Risk grades for shot risk mitigation scoring
 */
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Risk plan quality levels
 */
export type RiskPlanQuality = 'none' | 'very_liberal' | 'reasonable' | 'structured';

/**
 * Execution discipline levels
 */
export type ExecutionDiscipline = 'followed_cleanly' | 'minor_delay' | 'clear_violation' | 'severe_neglect';

// ============================================================================
// Aim Scoring Types (PRIMARY SCORING UNIT)
// ============================================================================

/**
 * Input data required to calculate an Aim score
 */
export interface AimScoringInput {
  // Aim data
  aimId: string;
  symbol: string;

  // Price data
  entryPrice: number;           // Price when aim was created
  targetPrice: number;          // Predicted target price
  actualPrice: number;          // Price at close

  // Time data
  startDate: Date;              // When aim was created
  targetDate: Date;             // Predicted target date
  closeDate: Date;              // When aim was closed

  // Market baseline
  marketReturnPercent: number;  // SPY return over same period

  // Thesis data
  catalystType?: string;        // Primary catalyst enum
  catalystOccurred?: boolean;   // Did the event occur?
  priceReactionAligned?: boolean; // Did price react as expected?

  // User discipline (optional but affects scoring)
  risksDocumented: boolean;     // Were risks documented at creation?

  // Self reflection (optional)
  selfRating?: 1 | 2 | 3 | 4 | 5;
  selfReflectionNotes?: string;
}

/**
 * Individual Aim metric scores (-50 to +50)
 */
export interface AimMetricScores {
  directionalAccuracy: number;  // -50 to +50
  magnitudeAccuracy: number;    // -50 to +50
  forecastEdge: number;         // -50 to +50
  thesisValidity: number;       // -50 to +50 (capped at 0 if no risks)
}

/**
 * Complete Aim score output
 */
export interface AimScore {
  aimId: string;

  // Individual metrics (-50 to +50)
  metrics: AimMetricScores;

  // Difficulty multiplier (1.0 to 5.0) - displayed independently
  difficultyMultiplier: number;

  // Computed scores
  // NOTE: finalScore is the weighted AVERAGE, staying on -50 to +50 scale
  // Difficulty is shown independently, NOT multiplied into finalScore
  // Whether to combine them is TBD based on real-world data
  finalScore: number;           // Weighted average of metrics (-50 to +50)
  letterGrade: LetterGrade;

  // Time-normalized returns
  predictedProfitPerDay: number;
  predictedProfitPerMonth: number;
  predictedProfitPerYear: number;
  actualProfitPerDay: number;
  actualProfitPerMonth: number;
  actualProfitPerYear: number;

  // Metadata
  risksDocumented: boolean;
  thesisValidityCapped: boolean;
  selfRating?: 1 | 2 | 3 | 4 | 5;
  selfReflectionNotes?: string;

  calculatedAt: Date;
}

// ============================================================================
// Shot Scoring Types
// ============================================================================

/**
 * Input data required to calculate a Shot score
 */
export interface ShotScoringInput {
  shotId: string;
  aimId: string;

  // Position data
  entryPrice: number;
  entryDate: Date;
  exitPrice: number;
  exitDate: Date;
  positionSize: number;         // Dollar amount

  // Aim context
  targetPrice: number;          // From aim
  targetDate: Date;             // From aim

  // Market baseline
  marketReturnPercent: number;  // Market return over shot duration

  // Peak tracking (for PSC)
  peakPrice: number;            // Highest price during hold period

  // Risk management
  riskPlanQuality: RiskPlanQuality;
  executionDiscipline: ExecutionDiscipline;

  // Adaptability (Pro tier)
  adaptabilityScore?: number;   // -50 to +50
  isPro: boolean;
}

/**
 * Individual Shot metric scores
 */
export interface ShotMetricScores {
  performanceScore: number;     // -50 to +50
  shotForecastEdge: number;     // -50 to +50
  perfectShotCapture: number;   // -50 to +50
  riskMitigationScore: number;  // -50 to +50
}

/**
 * Complete Shot score output
 */
export interface ShotScore {
  shotId: string;
  aimId: string;

  // Individual metrics
  metrics: ShotMetricScores;

  // Risk assessment
  riskGrade: RiskGrade;
  riskMultiplier: number;       // 0.70 to 1.10

  // Adaptability
  adaptabilityScore: number;
  adaptabilityBonus: number;    // -5 to +5
  adaptabilityLocked: boolean;  // True for free tier

  // Computed scores
  baseScore: number;            // Weighted average of metrics
  finalScore: number;           // (baseScore * riskMultiplier) + adaptabilityBonus
  letterGrade: LetterGrade;

  // Time-normalized returns
  profitPerDay: number;
  profitPerMonth: number;
  profitPerYear: number;

  // Capital tracking
  capitalTimeWeight: number;    // For aggregation

  calculatedAt: Date;
}

// ============================================================================
// Target Scoring Types
// ============================================================================

/**
 * Complete Target score (aggregated from Aims and Shots)
 */
export interface TargetScore {
  targetId: string;
  userId: string;

  // Dual scores (aggregated)
  predictionScore: number;      // From Aim scores (thinking quality)
  predictionGrade: LetterGrade;
  performanceScore: number;     // From Shot scores (execution quality)
  performanceGrade: LetterGrade;

  // Financial results
  totalPnlDollars: number;
  totalPnlPercent: number;
  maxPossibleReturnPercent: number;

  // Capital metrics
  totalCapitalInvested: number;
  peakCapitalAtOnce: number;
  capitalEfficiency: number;    // Return / Peak capital

  // Time & completion
  targetDurationDays: number;
  heldUntilEnd: boolean;
  avgHoldingPeriodDays: number;

  // Prediction accuracy
  predictedReturnPercent: number;
  actualReturnPercent: number;
  predictionAccuracyRatio: number;

  // Win/Loss stats
  winningAimsCount: number;
  totalAimsCount: number;
  winRatio: number;

  // Market comparison
  marketReturnPercent: number;
  alphaVsMarket: number;

  // Time-normalized returns
  avgProfitPerDay: number;
  avgProfitPerMonth: number;
  avgProfitPerYear: number;

  calculatedAt: Date;
}

// ============================================================================
// User Career Scoring Types
// ============================================================================

/**
 * User career scores (aggregated from all Targets)
 */
export interface UserCareerScore {
  userId: string;

  // Two distinct scores
  predictionQualityScore: number;
  predictionGrade: LetterGrade;
  performanceScore: number;
  performanceGrade: LetterGrade;

  // Aggregate stats
  totalAimsScored: number;
  totalShotsScored: number;
  totalPnlDollars: number;

  calculatedAt: Date;
}

// ============================================================================
// Scorecard Display Types
// ============================================================================

/**
 * Compact scorecard view (grades only)
 */
export interface CompactScorecard {
  grade: LetterGrade;
  score: number;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Detail scorecard view (full breakdown)
 */
export interface DetailScorecard {
  metrics: {
    name: string;
    score: number;
    grade: LetterGrade;
    description: string;
    weight: number;
  }[];
  finalScore: number;
  finalGrade: LetterGrade;
  multipliers?: {
    name: string;
    value: number;
    description: string;
  }[];
  bonuses?: {
    name: string;
    value: number;
    locked: boolean;
  }[];
}
