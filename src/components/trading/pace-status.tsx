"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  calculatePaceInfo,
  getPaceStatusDisplay,
  formatPace,
  calculateTrajectory,
  type PaceStatus as PaceStatusType,
} from "@/lib/pace-tracking";
import type { Aim } from "@/lib/db/schema";

interface PaceStatusProps {
  aim: Aim;
  currentPrice?: number;
  entryPrice?: number;
  entryDate?: Date;
  compact?: boolean;
}

export function PaceStatus({
  aim,
  currentPrice,
  entryPrice,
  entryDate,
  compact = false,
}: PaceStatusProps) {
  const paceInfo = useMemo(
    () => calculatePaceInfo(aim, currentPrice, entryPrice, entryDate),
    [aim, currentPrice, entryPrice, entryDate]
  );

  const trajectory = useMemo(() => {
    if (!entryPrice || !currentPrice || !entryDate) return null;
    const daysSinceEntry = Math.floor(
      (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceEntry <= 0) return null;
    return calculateTrajectory(
      entryPrice,
      currentPrice,
      daysSinceEntry,
      paceInfo.daysRemaining
    );
  }, [entryPrice, currentPrice, entryDate, paceInfo.daysRemaining]);

  const statusDisplay = getPaceStatusDisplay(paceInfo.paceStatus);

  const statusColorClasses: Record<PaceStatusType, string> = {
    ahead: "text-gain bg-gain/10 border-gain/20",
    on_pace: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
    behind: "text-loss bg-loss/10 border-loss/20",
    unknown: "text-muted-foreground bg-muted border-border",
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("text-xs", statusColorClasses[paceInfo.paceStatus])}
        >
          {statusDisplay.icon} {statusDisplay.label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {paceInfo.daysRemaining}d left
        </span>
        {paceInfo.requiredMonthlyReturn > 0 && (
          <span className="text-xs font-mono">
            {formatPace(paceInfo.requiredMonthlyReturn)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Pace Tracking
            </CardTitle>
            <CardDescription>Progress toward target price</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("text-sm", statusColorClasses[paceInfo.paceStatus])}
          >
            {statusDisplay.icon} {statusDisplay.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time Progress</span>
            <span className="font-medium">
              {paceInfo.daysRemaining} days remaining
            </span>
          </div>
          <Progress
            value={100 - (paceInfo.daysRemaining / (paceInfo.daysRemaining + 30)) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {paceInfo.monthsRemaining.toFixed(1)} months to target date
          </p>
        </div>

        {/* Price Progress */}
        {currentPrice && paceInfo.percentToTarget !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price Progress</span>
              <span className="font-medium">
                {paceInfo.percentToTarget.toFixed(1)}% to target
              </span>
            </div>
            <Progress
              value={Math.min(100, paceInfo.percentToTarget)}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Current: ${currentPrice.toFixed(2)}
              </span>
              <span>Target: ${parseFloat(aim.targetPriceRealistic ?? "0").toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Required vs Current Pace */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Required Pace</p>
            <p className="text-lg font-bold font-mono">
              {formatPace(paceInfo.requiredMonthlyReturn)}
            </p>
            <p className="text-xs text-muted-foreground">
              {(paceInfo.requiredAnnualizedReturn ?? 0).toFixed(0)}% annually
            </p>
          </div>
          {paceInfo.currentMonthlyPace !== undefined && (
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Current Pace</p>
              <p
                className={cn(
                  "text-lg font-bold font-mono",
                  paceInfo.currentMonthlyPace >= 0 ? "text-gain" : "text-loss"
                )}
              >
                {formatPace(paceInfo.currentMonthlyPace)}
              </p>
              <p
                className={cn(
                  "text-xs",
                  (paceInfo.currentReturn ?? 0) >= 0
                    ? "text-gain"
                    : "text-loss"
                )}
              >
                {((paceInfo.currentReturn ?? 0) >= 0 ? "+" : "")}
                {(paceInfo.currentReturn ?? 0).toFixed(2)}% so far
              </p>
            </div>
          )}
        </div>

        {/* Trajectory Projection */}
        {trajectory && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">At current pace:</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Projected Price</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  trajectory.projectedPrice >=
                    parseFloat(aim.targetPriceRealistic ?? "0")
                    ? "text-gain"
                    : "text-loss"
                )}
              >
                ${trajectory.projectedPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projected Return</span>
              <span
                className={cn(
                  "font-medium",
                  trajectory.projectedReturn >= 0 ? "text-gain" : "text-loss"
                )}
              >
                {trajectory.projectedReturn >= 0 ? "+" : ""}
                {trajectory.projectedReturn.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Inline compact version for lists
export function PaceStatusBadge({
  aim,
  currentPrice,
}: {
  aim: Aim;
  currentPrice?: number;
}) {
  const paceInfo = useMemo(
    () => calculatePaceInfo(aim, currentPrice),
    [aim, currentPrice]
  );

  const statusDisplay = getPaceStatusDisplay(paceInfo.paceStatus);

  const colorMap: Record<PaceStatusType, string> = {
    ahead: "bg-gain/15 text-gain border-gain/30",
    on_pace: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    behind: "bg-loss/15 text-loss border-loss/30",
    unknown: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        colorMap[paceInfo.paceStatus]
      )}
    >
      <span>{statusDisplay.icon}</span>
      <span>{paceInfo.daysRemaining}d</span>
      {paceInfo.requiredMonthlyReturn > 0 && (
        <span className="font-mono">
          {paceInfo.requiredMonthlyReturn.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
