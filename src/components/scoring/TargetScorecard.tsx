"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LetterGrade } from "@/lib/scoring";
import { ScoreBadge } from "./ScoreBadge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, DollarSign, Clock, BarChart3, Percent } from "lucide-react";

interface TargetScorecardData {
  targetId: string;
  predictionScore: number;
  predictionGrade: LetterGrade;
  performanceScore: number;
  performanceGrade: LetterGrade;
  totalPnlDollars: number;
  totalPnlPercent: number;
  winRatio: number;
  alphaVsMarket: number;
  // Extended metrics (optional for full report)
  targetDurationDays?: number;
  totalCapitalInvested?: number;
  peakCapitalAtOnce?: number;
  maxPossibleReturnPercent?: number;
  predictedReturnPercent?: number;
  actualReturnPercent?: number;
  winningAimsCount?: number;
  totalAimsCount?: number;
  marketReturnPercent?: number;
  avgProfitPerYear?: number;
}

interface TargetScorecardProps {
  data: TargetScorecardData;
  compact?: boolean;
  showFullReport?: boolean;
  className?: string;
}

/**
 * Stat card component for P&L and metrics
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  positive,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg bg-slate-50", className)}>
      <div className={cn(
        "p-2 rounded-lg",
        positive === true ? "bg-green-100 text-green-600" :
        positive === false ? "bg-red-100 text-red-600" :
        "bg-slate-200 text-slate-600"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn(
          "text-lg font-bold",
          positive === true ? "text-green-600" :
          positive === false ? "text-red-600" :
          "text-slate-900"
        )}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground">{subValue}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Target Scorecard - Full Report
 * Shows dual scores (Prediction + Performance) + P&L summary
 */
export function TargetScorecard({ data, compact = false, showFullReport = false, className }: TargetScorecardProps) {
  const isProfitable = data.totalPnlDollars >= 0;
  const beatsMarket = data.alphaVsMarket >= 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Prediction:</span>
          <ScoreBadge grade={data.predictionGrade} score={data.predictionScore} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Execution:</span>
          <ScoreBadge grade={data.performanceGrade} score={data.performanceScore} size="sm" />
        </div>
        <div className={cn(
          "text-sm font-semibold",
          isProfitable ? "text-green-600" : "text-red-600"
        )}>
          {isProfitable ? "+" : ""}{data.totalPnlPercent.toFixed(1)}%
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Target Report</CardTitle>
          {data.targetDurationDays && (
            <span className="text-sm text-muted-foreground">
              Duration: {data.targetDurationDays} days
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dual Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">Prediction Quality</div>
            <div className="flex items-center gap-3">
              <ScoreBadge grade={data.predictionGrade} score={data.predictionScore} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground">How good was the idea</p>
          </div>
          <div className="space-y-2 p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">Execution Performance</div>
            <div className="flex items-center gap-3">
              <ScoreBadge grade={data.performanceGrade} score={data.performanceScore} size="lg" />
            </div>
            <p className="text-xs text-muted-foreground">How well you executed</p>
          </div>
        </div>

        {/* Win Ratio */}
        {data.totalAimsCount !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Win Ratio</span>
              <span className="font-semibold">
                {data.winningAimsCount}/{data.totalAimsCount} ({(data.winRatio * 100).toFixed(0)}%)
              </span>
            </div>
            <Progress value={data.winRatio * 100} className="h-2" />
          </div>
        )}

        {/* Divider */}
        <div className="border-t" />

        {/* Financial Results */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Financial Results</h4>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={DollarSign}
              label="Total P&L"
              value={`${isProfitable ? "+" : ""}$${Math.abs(data.totalPnlDollars).toLocaleString()}`}
              subValue={`${isProfitable ? "+" : ""}${(data.totalPnlPercent * 100).toFixed(1)}%`}
              positive={isProfitable}
            />
            <StatCard
              icon={beatsMarket ? TrendingUp : TrendingDown}
              label="Alpha vs Market"
              value={`${beatsMarket ? "+" : ""}${(data.alphaVsMarket * 100).toFixed(1)}%`}
              subValue={data.marketReturnPercent !== undefined
                ? `Market: ${(data.marketReturnPercent * 100).toFixed(1)}%`
                : undefined}
              positive={beatsMarket}
            />
          </div>
        </div>

        {/* Extended Report */}
        {showFullReport && (
          <>
            {/* Prediction Accuracy */}
            {data.predictedReturnPercent !== undefined && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Prediction vs Reality</h4>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Target}
                    label="Expected Return"
                    value={`${(data.predictedReturnPercent * 100).toFixed(1)}%`}
                  />
                  <StatCard
                    icon={BarChart3}
                    label="Actual Return"
                    value={`${(data.actualReturnPercent ?? 0) * 100 >= 0 ? "+" : ""}${((data.actualReturnPercent ?? 0) * 100).toFixed(1)}%`}
                    positive={(data.actualReturnPercent ?? 0) >= 0}
                  />
                </div>
                {data.maxPossibleReturnPercent !== undefined && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Max possible return: {(data.maxPossibleReturnPercent * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            )}

            {/* Capital Deployed */}
            {data.totalCapitalInvested !== undefined && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Capital Deployed</h4>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={DollarSign}
                    label="Total Invested"
                    value={`$${data.totalCapitalInvested.toLocaleString()}`}
                    subValue="Sum of all shots"
                  />
                  <StatCard
                    icon={Percent}
                    label="Peak Exposure"
                    value={`$${(data.peakCapitalAtOnce ?? 0).toLocaleString()}`}
                    subValue="Max at one time"
                  />
                </div>
              </div>
            )}

            {/* Time-Normalized Returns */}
            {data.avgProfitPerYear !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Annualized Return</h4>
                <div className={cn(
                  "text-2xl font-bold",
                  data.avgProfitPerYear >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {data.avgProfitPerYear >= 0 ? "+" : ""}{(data.avgProfitPerYear * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Weighted average across all shots
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
