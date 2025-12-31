/**
 * Pace & Trajectory Tracking
 *
 * Calculates the required pace to reach an aim's target price
 * and determines if the current trajectory is on track.
 */

import type { Aim } from "@/lib/db/schema";

/**
 * Simple pace calculation: required monthly % gain to hit target price by target date
 * Formula: ((targetPrice - currentPrice) / currentPrice) / monthsRemaining * 100
 *
 * @param currentPrice - Current market price
 * @param targetPrice - Target price to reach
 * @param targetDate - Date by which target should be reached
 * @returns Required monthly percentage gain (0 if target date is past)
 */
export function calculatePaceRequired(
  currentPrice: number,
  targetPrice: number,
  targetDate: Date
): number {
  const now = new Date();
  const monthsRemaining = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsRemaining <= 0 || currentPrice <= 0) {
    return 0;
  }

  return ((targetPrice - currentPrice) / currentPrice / monthsRemaining) * 100;
}

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

// ============================================================================
// Trajectory Status System
// ============================================================================

/**
 * Trajectory status indicates whether an aim is on track to hit its target
 * based on where the price should be at this point in time.
 *
 * - ahead: Current price >= expected price (on or ahead of schedule)
 * - on_track: Current price is within 5% behind expected price
 * - drifting: Current price is 5-15% behind expected price
 * - off_course: Current price is >15% behind expected price
 * - unknown: Cannot calculate (missing data or invalid dates)
 */
export type TrajectoryStatus = "ahead" | "on_track" | "drifting" | "off_course" | "unknown";

// Thresholds for trajectory status
const TRAJECTORY_DRIFTING_THRESHOLD = -0.05; // 5% behind = drifting
const TRAJECTORY_OFF_COURSE_THRESHOLD = -0.15; // 15% behind = off course

export interface TrajectoryInfo {
  status: TrajectoryStatus;
  expectedPrice: number;
  currentPrice: number;
  deviation: number; // Percentage deviation from expected (positive = ahead, negative = behind)
  deviationPercent: number; // Same as deviation but as percentage (e.g., -10 for 10% behind)
  progressPercent: number; // How far through the time period (0-100%)
  priceProgressPercent: number; // How far toward target price (0-100%+)
}

/**
 * Calculate trajectory status for an aim
 *
 * Compares current price position against where it "should" be based on
 * linear progression from entry to target over time.
 *
 * @param entryPrice - Price when position was entered
 * @param targetPrice - Target price for the aim
 * @param currentPrice - Current market price
 * @param entryDate - Date position was entered
 * @param targetDate - Target date for the aim
 * @returns TrajectoryStatus indicating whether aim is on track
 */
export function calculateTrajectoryStatus(
  entryPrice: number,
  targetPrice: number,
  currentPrice: number,
  entryDate: Date,
  targetDate: Date
): TrajectoryStatus {
  const info = calculateTrajectoryInfo(entryPrice, targetPrice, currentPrice, entryDate, targetDate);
  return info.status;
}

/**
 * Calculate detailed trajectory information for an aim
 *
 * Provides both the status and the underlying metrics used to determine it.
 */
export function calculateTrajectoryInfo(
  entryPrice: number,
  targetPrice: number,
  currentPrice: number,
  entryDate: Date,
  targetDate: Date
): TrajectoryInfo {
  const now = new Date();

  // Handle invalid inputs
  if (entryPrice <= 0 || targetPrice <= 0 || currentPrice <= 0) {
    return {
      status: "unknown",
      expectedPrice: 0,
      currentPrice,
      deviation: 0,
      deviationPercent: 0,
      progressPercent: 0,
      priceProgressPercent: 0,
    };
  }

  const entryTime = entryDate.getTime();
  const targetTime = targetDate.getTime();
  const nowTime = now.getTime();

  const totalDuration = targetTime - entryTime;
  const elapsedDuration = nowTime - entryTime;

  // Handle edge cases
  if (totalDuration <= 0) {
    return {
      status: "unknown",
      expectedPrice: targetPrice,
      currentPrice,
      deviation: 0,
      deviationPercent: 0,
      progressPercent: 100,
      priceProgressPercent: 100,
    };
  }

  if (elapsedDuration < 0) {
    // Entry date is in the future - this shouldn't happen normally
    return {
      status: "unknown",
      expectedPrice: entryPrice,
      currentPrice,
      deviation: 0,
      deviationPercent: 0,
      progressPercent: 0,
      priceProgressPercent: 0,
    };
  }

  // Calculate time progress (capped at 100%)
  const timeProgress = Math.min(elapsedDuration / totalDuration, 1);
  const progressPercent = timeProgress * 100;

  // Calculate expected price based on linear progression
  const priceDelta = targetPrice - entryPrice;
  const expectedPrice = entryPrice + priceDelta * timeProgress;

  // Calculate price progress toward target
  const currentPriceDelta = currentPrice - entryPrice;
  const priceProgressPercent = priceDelta !== 0
    ? (currentPriceDelta / priceDelta) * 100
    : 100;

  // Calculate deviation from expected position
  // This represents where we are vs where we should be
  const deviation = priceDelta !== 0
    ? (currentPrice - expectedPrice) / Math.abs(priceDelta)
    : 0;
  const deviationPercent = deviation * 100;

  // Determine status based on deviation
  let status: TrajectoryStatus;
  if (deviation >= 0) {
    status = "ahead";
  } else if (deviation >= TRAJECTORY_DRIFTING_THRESHOLD) {
    status = "on_track";
  } else if (deviation >= TRAJECTORY_OFF_COURSE_THRESHOLD) {
    status = "drifting";
  } else {
    status = "off_course";
  }

  return {
    status,
    expectedPrice,
    currentPrice,
    deviation,
    deviationPercent,
    progressPercent,
    priceProgressPercent,
  };
}

/**
 * Get display information for trajectory status
 */
export function getTrajectoryStatusDisplay(status: TrajectoryStatus): {
  label: string;
  shortLabel: string;
  color: "green" | "yellow" | "red" | "gray";
  icon: string;
  description: string;
} {
  switch (status) {
    case "ahead":
      return {
        label: "Ahead of Schedule",
        shortLabel: "Ahead",
        color: "green",
        icon: "trending_up",
        description: "Price is ahead of where it needs to be to hit target",
      };
    case "on_track":
      return {
        label: "On Track",
        shortLabel: "On Track",
        color: "green",
        icon: "check_circle",
        description: "Price is within expected range to hit target",
      };
    case "drifting":
      return {
        label: "Drifting",
        shortLabel: "Drifting",
        color: "yellow",
        icon: "warning",
        description: "Price is 5-15% behind expected pace - monitor closely",
      };
    case "off_course":
      return {
        label: "Off Course",
        shortLabel: "Off Course",
        color: "red",
        icon: "error",
        description: "Price is >15% behind expected pace - reassess thesis",
      };
    default:
      return {
        label: "Unknown",
        shortLabel: "Unknown",
        color: "gray",
        icon: "help",
        description: "Unable to calculate trajectory status",
      };
  }
}
