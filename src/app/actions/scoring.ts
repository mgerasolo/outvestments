"use server";

import { db } from "@/lib/db";
import {
  aimScores,
  shotScores,
  targetScores,
  userCareerScores,
  aims,
  shots,
  targets,
} from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  calculateAimScore,
  calculateShotScore,
  calculateTargetScore,
  calculateUserCareerScore,
  determinePlanQuality,
  determineExecutionDiscipline,
  type AimScoringInput,
  type ShotScoringInput,
  type TargetScoringInput,
  type UserCareerScoringInput,
  type AimScore,
  type ShotScore,
} from "@/lib/scoring";

// ============================================================================
// Aim Scoring Actions
// ============================================================================

/**
 * Calculate and store aim score when an aim is closed
 */
export async function calculateAndStoreAimScore(aimId: string) {
  // Fetch aim data
  const aim = await db.query.aims.findFirst({
    where: eq(aims.id, aimId),
    with: {
      target: true,
    },
  });

  if (!aim) {
    throw new Error(`Aim not found: ${aimId}`);
  }

  if (!aim.closedAt) {
    throw new Error(`Aim is not closed: ${aimId}`);
  }

  // Get market return for the aim period
  // TODO: Implement actual market data fetching
  const marketReturnPercent = 0.05; // Placeholder: 5% market return

  // Build scoring input
  const input: AimScoringInput = {
    aimId: aim.id,
    symbol: aim.symbol,
    entryPrice: 0, // Would need to fetch from first shot or price at creation
    targetPrice: parseFloat(aim.targetPriceRealistic ?? "0"),
    actualPrice: 0, // Would need to fetch current/close price
    startDate: aim.createdAt,
    targetDate: aim.targetDate,
    closeDate: aim.closedAt,
    marketReturnPercent,
    risksDocumented: !!(aim.exitConditions || aim.stopLossPrice),
    // Catalyst data would come from user input
    catalystOccurred: undefined,
    priceReactionAligned: undefined,
  };

  // For now, calculate with placeholder prices
  // In production, fetch actual prices
  const priceAtStart = 100; // Placeholder
  const priceAtClose = aim.status === "hit" ? parseFloat(aim.targetPriceRealistic ?? "100") : 95;

  input.entryPrice = priceAtStart;
  input.actualPrice = priceAtClose;

  // Calculate score
  const score = calculateAimScore(input);

  // Store in database
  await db
    .insert(aimScores)
    .values({
      aimId: aim.id,
      directionalAccuracy: score.metrics.directionalAccuracy.toString(),
      magnitudeAccuracy: score.metrics.magnitudeAccuracy.toString(),
      forecastEdge: score.metrics.forecastEdge.toString(),
      thesisValidity: score.metrics.thesisValidity.toString(),
      difficultyMultiplier: score.difficultyMultiplier.toString(),
      finalScore: score.finalScore.toString(),
      letterGrade: score.letterGrade,
      risksDocumented: score.risksDocumented,
      thesisValidityCapped: score.thesisValidityCapped,
      selfRating: score.selfRating,
      selfReflectionNotes: score.selfReflectionNotes,
      predictedProfitPerDay: score.predictedProfitPerDay.toString(),
      predictedProfitPerMonth: score.predictedProfitPerMonth.toString(),
      predictedProfitPerYear: score.predictedProfitPerYear.toString(),
      actualProfitPerDay: score.actualProfitPerDay.toString(),
      actualProfitPerMonth: score.actualProfitPerMonth.toString(),
      actualProfitPerYear: score.actualProfitPerYear.toString(),
    })
    .onConflictDoUpdate({
      target: aimScores.aimId,
      set: {
        directionalAccuracy: score.metrics.directionalAccuracy.toString(),
        magnitudeAccuracy: score.metrics.magnitudeAccuracy.toString(),
        forecastEdge: score.metrics.forecastEdge.toString(),
        thesisValidity: score.metrics.thesisValidity.toString(),
        difficultyMultiplier: score.difficultyMultiplier.toString(),
        finalScore: score.finalScore.toString(),
        letterGrade: score.letterGrade,
        risksDocumented: score.risksDocumented,
        thesisValidityCapped: score.thesisValidityCapped,
        calculatedAt: new Date(),
      },
    });

  // Trigger target recalculation
  if (aim.targetId) {
    await recalculateTargetScore(aim.targetId);
  }

  revalidatePath(`/targets/${aim.targetId}/aims/${aimId}`);
  return score;
}

