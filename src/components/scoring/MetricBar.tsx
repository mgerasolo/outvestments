"use client";

import { cn } from "@/lib/utils";
import { scoreToGrade, SCORE_MIN, SCORE_MAX, GRADE_COLORS, type LetterGrade } from "@/lib/scoring";

interface MetricBarProps {
  label: string;
  score: number;
  weight?: number;
  showGrade?: boolean;
  showValue?: boolean;
  description?: string;
  className?: string;
}

/**
 * Horizontal bar visualization for a metric score (-50 to +50)
 * Centered at 0, extends left for negative, right for positive
 */
export function MetricBar({
  label,
  score,
  weight,
  showGrade = true,
  showValue = true,
  description,
  className,
}: MetricBarProps) {
  // Clamp score to valid range
  const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));

  // Calculate bar position (0 = center, -50 = left edge, +50 = right edge)
  const percentage = ((clampedScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;

  // Determine color based on score
  const getBarColor = (s: number): string => {
    if (s >= 35) return "bg-emerald-500";
    if (s >= 20) return "bg-green-500";
    if (s >= 5) return "bg-blue-400";
    if (s >= -5) return "bg-slate-400";
    if (s >= -20) return "bg-orange-400";
    return "bg-red-500";
  };

  const grade = scoreToGrade(clampedScore);
  const gradeColors = GRADE_COLORS[grade];

  return (
    <div className={cn("space-y-1", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {weight !== undefined && (
            <span className="text-xs text-muted-foreground">({(weight * 100).toFixed(0)}%)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showValue && (
            <span className={cn(
              "text-sm font-mono",
              clampedScore >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {clampedScore >= 0 ? "+" : ""}{clampedScore.toFixed(1)}
            </span>
          )}
          {showGrade && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-xs font-semibold",
              gradeColors.bg,
              gradeColors.text
            )}>
              {grade}
            </span>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400 z-10" />

        {/* Fill bar */}
        {clampedScore >= 0 ? (
          // Positive: grow from center to right
          <div
            className={cn("absolute h-full rounded-r-full", getBarColor(clampedScore))}
            style={{
              left: "50%",
              width: `${(clampedScore / SCORE_MAX) * 50}%`,
            }}
          />
        ) : (
          // Negative: grow from center to left
          <div
            className={cn("absolute h-full rounded-l-full", getBarColor(clampedScore))}
            style={{
              right: "50%",
              width: `${(Math.abs(clampedScore) / Math.abs(SCORE_MIN)) * 50}%`,
            }}
          />
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface MetricGridProps {
  metrics: {
    label: string;
    score: number;
    weight?: number;
    description?: string;
  }[];
  className?: string;
}

/**
 * Grid of metric bars for a scorecard
 */
export function MetricGrid({ metrics, className }: MetricGridProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {metrics.map((metric) => (
        <MetricBar
          key={metric.label}
          label={metric.label}
          score={metric.score}
          weight={metric.weight}
          description={metric.description}
        />
      ))}
    </div>
  );
}
