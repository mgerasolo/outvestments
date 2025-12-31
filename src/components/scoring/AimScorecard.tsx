"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AIM_WEIGHTS, type LetterGrade } from "@/lib/scoring";
import { ScoreBadge, DifficultyBadge } from "./ScoreBadge";
import { MetricBar, MetricGrid } from "./MetricBar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

interface AimScorecardData {
  aimId: string;
  metrics: {
    directionalAccuracy: number;
    magnitudeAccuracy: number;
    forecastEdge: number;
    thesisValidity: number;
  };
  difficultyMultiplier: number;
  finalScore: number;
  letterGrade: LetterGrade;
  risksDocumented: boolean;
  thesisValidityCapped: boolean;
  selfRating?: number;
  selfReflectionNotes?: string;
  profitPerDay?: number;
  profitPerMonth?: number;
  profitPerYear?: number;
}

interface AimScorecardProps {
  data: AimScorecardData;
  compact?: boolean;
  className?: string;
}

/**
 * Aim Scorecard - PRIMARY SCORING UNIT
 * Shows 4 metrics + difficulty (displayed independently)
 */
export function AimScorecard({ data, compact = false, className }: AimScorecardProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <ScoreBadge grade={data.letterGrade} score={data.finalScore} size="lg" />
        <DifficultyBadge multiplier={data.difficultyMultiplier} size="sm" />
      </div>
    );
  }

  const metrics = [
    {
      label: "Directional Accuracy",
      score: data.metrics.directionalAccuracy,
      weight: AIM_WEIGHTS.directionalAccuracy,
      description: "Did the asset move in the predicted direction?",
    },
    {
      label: "Magnitude Accuracy",
      score: data.metrics.magnitudeAccuracy,
      weight: AIM_WEIGHTS.magnitudeAccuracy,
      description: "How close was the predicted move to reality?",
    },
    {
      label: "Forecast Edge",
      score: data.metrics.forecastEdge,
      weight: AIM_WEIGHTS.forecastEdge,
      description: "Performance relative to market benchmark",
    },
    {
      label: "Thesis Validity",
      score: data.metrics.thesisValidity,
      weight: AIM_WEIGHTS.thesisValidity,
      description: "Did the move occur for the stated reasons?",
    },
  ];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Aim Score</CardTitle>
          <div className="flex items-center gap-2">
            <ScoreBadge grade={data.letterGrade} score={data.finalScore} size="lg" />
            <DifficultyBadge multiplier={data.difficultyMultiplier} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <MetricGrid metrics={metrics} />

        {/* Divider */}
        <div className="border-t pt-4" />

        {/* Risk Documentation Status */}
        <div className="flex items-center gap-2">
          {data.risksDocumented ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Risks documented</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">No risks documented</span>
              {data.thesisValidityCapped && (
                <Badge variant="outline" className="text-xs">
                  Thesis Validity capped at 0
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Time-normalized returns */}
        {data.profitPerYear !== undefined && (
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Annualized Return</div>
            <div className={cn(
              "text-xl font-bold",
              (data.profitPerYear ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {((data.profitPerYear ?? 0) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((data.profitPerDay ?? 0) * 100).toFixed(3)}%/day • {((data.profitPerMonth ?? 0) * 100).toFixed(2)}%/month
            </div>
          </div>
        )}

        {/* Self Reflection */}
        {data.selfRating && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Self Rating:</span>
              <span className="font-semibold">{data.selfRating}/5</span>
            </div>
            {data.selfReflectionNotes && (
              <p className="text-sm text-slate-600 italic">"{data.selfReflectionNotes}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