// ============================================================================
// Shot Scoring Actions
// ============================================================================

/**
 * Calculate and store shot score when a shot is closed
 */
export async function calculateAndStoreShotScore(shotId: string) {
  // Fetch shot data with aim
  const shot = await db.query.shots.findFirst({
    where: eq(shots.id, shotId),
    with: {
      aim: {
        with: {
          target: true,
        },
      },
    },
  });

  if (!shot) {
    throw new Error(`Shot not found: ${shotId}`);
  }

  if (shot.state !== "closed" && shot.state !== "partially_closed") {
    throw new Error(`Shot is not closed: ${shotId}`);
  }

  // Get market return for the shot period
  const marketReturnPercent = 0.03; // Placeholder: 3% market return

  // Determine risk plan quality
  const riskPlanQuality = determinePlanQuality({
    hasStopLoss: !!shot.stopLossPrice,
    hasRiskPercentage: false, // Would need to check
    hasExitConditions: !!shot.aim?.exitConditions,
    stopLossReasonable: true, // Would need to validate
  });

  // Determine execution discipline
  const executionDiscipline = determineExecutionDiscipline({
    stopLossTriggered: false, // Would need to check
    stopLossRespected: true,
    exitedEarlyWithReason: false,
    heldThroughMajorDrawdown: false,
    addedToLosingPosition: false,
  });

  // Calculate duration and peak
  const entryDate = shot.fillTimestamp ?? shot.entryDate;
  const exitDate = shot.exitDate ?? new Date();
  const durationDays = Math.ceil(
    (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Peak price would come from historical data
  const peakPrice = parseFloat(shot.exitPrice ?? shot.entryPrice); // Placeholder

  const input: ShotScoringInput = {
    shotId: shot.id,
    aimId: shot.aimId ?? "",
    entryPrice: parseFloat(shot.fillPrice ?? shot.entryPrice),
    entryDate,
    exitPrice: parseFloat(shot.exitPrice ?? shot.entryPrice),
    exitDate,
    positionSize: parseFloat(shot.positionSize ?? "0"),
    targetPrice: shot.aim ? parseFloat(shot.aim.targetPriceRealistic ?? "0") : 0,
    targetDate: shot.aim?.targetDate ?? new Date(),
    marketReturnPercent,
    peakPrice,
    riskPlanQuality,
    executionDiscipline,
    isPro: false, // Would check user subscription
  };

  // Calculate score
  const score = calculateShotScore(input);

  // Store in database
  await db
    .insert(shotScores)
    .values({
      shotId: shot.id,
      performanceScore: score.metrics.performanceScore.toString(),
      shotForecastEdge: score.metrics.shotForecastEdge.toString(),
      perfectShotCapture: score.metrics.perfectShotCapture.toString(),
      riskMitigationScore: score.metrics.riskMitigationScore.toString(),
      riskGrade: score.riskGrade,
      riskMultiplier: score.riskMultiplier.toString(),
      adaptabilityScore: score.adaptabilityScore.toString(),
      adaptabilityBonus: score.adaptabilityBonus.toString(),
      adaptabilityLocked: score.adaptabilityLocked,
      finalScore: score.finalScore.toString(),
      letterGrade: score.letterGrade,
      capitalTimeWeight: score.capitalTimeWeight.toString(),
      profitPerDay: score.profitPerDay.toString(),
      profitPerMonth: score.profitPerMonth.toString(),
      profitPerYear: score.profitPerYear.toString(),
    })
    .onConflictDoUpdate({
      target: shotScores.shotId,
      set: {
        performanceScore: score.metrics.performanceScore.toString(),
        shotForecastEdge: score.metrics.shotForecastEdge.toString(),
        perfectShotCapture: score.metrics.perfectShotCapture.toString(),
        riskMitigationScore: score.metrics.riskMitigationScore.toString(),
        riskGrade: score.riskGrade,
        riskMultiplier: score.riskMultiplier.toString(),
        finalScore: score.finalScore.toString(),
        letterGrade: score.letterGrade,
        calculatedAt: new Date(),
      },
    });

  // Trigger target recalculation if aim exists
  if (shot.aim?.targetId) {
    await recalculateTargetScore(shot.aim.targetId);
  }

  revalidatePath(`/targets/${shot.aim?.targetId}/aims/${shot.aimId}`);
  return score;
}

// ============================================================================
// Target Scoring Actions
// ============================================================================

/**
 * Recalculate target score from all aims and shots
 */
export async function recalculateTargetScore(targetId: string) {
  // Fetch target with all aims
  const target = await db.query.targets.findFirst({
    where: eq(targets.id, targetId),
    with: {
      aims: {
        where: isNull(aims.deletedAt),
        with: {
          shots: {
            where: isNull(shots.deletedAt),
          },
        },
      },
    },
  });

  if (!target) {
    throw new Error(`Target not found: ${targetId}`);
  }

  // Fetch aim scores
  const aimIds = target.aims.map((a) => a.id);
  const aimScoreRows = aimIds.length > 0
    ? await db.query.aimScores.findMany({
        where: inArray(aimScores.aimId, aimIds),
      })
    : [];

  // Fetch shot scores
  const allShots = target.aims.flatMap((a) => a.shots);
  const shotIds = allShots.map((s) => s.id);
  const shotScoreRows = shotIds.length > 0
    ? await db.query.shotScores.findMany({
        where: inArray(shotScores.shotId, shotIds),
      })
    : [];

  // Convert to scoring types
  const aimScoreInputs: AimScore[] = aimScoreRows.map((row) => ({
    aimId: row.aimId,
    metrics: {
      directionalAccuracy: parseFloat(row.directionalAccuracy),
      magnitudeAccuracy: parseFloat(row.magnitudeAccuracy),
      forecastEdge: parseFloat(row.forecastEdge),
      thesisValidity: parseFloat(row.thesisValidity),
    },
    difficultyMultiplier: parseFloat(row.difficultyMultiplier),
    finalScore: parseFloat(row.finalScore),
    letterGrade: row.letterGrade,
    predictedProfitPerDay: parseFloat(row.predictedProfitPerDay ?? "0"),
    predictedProfitPerMonth: parseFloat(row.predictedProfitPerMonth ?? "0"),
    predictedProfitPerYear: parseFloat(row.predictedProfitPerYear ?? "0"),
    actualProfitPerDay: parseFloat(row.actualProfitPerDay ?? "0"),
    actualProfitPerMonth: parseFloat(row.actualProfitPerMonth ?? "0"),
    actualProfitPerYear: parseFloat(row.actualProfitPerYear ?? "0"),
    risksDocumented: row.risksDocumented,
    thesisValidityCapped: row.thesisValidityCapped,
    selfRating: row.selfRating as 1 | 2 | 3 | 4 | 5 | undefined,
    selfReflectionNotes: row.selfReflectionNotes ?? undefined,
    calculatedAt: row.calculatedAt,
  }));

  const shotScoreInputs: ShotScore[] = shotScoreRows.map((row) => {
    // Find the corresponding shot to get aimId
    const shot = allShots.find((s) => s.id === row.shotId);
    return {
      shotId: row.shotId,
      aimId: shot?.aimId ?? "",
      metrics: {
        performanceScore: parseFloat(row.performanceScore),
        shotForecastEdge: parseFloat(row.shotForecastEdge),
        perfectShotCapture: parseFloat(row.perfectShotCapture),
        riskMitigationScore: parseFloat(row.riskMitigationScore),
      },
      riskGrade: row.riskGrade,
      riskMultiplier: parseFloat(row.riskMultiplier),
      adaptabilityScore: parseFloat(row.adaptabilityScore ?? "0"),
      adaptabilityBonus: parseFloat(row.adaptabilityBonus ?? "0"),
      adaptabilityLocked: row.adaptabilityLocked,
      baseScore: 0, // Not stored, recalculated
      finalScore: parseFloat(row.finalScore),
      letterGrade: row.letterGrade,
      profitPerDay: parseFloat(row.profitPerDay ?? "0"),
      profitPerMonth: parseFloat(row.profitPerMonth ?? "0"),
      profitPerYear: parseFloat(row.profitPerYear ?? "0"),
      capitalTimeWeight: parseFloat(row.capitalTimeWeight ?? "0"),
      calculatedAt: row.calculatedAt,
    };
  });

  // Build shot details
  const shotDetails = allShots
    .filter((s) => s.state === "closed" || s.state === "partially_closed")
    .map((s) => ({
      shotId: s.id,
      entryPrice: parseFloat(s.fillPrice ?? s.entryPrice),
      exitPrice: parseFloat(s.exitPrice ?? s.entryPrice),
      positionSize: parseFloat(s.positionSize ?? "0"),
      daysHeld: s.daysHeld ?? 0,
      peakPrice: parseFloat(s.exitPrice ?? s.entryPrice), // Placeholder
    }));

  // Get first aim date
  const firstAimDate = target.aims.length > 0
    ? target.aims.reduce((earliest, aim) =>
        aim.createdAt < earliest ? aim.createdAt : earliest,
        target.aims[0].createdAt
      )
    : target.createdAt;

  // Market return placeholder
  const marketReturnPercent = 0.05;

  const input: TargetScoringInput = {
    targetId: target.id,
    userId: target.userId,
    aimScores: aimScoreInputs,
    shotScores: shotScoreInputs,
    shotDetails,
    firstAimDate,
    closeDate: new Date(), // Would use target close date
    marketReturnPercent,
  };

  // Calculate score
  const score = calculateTargetScore(input);

  // Store in database
  await db
    .insert(targetScores)
    .values({
      targetId: target.id,
      predictionScore: score.predictionScore.toString(),
      predictionGrade: score.predictionGrade,
      performanceScore: score.performanceScore.toString(),
      performanceGrade: score.performanceGrade,
      totalPnlDollars: score.totalPnlDollars.toString(),
      totalPnlPercent: score.totalPnlPercent.toString(),
      maxPossibleReturnPercent: score.maxPossibleReturnPercent.toString(),
      totalCapitalInvested: score.totalCapitalInvested.toString(),
      peakCapitalAtOnce: score.peakCapitalAtOnce.toString(),
      capitalEfficiency: score.capitalEfficiency.toString(),
      targetDurationDays: score.targetDurationDays,
      heldUntilEnd: score.heldUntilEnd,
      avgHoldingPeriodDays: score.avgHoldingPeriodDays,
      predictedReturnPercent: score.predictedReturnPercent.toString(),
      actualReturnPercent: score.actualReturnPercent.toString(),
      predictionAccuracyRatio: score.predictionAccuracyRatio.toString(),
      winningAimsCount: score.winningAimsCount,
      totalAimsCount: score.totalAimsCount,
      winRatio: score.winRatio.toString(),
      marketReturnPercent: score.marketReturnPercent.toString(),
      alphaVsMarket: score.alphaVsMarket.toString(),
      avgProfitPerDay: score.avgProfitPerDay.toString(),
      avgProfitPerMonth: score.avgProfitPerMonth.toString(),
      avgProfitPerYear: score.avgProfitPerYear.toString(),
    })
    .onConflictDoUpdate({
      target: targetScores.targetId,
      set: {
        predictionScore: score.predictionScore.toString(),
        predictionGrade: score.predictionGrade,
        performanceScore: score.performanceScore.toString(),
        performanceGrade: score.performanceGrade,
        totalPnlDollars: score.totalPnlDollars.toString(),
        totalPnlPercent: score.totalPnlPercent.toString(),
        calculatedAt: new Date(),
      },
    });

  // Trigger user career recalculation
  await recalculateUserCareerScores(target.userId);

  revalidatePath(`/targets/${targetId}`);
  return score;
}

// ============================================================================
// User Career Scoring Actions
// ============================================================================

/**
 * Recalculate user career scores from all targets
 */
export async function recalculateUserCareerScores(userId: string) {
  // Fetch all target scores for user
  const userTargets = await db.query.targets.findMany({
    where: and(eq(targets.userId, userId), isNull(targets.deletedAt)),
  });

  const targetIds = userTargets.map((t) => t.id);
  const targetScoreRows = targetIds.length > 0
    ? await db.query.targetScores.findMany({
        where: inArray(targetScores.targetId, targetIds),
      })
    : [];

  // Count total aims and shots
  const userAims = await db.query.aims.findMany({
    where: and(
      inArray(aims.targetId, targetIds),
      isNull(aims.deletedAt)
    ),
  });
  const aimIds = userAims.map((a) => a.id);

  const userShots = aimIds.length > 0
    ? await db.query.shots.findMany({
        where: and(
          inArray(shots.aimId, aimIds),
          isNull(shots.deletedAt)
        ),
      })
    : [];

  // Convert target scores
  const targetScoreInputs = targetScoreRows.map((row) => ({
    targetId: row.targetId,
    userId,
    predictionScore: parseFloat(row.predictionScore ?? "0"),
    predictionGrade: row.predictionGrade ?? "C" as const,
    performanceScore: parseFloat(row.performanceScore ?? "0"),
    performanceGrade: row.performanceGrade ?? "C" as const,
    totalPnlDollars: parseFloat(row.totalPnlDollars ?? "0"),
    totalPnlPercent: parseFloat(row.totalPnlPercent ?? "0"),
    maxPossibleReturnPercent: parseFloat(row.maxPossibleReturnPercent ?? "0"),
    totalCapitalInvested: parseFloat(row.totalCapitalInvested ?? "0"),
    peakCapitalAtOnce: parseFloat(row.peakCapitalAtOnce ?? "0"),
    capitalEfficiency: parseFloat(row.capitalEfficiency ?? "0"),
    targetDurationDays: row.targetDurationDays ?? 0,
    heldUntilEnd: row.heldUntilEnd ?? false,
    avgHoldingPeriodDays: row.avgHoldingPeriodDays ?? 0,
    predictedReturnPercent: parseFloat(row.predictedReturnPercent ?? "0"),
    actualReturnPercent: parseFloat(row.actualReturnPercent ?? "0"),
    predictionAccuracyRatio: parseFloat(row.predictionAccuracyRatio ?? "0"),
    winningAimsCount: row.winningAimsCount ?? 0,
    totalAimsCount: row.totalAimsCount ?? 0,
    winRatio: parseFloat(row.winRatio ?? "0"),
    marketReturnPercent: parseFloat(row.marketReturnPercent ?? "0"),
    alphaVsMarket: parseFloat(row.alphaVsMarket ?? "0"),
    avgProfitPerDay: parseFloat(row.avgProfitPerDay ?? "0"),
    avgProfitPerMonth: parseFloat(row.avgProfitPerMonth ?? "0"),
    avgProfitPerYear: parseFloat(row.avgProfitPerYear ?? "0"),
    calculatedAt: row.calculatedAt,
  }));

  const input: UserCareerScoringInput = {
    userId,
    targetScores: targetScoreInputs,
    totalAimsScored: userAims.length,
    totalShotsScored: userShots.length,
  };

  // Calculate score
  const score = calculateUserCareerScore(input);

  // Store in database
  await db
    .insert(userCareerScores)
    .values({
      userId,
      predictionQualityScore: score.predictionQualityScore.toString(),
      predictionGrade: score.predictionGrade,
      performanceScore: score.performanceScore.toString(),
      performanceGrade: score.performanceGrade,
      totalAimsScored: score.totalAimsScored,
      totalShotsScored: score.totalShotsScored,
      totalPnlDollars: score.totalPnlDollars.toString(),
    })
    .onConflictDoUpdate({
      target: userCareerScores.userId,
      set: {
        predictionQualityScore: score.predictionQualityScore.toString(),
        predictionGrade: score.predictionGrade,
        performanceScore: score.performanceScore.toString(),
        performanceGrade: score.performanceGrade,
        totalAimsScored: score.totalAimsScored,
        totalShotsScored: score.totalShotsScored,
        totalPnlDollars: score.totalPnlDollars.toString(),
        calculatedAt: new Date(),
      },
    });

  revalidatePath("/dashboard");
  return score;
}

// ============================================================================
// Self-Reflection Actions
// ============================================================================

/**
 * Submit user self-reflection for an aim
 */
export async function submitSelfReflection(
  aimId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  notes?: string
) {
  await db
    .update(aimScores)
    .set({
      selfRating: rating,
      selfReflectionNotes: notes,
    })
    .where(eq(aimScores.aimId, aimId));

  revalidatePath(`/aims/${aimId}`);
}

// ============================================================================
// Scorecard Retrieval Actions
// ============================================================================

/**
 * Get aim scorecard data
 */
export async function getAimScorecard(aimId: string) {
  const scoreRow = await db.query.aimScores.findFirst({
    where: eq(aimScores.aimId, aimId),
  });

  if (!scoreRow) return null;

  return {
    aimId: scoreRow.aimId,
    metrics: {
      directionalAccuracy: parseFloat(scoreRow.directionalAccuracy),
      magnitudeAccuracy: parseFloat(scoreRow.magnitudeAccuracy),
      forecastEdge: parseFloat(scoreRow.forecastEdge),
      thesisValidity: parseFloat(scoreRow.thesisValidity),
    },
    difficultyMultiplier: parseFloat(scoreRow.difficultyMultiplier),
    finalScore: parseFloat(scoreRow.finalScore),
    letterGrade: scoreRow.letterGrade,
    risksDocumented: scoreRow.risksDocumented,
    thesisValidityCapped: scoreRow.thesisValidityCapped,
    selfRating: scoreRow.selfRating,
    selfReflectionNotes: scoreRow.selfReflectionNotes,
    profitPerDay: parseFloat(scoreRow.actualProfitPerDay ?? "0"),
    profitPerMonth: parseFloat(scoreRow.actualProfitPerMonth ?? "0"),
    profitPerYear: parseFloat(scoreRow.actualProfitPerYear ?? "0"),
  };
}

/**
 * Get shot scorecard data
 */
export async function getShotScorecard(shotId: string) {
  const scoreRow = await db.query.shotScores.findFirst({
    where: eq(shotScores.shotId, shotId),
  });

  if (!scoreRow) return null;

  return {
    shotId: scoreRow.shotId,
    metrics: {
      performanceScore: parseFloat(scoreRow.performanceScore),
      shotForecastEdge: parseFloat(scoreRow.shotForecastEdge),
      perfectShotCapture: parseFloat(scoreRow.perfectShotCapture),
      riskMitigationScore: parseFloat(scoreRow.riskMitigationScore),
    },
    riskGrade: scoreRow.riskGrade,
    riskMultiplier: parseFloat(scoreRow.riskMultiplier),
    adaptabilityLocked: scoreRow.adaptabilityLocked,
    finalScore: parseFloat(scoreRow.finalScore),
    letterGrade: scoreRow.letterGrade,
    profitPerDay: parseFloat(scoreRow.profitPerDay ?? "0"),
    profitPerMonth: parseFloat(scoreRow.profitPerMonth ?? "0"),
    profitPerYear: parseFloat(scoreRow.profitPerYear ?? "0"),
  };
}

/**
 * Get target scorecard data
 */
export async function getTargetScorecard(targetId: string) {
  const scoreRow = await db.query.targetScores.findFirst({
    where: eq(targetScores.targetId, targetId),
  });

  if (!scoreRow) return null;

  return {
    targetId: scoreRow.targetId,
    predictionScore: parseFloat(scoreRow.predictionScore ?? "0"),
    predictionGrade: scoreRow.predictionGrade,
    performanceScore: parseFloat(scoreRow.performanceScore ?? "0"),
    performanceGrade: scoreRow.performanceGrade,
    totalPnlDollars: parseFloat(scoreRow.totalPnlDollars ?? "0"),
    totalPnlPercent: parseFloat(scoreRow.totalPnlPercent ?? "0"),
    winRatio: parseFloat(scoreRow.winRatio ?? "0"),
    alphaVsMarket: parseFloat(scoreRow.alphaVsMarket ?? "0"),
  };
}

/**
 * Get user career scorecard data
 */
export async function getUserScorecard(userId: string) {
  const scoreRow = await db.query.userCareerScores.findFirst({
    where: eq(userCareerScores.userId, userId),
  });

  if (!scoreRow) return null;

  return {
    userId: scoreRow.userId,
    predictionQualityScore: parseFloat(scoreRow.predictionQualityScore ?? "0"),
    predictionGrade: scoreRow.predictionGrade,
    performanceScore: parseFloat(scoreRow.performanceScore ?? "0"),
    performanceGrade: scoreRow.performanceGrade,
    totalAimsScored: scoreRow.totalAimsScored ?? 0,
    totalShotsScored: scoreRow.totalShotsScored ?? 0,
    totalPnlDollars: parseFloat(scoreRow.totalPnlDollars ?? "0"),
  };
}
