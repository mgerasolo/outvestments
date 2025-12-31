"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LetterGrade, getCareerLevel } from "@/lib/scoring";
import { ScoreBadge } from "./ScoreBadge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, TrendingUp, TrendingDown, DollarSign, Award } from "lucide-react";

interface UserScorecardData {
  userId: string;
  predictionQualityScore: number;
  predictionGrade: LetterGrade;
  performanceScore: number;
  performanceGrade: LetterGrade;
  totalAimsScored: number;
  totalShotsScored: number;
  totalPnlDollars: number;
  // Optional trend data
  predictionTrend?: "up" | "down" | "stable";
  performanceTrend?: "up" | "down" | "stable";
}

interface UserScorecardProps {
  data: UserScorecardData;
  compact?: boolean;
  className?: string;
}

/**
 * Career level badge
 */
function CareerLevelBadge({ level, description }: { level: string; description: string }) {
  const colors: Record<string, string> = {
    Elite: "bg-purple-500 text-purple-100",
    Expert: "bg-amber-500 text-amber-100",
    Advanced: "bg-blue-500 text-blue-100",
    Intermediate: "bg-green-500 text-green-100",
    Beginner: "bg-slate-400 text-slate-100",
    Novice: "bg-slate-300 text-slate-700",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold",
      colors[level] || "bg-slate-300 text-slate-700"
    )}>
      <Trophy className="h-4 w-4" />
      <span>{level}</span>
    </div>
  );
}

/**
 * Trend indicator
 */
function TrendIndicator({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  }
  if (trend === "down") {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  return <span className="text-slate-400">—</span>;
}

/**
 * User Career Scorecard
 * Shows two career scores + aggregate stats
 */
export function UserScorecard({ data, compact = false, className }: UserScorecardProps) {
  const careerLevel = getCareerLevel(data.totalAimsScored, data.totalShotsScored);
  const isProfitable = data.totalPnlDollars >= 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <CareerLevelBadge level={careerLevel.level} description={careerLevel.description} />
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <ScoreBadge grade={data.predictionGrade} size="sm" showScore={false} />
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <ScoreBadge grade={data.performanceGrade} size="sm" showScore={false} />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Career Stats</CardTitle>
          <CareerLevelBadge level={careerLevel.level} description={careerLevel.description} />
        </div>
        <p className="text-sm text-muted-foreground">{careerLevel.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dual Career Scores */}
        <div className="grid grid-cols-2 gap-4">
          {/* Prediction Quality */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Prediction</span>
              </div>
              {data.predictionTrend && (
                <TrendIndicator trend={data.predictionTrend} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge
                grade={data.predictionGrade}
                score={data.predictionQualityScore}
                size="lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Quality of your investment ideas
            </p>
          </div>

          {/* Execution Performance */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Execution</span>
              </div>
              {data.performanceTrend && (
                <TrendIndicator trend={data.performanceTrend} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <ScoreBadge
                grade={data.performanceGrade}
                score={data.performanceScore}
                size="lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              How well you execute your trades
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Aggregate Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Aims</span>
            </div>
            <div className="text-2xl font-bold">{data.totalAimsScored}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Shots</span>
            </div>
            <div className="text-2xl font-bold">{data.totalShotsScored}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total P&L</span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              isProfitable ? "text-green-600" : "text-red-600"
            )}>
              {isProfitable ? "+" : ""}${Math.abs(data.totalPnlDollars).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Experience Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Experience</span>
            <span className="font-medium">
              {data.totalAimsScored + data.totalShotsScored} total trades
            </span>
          </div>
          <Progress
            value={Math.min(100, ((data.totalAimsScored + data.totalShotsScored) / 500) * 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {500 - (data.totalAimsScored + data.totalShotsScored) > 0
              ? `${500 - (data.totalAimsScored + data.totalShotsScored)} trades to Elite status`
              : "Elite trader status achieved!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
