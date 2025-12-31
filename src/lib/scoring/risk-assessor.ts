/**
 * Risk Assessor - Evaluates risk mitigation quality
 *
 * Two components:
 * 1. Plan Quality (-20 to +15)
 * 2. Execution Discipline (-30 to +20)
 *
 * Combined into a Risk Score (-50 to +50) and Risk Grade (A-F)
 */

import type { RiskGrade, RiskPlanQuality, ExecutionDiscipline } from './types';
import {
  RISK_PLAN_BASE_SCORES,
  EXECUTION_DISCIPLINE_ADJUSTMENTS,
  RISK_MULTIPLIERS,
  SCORE_MIN,
  SCORE_MAX,
} from './constants';
import { riskScoreToGrade, clampScore } from './grade-mapper';

/**
 * Input for risk assessment
 */
export interface RiskAssessmentInput {
  planQuality: RiskPlanQuality;
  executionDiscipline: ExecutionDiscipline;
}

/**
 * Output from risk assessment
 */
export interface RiskAssessmentResult {
  planBaseScore: number;
  executionAdjustment: number;
  riskScore: number;          // -50 to +50
  riskGrade: RiskGrade;       // A, B, C, D, F
  riskMultiplier: number;     // 0.70 to 1.10
}

/**
 * Calculate risk mitigation score and grade
 */
export function assessRisk(input: RiskAssessmentInput): RiskAssessmentResult {
  const planBaseScore = RISK_PLAN_BASE_SCORES[input.planQuality];
  const executionAdjustment = EXECUTION_DISCIPLINE_ADJUSTMENTS[input.executionDiscipline];

  const riskScore = clampScore(planBaseScore + executionAdjustment);
  const riskGrade = riskScoreToGrade(riskScore);
  const riskMultiplier = RISK_MULTIPLIERS[riskGrade];

  return {
    planBaseScore,
    executionAdjustment,
    riskScore,
    riskGrade,
    riskMultiplier,
  };
}

/**
 * Determine plan quality from user input
 *
 * Based on:
 * - Stop loss defined?
 * - Risk percentage defined?
 * - Exit conditions documented?
 */
export function determinePlanQuality(options: {
  hasStopLoss: boolean;
  hasRiskPercentage: boolean;
  hasExitConditions: boolean;
  stopLossReasonable: boolean;  // e.g., within 20% of entry
}): RiskPlanQuality {
  const { hasStopLoss, hasRiskPercentage, hasExitConditions, stopLossReasonable } = options;

  // Structured: All components present and reasonable
  if (hasStopLoss && hasRiskPercentage && hasExitConditions && stopLossReasonable) {
    return 'structured';
  }

  // Reasonable: Has stop loss and at least one other component
  if (hasStopLoss && (hasRiskPercentage || hasExitConditions)) {
    return 'reasonable';
  }

  // Very Liberal: Has something but not well structured
  if (hasStopLoss || hasExitConditions) {
    return 'very_liberal';
  }

  // None: No risk management defined
  return 'none';
}

/**
 * Determine execution discipline from trade behavior
 */
export function determineExecutionDiscipline(options: {
  stopLossTriggered: boolean;
  stopLossRespected: boolean;
  exitedEarlyWithReason: boolean;
  heldThroughMajorDrawdown: boolean;  // e.g., -30% without action
  addedToLosingPosition: boolean;
}): ExecutionDiscipline {
  const {
    stopLossTriggered,
    stopLossRespected,
    exitedEarlyWithReason,
    heldThroughMajorDrawdown,
    addedToLosingPosition,
  } = options;

  // Severe neglect: Ignored stop loss or added to losing position
  if ((stopLossTriggered && !stopLossRespected) || addedToLosingPosition) {
    return 'severe_neglect';
  }

  // Clear violation: Major drawdown without action
  if (heldThroughMajorDrawdown) {
    return 'clear_violation';
  }

  // Followed cleanly: Respected all rules or exited with reason
  if ((stopLossTriggered && stopLossRespected) || exitedEarlyWithReason) {
    return 'followed_cleanly';
  }

  // Minor delay: Default (no major issues but not exemplary)
  return 'minor_delay';
}

/**
 * Get descriptive text for a risk grade
 */
export function getRiskGradeDescription(grade: RiskGrade): string {
  const descriptions: Record<RiskGrade, string> = {
    A: 'Excellent risk management',
    B: 'Good risk awareness',
    C: 'Average discipline',
    D: 'Below average control',
    F: 'Poor risk management',
  };
  return descriptions[grade];
}

/**
 * Calculate adaptability bonus for Pro users
 *
 * @param adaptabilityScore - Raw adaptability score (-50 to +50)
 * @param isPro - Whether user has Pro subscription
 * @returns Bonus value (-5 to +5)
 */
export function calculateAdaptabilityBonus(
  adaptabilityScore: number,
  isPro: boolean
): { bonus: number; locked: boolean } {
  if (!isPro) {
    return { bonus: 0, locked: true };
  }

  // Divide by 10 and clamp to -5 to +5
  const bonus = Math.max(-5, Math.min(5, adaptabilityScore / 10));
  return { bonus, locked: false };
}
