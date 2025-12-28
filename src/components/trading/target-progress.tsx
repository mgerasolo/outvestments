"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TargetProgressProps {
  stats: {
    totalAims: number;
    totalShots: number;
    pendingShots: number;
    activeShots: number;
    closedShots: number;
    winningShots: number;
    losingShots: number;
    totalPL: number;
    totalInvested: number;
  };
}

export function TargetProgress({ stats }: TargetProgressProps) {
  const winRate =
    stats.closedShots > 0
      ? (stats.winningShots / stats.closedShots) * 100
      : 0;

  const returnRate =
    stats.totalInvested > 0
      ? (stats.totalPL / stats.totalInvested) * 100
      : 0;

  const progressPercentage =
    stats.totalShots > 0
      ? ((stats.closedShots + stats.activeShots) / stats.totalShots) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
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
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Performance
        </CardTitle>
        <CardDescription>
          Track your progress on this target
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* P&L Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p
              className={`text-2xl font-bold ${
                stats.totalPL >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {stats.totalPL >= 0 ? "+" : ""}$
              {Math.abs(stats.totalPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {stats.totalInvested > 0 && (
              <p
                className={`text-xs ${
                  returnRate >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {returnRate >= 0 ? "+" : ""}
                {returnRate.toFixed(1)}% return
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold">
              {winRate.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.winningShots}W / {stats.losingShots}L
            </p>
          </div>
        </div>

        {/* Execution Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Execution Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.closedShots + stats.activeShots} executed</span>
            <span>{stats.totalShots} total shots</span>
          </div>
        </div>

        {/* Shot Status Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-lg font-semibold">{stats.pendingShots}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg bg-yellow-500/10 p-2">
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.activeShots}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-lg bg-gain/10 p-2">
            <p className="text-lg font-semibold text-gain">{stats.winningShots}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="rounded-lg bg-loss/10 p-2">
            <p className="text-lg font-semibold text-loss">{stats.losingShots}</p>
            <p className="text-xs text-muted-foreground">Losses</p>
          </div>
        </div>

        {/* Aims Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="text-sm text-muted-foreground">
              {stats.totalAims} aim{stats.totalAims !== 1 ? "s" : ""} tracked
            </span>
          </div>
          <span className="text-sm font-medium">
            {stats.totalShots} shot{stats.totalShots !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
