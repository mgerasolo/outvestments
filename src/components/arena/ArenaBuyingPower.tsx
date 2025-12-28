"use client";

import { cn } from "@/lib/utils";

interface ArenaBuyingPowerProps {
  buyingPower: number;
  deployed: number;
  total: number;
  className?: string;
}

export function ArenaBuyingPower({
  buyingPower,
  deployed,
  total,
  className,
}: ArenaBuyingPowerProps) {
  const formatDollars = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className={cn("jumbotron p-3 sm:p-4 lg:p-5 text-center", className)}>
      <div className="text-gray-500 text-xs sm:text-sm tracking-wide">BUYING POWER</div>
      <div className="display-font text-2xl sm:text-3xl lg:text-4xl led-glow-green mt-1">
        {formatDollars(buyingPower)}
      </div>

      <div className="h-1 running-lights rounded-full my-2 sm:my-3 lg:my-4" />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
        <div>
          <div className="text-gray-500">DEPLOYED</div>
          <div className="display-font text-base sm:text-lg lg:text-xl text-white mt-0.5 sm:mt-1">
            {formatDollars(deployed)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">TOTAL</div>
          <div className="display-font text-base sm:text-lg lg:text-xl led-glow-white mt-0.5 sm:mt-1">
            {formatDollars(total)}
          </div>
        </div>
      </div>
    </div>
  );
}
