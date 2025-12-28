"use client";

import { cn } from "@/lib/utils";
import { PortfolioChart } from "@/components/charts";

interface PortfolioDataPoint {
  date: Date | string;
  value: number;
  cashValue?: number;
  positionsValue?: number;
}

interface ArenaPortfolioChartProps {
  data: PortfolioDataPoint[];
  showCashSplit?: boolean;
  className?: string;
}

export function ArenaPortfolioChart({
  data,
  showCashSplit = false,
  className,
}: ArenaPortfolioChartProps) {
  // Calculate performance stats
  const startValue = data[0]?.value || 0;
  const endValue = data[data.length - 1]?.value || 0;
  const changeValue = endValue - startValue;
  const changePercent = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
  const isPositive = changeValue >= 0;

  const formatDollars = (value: number) => {
    const prefix = value >= 0 ? "+$" : "-$";
    return `${prefix}${Math.abs(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(2)}%`;
  };

  return (
    <div className={cn("jumbotron p-3 sm:p-4 lg:p-5", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <div>
          <div className="text-gray-500 text-xs sm:text-sm tracking-wide">
            PORTFOLIO PERFORMANCE
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            Last {data.length} trading days
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <div className="text-gray-500 text-[10px] sm:text-xs">CHANGE</div>
            <div
              className={cn(
                "display-font text-lg sm:text-xl",
                isPositive ? "led-glow-green" : "led-glow-red"
              )}
            >
              {formatDollars(changeValue)}
            </div>
          </div>
          <div className="segment-display px-2 sm:px-3 py-1 rounded-lg">
            <span
              className={cn(
                "display-font text-sm sm:text-base",
                isPositive ? "led-glow-green" : "led-glow-red"
              )}
            >
              {formatPercent(changePercent)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg overflow-hidden bg-slate-900/50">
        <PortfolioChart
          data={data}
          height={200}
          showCashSplit={showCashSplit}
          theme="dark"
        />
      </div>

      {/* Running Lights Divider */}
      <div className="h-1 running-lights rounded-full mt-3 sm:mt-4" />

      {/* Legend */}
      {showCashSplit && (
        <div className="flex justify-center gap-4 sm:gap-6 mt-2 sm:mt-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">Positions</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-stone-400" />
            <span className="text-gray-400">Cash</span>
          </div>
        </div>
      )}
    </div>
  );
}
