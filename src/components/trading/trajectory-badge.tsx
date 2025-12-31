"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  calculateTrajectoryInfo,
  getTrajectoryStatusDisplay,
  type TrajectoryStatus,
  type TrajectoryInfo,
} from "@/lib/pace-tracking";
import type { Aim, Shot } from "@/lib/db/schema";

// ============================================================================
// TrajectoryBadge - Compact status indicator
// ============================================================================

interface TrajectoryBadgeProps {
  aim: Aim;
  currentPrice?: number;
  entryPrice?: number;
  entryDate?: Date;
  className?: string;
  showTooltip?: boolean;
  variant?: "default" | "compact" | "detailed";
}

const statusColorClasses: Record<TrajectoryStatus, string> = {
  ahead: "bg-gain/15 text-gain border-gain/30 hover:bg-gain/25",
  on_track: "bg-gain/15 text-gain border-gain/30 hover:bg-gain/25",
  drifting: "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/25 dark:text-amber-400",
  off_course: "bg-loss/15 text-loss border-loss/30 hover:bg-loss/25",
  unknown: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

const statusIcons: Record<TrajectoryStatus, string> = {
  ahead: "\u2197", // Arrow pointing up-right
  on_track: "\u2192", // Arrow pointing right
  drifting: "\u2198", // Arrow pointing down-right
  off_course: "\u2193", // Arrow pointing down
  unknown: "?",
};

export function TrajectoryBadge({
  aim,
  currentPrice,
  entryPrice,
  entryDate,
  className,
  showTooltip = true,
  variant = "default",
}: TrajectoryBadgeProps) {
  const trajectoryInfo = useMemo<TrajectoryInfo | null>(() => {
    if (!currentPrice || !entryPrice || !entryDate) {
      return null;
    }

    const targetPrice = parseFloat(aim.targetPriceRealistic);
    const targetDate = new Date(aim.targetDate);

    return calculateTrajectoryInfo(
      entryPrice,
      targetPrice,
      currentPrice,
      entryDate,
      targetDate
    );
  }, [aim, currentPrice, entryPrice, entryDate]);

  if (!trajectoryInfo) {
    return null;
  }

  const display = getTrajectoryStatusDisplay(trajectoryInfo.status);
  const icon = statusIcons[trajectoryInfo.status];

  const renderBadge = () => {
    if (variant === "compact") {
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            statusColorClasses[trajectoryInfo.status],
            className
          )}
        >
          {icon}
        </Badge>
      );
    }

    if (variant === "detailed") {
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium gap-1.5",
            statusColorClasses[trajectoryInfo.status],
            className
          )}
        >
          <span>{icon}</span>
          <span>{display.label}</span>
          <span className="opacity-70">
            ({trajectoryInfo.deviationPercent >= 0 ? "+" : ""}
            {trajectoryInfo.deviationPercent.toFixed(1)}%)
          </span>
        </Badge>
      );
    }

    // Default variant
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium gap-1",
          statusColorClasses[trajectoryInfo.status],
          className
        )}
      >
        <span>{icon}</span>
        <span>{display.shortLabel}</span>
      </Badge>
    );
  };

  if (!showTooltip) {
    return renderBadge();
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{renderBadge()}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-semibold">{display.label}</p>
            <p className="text-xs text-muted-foreground">{display.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1 border-t">
              <div>
                <span className="text-muted-foreground">Expected:</span>{" "}
                <span className="font-mono">${trajectoryInfo.expectedPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current:</span>{" "}
                <span className="font-mono">${trajectoryInfo.currentPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>{" "}
                <span className="font-mono">{trajectoryInfo.progressPercent.toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>{" "}
                <span className="font-mono">{trajectoryInfo.priceProgressPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// TrajectoryStatusCard - Full card display for aim detail pages
// ============================================================================

interface TrajectoryStatusCardProps {
  aim: Aim;
  currentPrice?: number;
  entryPrice?: number;
  entryDate?: Date;
  className?: string;
}

export function TrajectoryStatusCard({
  aim,
  currentPrice,
  entryPrice,
  entryDate,
  className,
}: TrajectoryStatusCardProps) {
  const trajectoryInfo = useMemo<TrajectoryInfo | null>(() => {
    if (!currentPrice || !entryPrice || !entryDate) {
      return null;
    }

    const targetPrice = parseFloat(aim.targetPriceRealistic);
    const targetDate = new Date(aim.targetDate);

    return calculateTrajectoryInfo(
      entryPrice,
      targetPrice,
      currentPrice,
      entryDate,
      targetDate
    );
  }, [aim, currentPrice, entryPrice, entryDate]);

  if (!trajectoryInfo) {
    return (
      <div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Trajectory status unavailable</p>
          <p className="text-xs mt-1">Enter a position to track progress</p>
        </div>
      </div>
    );
  }

  const display = getTrajectoryStatusDisplay(trajectoryInfo.status);
  const targetPrice = parseFloat(aim.targetPriceRealistic);

  const progressBarColor = {
    ahead: "bg-gain",
    on_track: "bg-gain",
    drifting: "bg-amber-500",
    off_course: "bg-loss",
    unknown: "bg-muted-foreground",
  }[trajectoryInfo.status];

  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">
            Trajectory Status
          </h4>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-lg font-bold",
                display.color === "green" && "text-gain",
                display.color === "yellow" && "text-amber-500 dark:text-amber-400",
                display.color === "red" && "text-loss",
                display.color === "gray" && "text-muted-foreground"
              )}
            >
              {display.label}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "text-3xl font-bold tabular-nums",
            trajectoryInfo.deviationPercent >= 0 ? "text-gain" : "text-loss"
          )}
        >
          {trajectoryInfo.deviationPercent >= 0 ? "+" : ""}
          {trajectoryInfo.deviationPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress visualization */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Time Progress</span>
          <span>{trajectoryInfo.progressPercent.toFixed(0)}% elapsed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-muted-foreground/40 transition-all duration-300"
            style={{ width: `${Math.min(trajectoryInfo.progressPercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-3">
          <span>Price Progress</span>
          <span>{trajectoryInfo.priceProgressPercent.toFixed(0)}% to target</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", progressBarColor)}
            style={{ width: `${Math.min(Math.max(trajectoryInfo.priceProgressPercent, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Price metrics */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Entry</p>
          <p className="font-mono text-sm font-medium">${entryPrice?.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Expected Now</p>
          <p className="font-mono text-sm font-medium">
            ${trajectoryInfo.expectedPrice.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="font-mono text-sm font-medium text-gain">
            ${targetPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status explanation */}
      <p className="text-xs text-muted-foreground border-t pt-3">
        {display.description}
      </p>
    </div>
  );
}

// ============================================================================
// Helper hook for calculating trajectory from shots
// ============================================================================

/**
 * Calculate trajectory info from an aim and its shots
 * Uses the earliest active shot as the entry point
 */
export function useTrajectoryFromShots(
  aim: Aim,
  shots: Shot[],
  currentPrice?: number
): TrajectoryInfo | null {
  return useMemo(() => {
    if (!currentPrice || shots.length === 0) {
      return null;
    }

    // Find the earliest active or closed shot with a fill price
    const relevantShots = shots.filter(
      (s) => s.state !== "pending" && s.state !== "armed" && s.fillPrice
    );

    if (relevantShots.length === 0) {
      return null;
    }

    // Sort by fill timestamp to get the earliest entry
    const sortedShots = [...relevantShots].sort((a, b) => {
      const aTime = a.fillTimestamp ? new Date(a.fillTimestamp).getTime() : 0;
      const bTime = b.fillTimestamp ? new Date(b.fillTimestamp).getTime() : 0;
      return aTime - bTime;
    });

    const firstShot = sortedShots[0];
    const entryPrice = parseFloat(firstShot.fillPrice!);
    const entryDate = firstShot.fillTimestamp
      ? new Date(firstShot.fillTimestamp)
      : new Date(firstShot.entryDate);
    const targetPrice = parseFloat(aim.targetPriceRealistic);
    const targetDate = new Date(aim.targetDate);

    return calculateTrajectoryInfo(
      entryPrice,
      targetPrice,
      currentPrice,
      entryDate,
      targetDate
    );
  }, [aim, shots, currentPrice]);
}
