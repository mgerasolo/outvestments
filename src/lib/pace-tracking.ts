/**
 * Pace & Trajectory Tracking
 *
 * Calculates the required pace to reach an aim's target price
 * and determines if the current trajectory is on track.
 */

import type { Aim } from "@/lib/db/schema";

// Pace status thresholds
const AHEAD_THRESHOLD = 1.1; // 10% ahead of required pace
const BEHIND_THRESHOLD = 0.9; // 10% behind required pace

export type PaceStatus = "ahead" | "on_pace" | "behind" | "unknown";

export interface PaceInfo {
  // Required pace metrics
  requiredMonthlyReturn: number; // % per month needed to hit target
  requiredAnnualizedReturn: number; // Annualized equivalent
  daysRemaining: number;
  monthsRemaining: number;

  // Current performance (if we have price data)
  currentPrice?: number;
  entryPrice?: number;
  currentReturn?: number; // % return so far
  currentMonthlyPace?: number; // Current realized monthly rate

  // Trajectory status
  paceStatus: PaceStatus;
  paceRatio?: number; // currentPace / requiredPace (1.0 = on pace)
  percentToTarget?: number; // How far toward target (0-100%)
}

/**
 * Calculate the required monthly return to reach target price by target date
 */
export function calculateRequiredPace(
  currentPrice: number,
  targetPrice: number,
  daysRemaining: number
): { monthlyReturn: number; annualizedReturn: number } {
  if (daysRemaining <= 0 || currentPrice <= 0) {
    return { monthlyReturn: 0, annualizedReturn: 0 };
  }

  // Total return needed
  const totalReturn = (targetPrice - currentPrice) / currentPrice;

  // Convert to monthly rate
  // Using compound formula: (1 + totalReturn) = (1 + monthlyRate)^months
  const monthsRemaining = daysRemaining / 30;

  if (monthsRemaining <= 0) {
    return { monthlyReturn: totalReturn * 100, annualizedReturn: totalReturn * 100 * 12 };
  }

  // Monthly rate = (1 + totalReturn)^(1/months) - 1
  const monthlyRate = Math.pow(1 + totalReturn, 1 / monthsRemaining) - 1;

  // Annualized = (1 + monthlyRate)^12 - 1
  const annualizedRate = Math.pow(1 + monthlyRate, 12) - 1;

  return {
    monthlyReturn: monthlyRate * 100,
    annualizedReturn: annualizedRate * 100,
  };
}

/**
 * Calculate current pace based on actual performance
 */
export function calculateCurrentPace(
  entryPrice: number,
  currentPrice: number,
  daysSinceEntry: number
): { currentReturn: number; monthlyPace: number } {
  if (daysSinceEntry <= 0 || entryPrice <= 0) {
    return { currentReturn: 0, monthlyPace: 0 };
  }

  const currentReturn = (currentPrice - entryPrice) / entryPrice;
  const monthsElapsed = daysSinceEntry / 30;

  // If less than a full month, extrapolate
  const monthlyPace = monthsElapsed >= 1
    ? (Math.pow(1 + currentReturn, 1 / monthsElapsed) - 1) * 100
    : currentReturn * (30 / daysSinceEntry) * 100;

  return {
    currentReturn: currentReturn * 100,
    monthlyPace,
  };
}

/**
 * Determine pace status based on current vs required pace
 */
export function getPaceStatus(
  currentMonthlyPace: number,
  requiredMonthlyPace: number
): PaceStatus {
  if (requiredMonthlyPace === 0) {
    return "unknown";
  }

  const ratio = currentMonthlyPace / requiredMonthlyPace;

  if (ratio >= AHEAD_THRESHOLD) {
    return "ahead";
  } else if (ratio <= BEHIND_THRESHOLD) {
    return "behind";
  }
  return "on_pace";
}

/**
 * Calculate complete pace info for an aim
 */
export function calculatePaceInfo(
  aim: Aim,
  currentPrice?: number,
  entryPrice?: number,
  entryDate?: Date
): PaceInfo {
  const now = new Date();
  const targetDate = new Date(aim.targetDate);
  const daysRemaining = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = daysRemaining / 30;

  const targetPrice = parseFloat(aim.targetPriceRealistic);

  // Calculate required pace
  let requiredMonthlyReturn = 0;
  let requiredAnnualizedReturn = 0;

  if (currentPrice && currentPrice > 0) {
    const required = calculateRequiredPace(currentPrice, targetPrice, daysRemaining);
    requiredMonthlyReturn = required.monthlyReturn;
    requiredAnnualizedReturn = required.annualizedReturn;
  }

  // Build base info
  const info: PaceInfo = {
    requiredMonthlyReturn,
    requiredAnnualizedReturn,
    daysRemaining,
    monthsRemaining,
    paceStatus: "unknown",
    currentPrice,
    entryPrice,
  };

  // If we have entry data, calculate current pace
  if (entryPrice && currentPrice && entryDate) {
    const daysSinceEntry = Math.max(1, Math.floor((now.getTime() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24)));
    const currentPace = calculateCurrentPace(entryPrice, currentPrice, daysSinceEntry);

    info.currentReturn = currentPace.currentReturn;
    info.currentMonthlyPace = currentPace.monthlyPace;

    // Calculate pace ratio and status
    if (requiredMonthlyReturn !== 0) {
      info.paceRatio = currentPace.monthlyPace / requiredMonthlyReturn;
      info.paceStatus = getPaceStatus(currentPace.monthlyPace, requiredMonthlyReturn);
    }

    // Calculate percent to target
    const totalNeeded = targetPrice - entryPrice;
    const currentProgress = currentPrice - entryPrice;
    if (totalNeeded !== 0) {
      info.percentToTarget = Math.max(0, Math.min(100, (currentProgress / totalNeeded) * 100));
    }
  }

  return info;
}

/**
 * Get pace status display info for UI
 */
export function getPaceStatusDisplay(paceStatus: PaceStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (paceStatus) {
    case "ahead":
      return { label: "Ahead of Pace", color: "green", icon: "↑" };
    case "on_pace":
      return { label: "On Pace", color: "blue", icon: "→" };
    case "behind":
      return { label: "Behind Pace", color: "red", icon: "↓" };
    default:
      return { label: "Unknown", color: "gray", icon: "?" };
  }
}

/**
 * Format pace for display
 */
export function formatPace(monthlyReturn: number): string {
  const sign = monthlyReturn >= 0 ? "+" : "";
  return `${sign}${monthlyReturn.toFixed(2)}%/mo`;
}

/**
 * Calculate trajectory - where will we be if current pace continues?
 */
export function calculateTrajectory(
  entryPrice: number,
  currentPrice: number,
  daysSinceEntry: number,
  daysRemaining: number
): { projectedPrice: number; projectedReturn: number } {
  if (daysSinceEntry <= 0 || entryPrice <= 0) {
    return { projectedPrice: currentPrice, projectedReturn: 0 };
  }

  // Calculate daily rate from current performance
  const currentReturn = (currentPrice - entryPrice) / entryPrice;
  const dailyRate = Math.pow(1 + currentReturn, 1 / daysSinceEntry) - 1;

  // Project forward
  const totalDays = daysSinceEntry + daysRemaining;
  const projectedTotalReturn = Math.pow(1 + dailyRate, totalDays) - 1;
  const projectedPrice = entryPrice * (1 + projectedTotalReturn);

  return {
    projectedPrice,
    projectedReturn: projectedTotalReturn * 100,
  };
}
