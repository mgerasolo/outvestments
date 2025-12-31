"use client";

import { cn } from "@/lib/utils";
import { GRADE_COLORS, GRADE_DESCRIPTIONS, type LetterGrade } from "@/lib/scoring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreBadgeProps {
  grade: LetterGrade;
  score?: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  className?: string;
}

/**
 * Letter grade badge with optional score display
 * Styled like a Madden stats card
 */
export function ScoreBadge({
  grade,
  score,
  size = "md",
  showScore = true,
  className,
}: ScoreBadgeProps) {
  const colors = GRADE_COLORS[grade];
  const description = GRADE_DESCRIPTIONS[grade];

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[32px]",
    md: "text-sm px-2 py-1 min-w-[40px]",
    lg: "text-lg px-3 py-1.5 min-w-[56px] font-bold",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-md font-semibold",
              "border-2 shadow-sm",
              colors.bg,
              colors.text,
              colors.border,
              sizeClasses[size],
              className
            )}
          >
            <span>{grade}</span>
            {showScore && score !== undefined && (
              <span className="ml-1 text-xs opacity-80">
                ({score >= 0 ? "+" : ""}{score.toFixed(0)})
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
          {score !== undefined && (
            <p className="text-xs text-muted-foreground">
              Score: {score.toFixed(1)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DifficultyBadgeProps {
  multiplier: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Difficulty multiplier badge - displayed like a video game level
 */
export function DifficultyBadge({
  multiplier,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  // Determine difficulty level description
  const getDifficultyLevel = (mult: number): { label: string; color: string } => {
    if (mult >= 4.0) return { label: "Legendary", color: "bg-purple-500 text-purple-100" };
    if (mult >= 3.0) return { label: "Epic", color: "bg-orange-500 text-orange-100" };
    if (mult >= 2.0) return { label: "Hard", color: "bg-red-500 text-red-100" };
    if (mult >= 1.5) return { label: "Medium", color: "bg-yellow-500 text-yellow-900" };
    if (mult >= 1.25) return { label: "Normal", color: "bg-green-500 text-green-100" };
    return { label: "Easy", color: "bg-blue-500 text-blue-100" };
  };

  const { label, color } = getDifficultyLevel(multiplier);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5 font-bold",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md font-semibold",
              color,
              sizeClasses[size],
              className
            )}
          >
            <span className="text-lg">⚡</span>
            <span>{multiplier.toFixed(2)}×</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p><strong>{label}</strong> Difficulty</p>
          <p className="text-xs text-muted-foreground">
            Based on predicted return vs market baseline
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
