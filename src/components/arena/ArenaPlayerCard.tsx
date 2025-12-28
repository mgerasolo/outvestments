"use client";

import { cn } from "@/lib/utils";

interface ArenaPlayerCardProps {
  name: string;
  initials: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank?: string;
  className?: string;
}

export function ArenaPlayerCard({
  name,
  initials,
  level,
  xp,
  xpToNextLevel,
  rank = "Rookie",
  className,
}: ArenaPlayerCardProps) {
  const xpProgress = Math.round((xp / xpToNextLevel) * 100);

  return (
    <div className={cn("jumbotron p-3 sm:p-4 lg:p-5", className)}>
      <div className="text-center mb-2 sm:mb-3 lg:mb-4">
        {/* Avatar */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-2 sm:border-4 border-yellow-500 flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
          <span className="display-font text-2xl sm:text-3xl lg:text-4xl text-white">{initials}</span>
        </div>

        {/* Name */}
        <div className="display-font text-lg sm:text-xl lg:text-2xl led-glow-white">{name}</div>

        {/* Rank Badge */}
        <div className="achievement-badge inline-block px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 rounded-full mt-1 sm:mt-2">
          <span className="display-font text-xs sm:text-sm text-black">{rank}</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs sm:text-sm">LEVEL</span>
          <span className="display-font text-xl sm:text-2xl lg:text-3xl led-glow-yellow">{level}</span>
        </div>

        {/* XP Bar */}
        <div className="h-2 sm:h-3 bg-black rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>

        <div className="text-center text-gray-500 text-[10px] sm:text-xs">
          {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP TO NEXT LEVEL
        </div>
      </div>
    </div>
  );
}
