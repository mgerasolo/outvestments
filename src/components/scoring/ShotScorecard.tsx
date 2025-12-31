"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SHOT_WEIGHTS, RISK_MULTIPLIERS, type LetterGrade, type RiskGrade } from "@/lib/scoring";
import { ScoreBadge } from "./ScoreBadge";
import { MetricBar, MetricGrid } from "./MetricBar";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield } from "lucide-react";

interface ShotScorecardData {
  shotId: string;
  metrics: {
    performanceScore: number;
    shotForecastEdge: number;
    perfectShotCapture: number;
    riskMitigationScore: number;
  };
  riskGrade: RiskGrade;
  riskMultiplier: number;
  adaptabilityLocked: boolean;
  finalScore: number;
  letterGrade: LetterGrade;
  profitPerDay?: number;
  profitPerMonth?: number;
  profitPerYear?: number;
}

interface ShotScorecardProps {
  data: ShotScorecardData;
  compact?: boolean;
  className?: string;
}

/**
 * Risk grade badge with multiplier display
 */
function RiskGradeBadge({ grade, multiplier }: { grade: RiskGrade; multiplier: number }) {
  const colors: Record<RiskGrade, string> = {
    A: "bg-emerald-500 text-emerald-100",
    B: "bg-green-500 text-green-100",
    C: "bg-slate-400 text-slate-100",
    D: "bg-orange-500 text-orange-100",
    F: "bg-red-500 text-red-100",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold",
      colors[grade]
    )}>
      <Shield className="h-3 w-3" />
      <span>{grade}</span>
      <span className="text-xs opacity-80">({multiplier.toFixed(2)}×)</span>
    </div>
  );
}

/**
 * Shot Scorecard - Execution quality
 * Shows 4 metrics + risk grade + adaptability
 */
export function ShotScorecard({ data, compact = false, className }: ShotScorecardProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <ScoreBadge grade={data.letterGrade} score={data.finalScore} size="lg" />
        <RiskGradeBadge grade={data.riskGrade} multiplier={data.riskMultiplier} />
      </div>
    );
  }

  const metrics = [
    {
      label: "Performance",
      score: data.metrics.performanceScore,
      weight: SHOT_WEIGHTS.performanceScore,
      description: "Time-weighted P&L vs opportunity cost",
    },
    {
      label: "Forecast Edge",
      score: data.metrics.shotForecastEdge,
      weight: SHOT_WEIGHTS.shotForecastEdge,
      description: "Outperformance vs market during hold",
    },
    {
      label: "Perfect Shot Capture",
      score: data.metrics.perfectShotCapture,
      weight: SHOT_WEIGHTS.perfectShotCapture,
      description: "How efficiently you captured the opportunity",
    },
  ];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Shot Score</CardTitle>
          <ScoreBadge grade={data.letterGrade} score={data.finalScore} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Metrics */}
        <MetricGrid metrics={metrics} />

        {/* Divider */}
        <div className="border-t pt-4" />

        {/* Risk Mitigation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Mitigation</span>
            <RiskGradeBadge grade={data.riskGrade} multiplier={data.riskMultiplier} />
          </div>
          <MetricBar
            label=""
            score={data.metrics.riskMitigationScore}
            showGrade={false}
          />
          <p className="text-xs text-muted-foreground">
            Based on plan quality and execution discipline
          </p>
        </div>

        {/* Adaptability (Pro) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Adaptability</span>
            {data.adaptabilityLocked ? (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>
          {data.adaptabilityLocked ? (
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <Lock className="h-5 w-5 mx-auto text-slate-400 mb-1" />
              <p className="text-sm text-slate-500">
                Upgrade to Pro to unlock AI-powered adaptability scoring
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Measures response to new information during the trade
            </p>
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
      </CardContent>
    </Card>
  );
}
