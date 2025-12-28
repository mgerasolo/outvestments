"use client";

import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  type?: "default" | "gain" | "loss" | "fire";
}

interface ArenaStatPanelProps {
  title: string;
  stats: StatItem[];
  className?: string;
  showRunningLights?: boolean;
}

export function ArenaStatPanel({
  title,
  stats,
  className,
  showRunningLights = false,
}: ArenaStatPanelProps) {
  const getValueClass = (type: StatItem["type"]) => {
    switch (type) {
      case "gain":
        return "led-glow-green";
      case "loss":
        return "led-glow-red";
      case "fire":
        return "fire-glow";
      default:
        return "led-glow-yellow";
    }
  };

  return (
    <div className={cn("led-panel led-dots rounded-xl p-3 sm:p-4 lg:p-5", className)}>
      <div className="display-font text-sm sm:text-base lg:text-lg text-gray-400 mb-2 sm:mb-3 lg:mb-4 border-b border-gray-700/50 pb-2 sm:pb-3">
        {title}
      </div>

      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-400 text-xs sm:text-sm">{stat.label}</span>
            <div className="text-right">
              <span className={cn("display-font text-lg sm:text-xl lg:text-2xl", getValueClass(stat.type))}>
                {stat.value}
              </span>
              {stat.subValue && (
                <div className="text-gray-500 text-[10px] sm:text-xs">{stat.subValue}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showRunningLights && (
        <div className="h-1 running-lights rounded-full mt-3 sm:mt-4" />
      )}
    </div>
  );
}
