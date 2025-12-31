/**
 * Grade Mapper - Score to Letter Grade conversion
 *
 * Centered scale: -50 to +50
 * 0 = C (market baseline)
 */

import type { LetterGrade, RiskGrade } from './types';
import {
  LETTER_GRADE_THRESHOLDS,
  RISK_GRADE_THRESHOLDS,
  SCORE_MIN,
  SCORE_MAX,
} from './constants';

/**
 * Convert a numeric score (-50 to +50) to a letter grade
 */
export function scoreToGrade(score: number): LetterGrade {
  // Clamp score to valid range
  const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));

  // Find the first threshold where score >= min
  for (const { min, grade } of LETTER_GRADE_THRESHOLDS) {
    if (clampedScore >= min) {
      return grade;
    }
  }

  // Default to worst grade if somehow not matched
  return 'FFF';
}

/**
 * Convert a risk score (-50 to +50) to a risk grade (A-F)
 */
export function riskScoreToGrade(score: number): RiskGrade {
  const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));

  for (const { min, grade } of RISK_GRADE_THRESHOLDS) {
    if (clampedScore >= min) {
      return grade;
    }
  }

  return 'F';
}

/**
 * Clamp a value to the score range
 */
export function clampScore(value: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, value));
}

/**
 * Check if a grade is passing (C or better)
 */
export function isPassingGrade(grade: LetterGrade): boolean {
  const passingGrades: LetterGrade[] = [
    'AAA', 'AA+', 'AA', 'A+', 'A', 'A-',
    'B+', 'B', 'B-',
    'C+', 'C',
  ];
  return passingGrades.includes(grade);
}

/**
 * Get the numeric rank of a grade (higher = better)
 * Used for sorting and comparisons
 */
export function gradeToRank(grade: LetterGrade): number {
  const ranks: Record<LetterGrade, number> = {
    'AAA': 16,
    'AA+': 15,
    'AA': 14,
    'A+': 13,
    'A': 12,
    'A-': 11,
    'B+': 10,
    'B': 9,
    'B-': 8,
    'C+': 7,
    'C': 6,
    'C-': 5,
    'D': 4,
    'F': 3,
    'FF': 2,
    'FFF': 1,
  };
  return ranks[grade];
}

/**
 * Compare two grades
 * Returns: positive if a > b, negative if a < b, 0 if equal
 */
export function compareGrades(a: LetterGrade, b: LetterGrade): number {
  return gradeToRank(a) - gradeToRank(b);
}

/**
 * Get the grade tier (AAA/AA/A/B/C/D/F)
 */
export function getGradeTier(grade: LetterGrade): string {
  if (grade === 'AAA') return 'AAA';
  if (grade.startsWith('AA')) return 'AA';
  if (grade.startsWith('A')) return 'A';
  if (grade.startsWith('B')) return 'B';
  if (grade.startsWith('C')) return 'C';
  if (grade === 'D') return 'D';
  return 'F';
}
