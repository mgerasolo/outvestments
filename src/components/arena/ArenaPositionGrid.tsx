"use client";

import { cn } from "@/lib/utils";

interface Position {
  symbol: string;
  quantity: number;
  returnPercent: number;
  returnDollars: number;
}

interface ArenaPositionGridProps {
  positions: Position[];
  className?: string;
}

export function ArenaPositionGrid({
  positions,
  className,
}: ArenaPositionGridProps) {
  const getReturnClass = (value: number) => {
    if (value > 5) return "led-glow-green";
    if (value > 0) return "led-glow-yellow";
    return "led-glow-red";
  };

  const formatDollars = (value: number) => {
    const prefix = value >= 0 ? "+$" : "-$";
    return `${prefix}${Math.abs(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <div className={cn("led-panel led-dots rounded-xl p-3 sm:p-4 lg:p-5", className)}>
      <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
        <div className="display-font text-sm sm:text-base lg:text-lg text-gray-400">
          ACTIVE POSITIONS
        </div>
        <div className="display-font text-sm sm:text-base lg:text-lg led-glow-white">
          {positions.length} SHOTS
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="segment-display rounded-lg p-4 sm:p-5 lg:p-6 text-center">
          <div className="text-gray-500 display-font text-sm sm:text-base lg:text-lg">
            NO ACTIVE POSITIONS
          </div>
          <div className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
            Fire a shot to see it here
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {positions.map((position, index) => (
            <div
              key={index}
              className="segment-display rounded-lg p-2 sm:p-3 lg:p-4 flex items-center justify-between"
            >
              <div>
                <div className="display-font text-base sm:text-lg lg:text-xl text-white">
                  {position.symbol}
                </div>
                <div className="text-gray-500 text-[10px] sm:text-xs">
                  {position.quantity} shares
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "display-font text-lg sm:text-xl lg:text-2xl",
                    getReturnClass(position.returnPercent)
                  )}
                >
                  {formatPercent(position.returnPercent)}
                </div>
                <div
                  className={cn(
                    "text-xs sm:text-sm",
                    position.returnDollars >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {formatDollars(position.returnDollars)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
