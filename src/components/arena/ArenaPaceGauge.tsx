"use client";

import { cn } from "@/lib/utils";
import { PaceGauge } from "@/components/charts";
import type { PaceStatus } from "@/lib/pace-tracking";

interface ArenaPaceGaugeProps {
  currentPace: number;
  requiredPace: number;
  status: PaceStatus;
  title?: string;
  className?: string;
}

export function ArenaPaceGauge({
  currentPace,
  requiredPace,
  status,
  title = "PORTFOLIO PACE",
  className,
}: ArenaPaceGaugeProps) {
  const paceRatio = requiredPace > 0 ? (currentPace / requiredPace) * 100 : 100;

  const getStatusLabel = (status: PaceStatus) => {
    switch (status) {
      case "ahead":
        return "AHEAD OF PACE";
      case "behind":
        return "BEHIND PACE";
      case "on_pace":
        return "ON PACE";
      default:
        return "CALCULATING";
    }
  };

  const getStatusColor = (status: PaceStatus) => {
    switch (status) {
      case "ahead":
        return "led-glow-green";
      case "behind":
        return "led-glow-red";
      case "on_pace":
        return "led-glow-blue";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={cn("led-panel led-dots rounded-xl p-3 sm:p-4 lg:p-5", className)}>
      <div className="display-font text-sm sm:text-base lg:text-lg text-gray-400 mb-2 sm:mb-3 border-b border-gray-700/50 pb-2 sm:pb-3">
        {title}
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <PaceGauge
          currentPace={currentPace}
          requiredPace={requiredPace}
          status={status}
          height={140}
          theme="dark"
        />
      </div>

      {/* Status Label */}
      <div className="text-center -mt-2 sm:-mt-4">
        <span
          className={cn(
            "display-font text-sm sm:text-base",
            getStatusColor(status)
          )}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700/50">
        <div className="text-center">
          <div className="text-gray-500 text-[10px] sm:text-xs">CURRENT</div>
          <div className="display-font text-base sm:text-lg text-white">
            {currentPace.toFixed(1)}%/mo
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-[10px] sm:text-xs">REQUIRED</div>
          <div className="display-font text-base sm:text-lg text-gray-400">
            {requiredPace.toFixed(1)}%/mo
          </div>
        </div>
      </div>
    </div>
  );
}
