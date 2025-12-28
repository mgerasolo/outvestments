"use client";

import { cn } from "@/lib/utils";

interface ArenaJumbotronProps {
  todayPnL: number;
  todayPnLPercent: number;
  yourReturn: number;
  yourReturnDollars: number;
  npcReturn: number;
  npcReturnDollars: number;
  alphaGenerated: number;
  alphaDollars: number;
  className?: string;
}

export function ArenaJumbotron({
  todayPnL,
  todayPnLPercent,
  yourReturn,
  yourReturnDollars,
  npcReturn,
  npcReturnDollars,
  alphaGenerated,
  alphaDollars,
  className,
}: ArenaJumbotronProps) {
  const isPositive = todayPnL >= 0;
  const isWinning = yourReturn > npcReturn;

  const formatDollars = (value: number) => {
    const prefix = value >= 0 ? "+$" : "-$";
    return `${prefix}${Math.abs(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(2)}%`;
  };

  return (
    <div className={cn("jumbotron p-4 sm:p-6 relative overflow-hidden", className)}>
      {/* Corner Decorations */}
      <div className="corner-decoration corner-tl hidden sm:block" />
      <div className="corner-decoration corner-tr hidden sm:block" />
      <div className="corner-decoration corner-bl hidden sm:block" />
      <div className="corner-decoration corner-br hidden sm:block" />

      {/* Today's P&L - Hero Display */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="display-font text-sm sm:text-base text-gray-500 tracking-widest mb-1">
          TODAY&apos;S P&L
        </div>
        <div
          className={cn(
            "display-font text-4xl sm:text-5xl lg:text-6xl score-flash",
            isPositive ? "led-glow-green" : "led-glow-red"
          )}
        >
          {formatDollars(todayPnL)}
        </div>
        <div className="mt-2">
          <span
            className={cn(
              "segment-display inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-lg display-font text-lg sm:text-xl",
              isPositive ? "led-glow-green" : "led-glow-red"
            )}
          >
            {formatPercent(todayPnLPercent)}
          </span>
        </div>
      </div>

      {/* VS Scoreboard */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center mb-4 sm:mb-5">
        {/* HOME (YOU) */}
        <div className="team-panel-home rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
          <div className="text-blue-300 text-[10px] sm:text-xs font-bold tracking-widest mb-0.5">
            HOME
          </div>
          <div className="display-font text-sm sm:text-lg text-white mb-1">YOU</div>
          <div className="segment-display inline-block px-2 sm:px-3 py-1 rounded-lg">
            <span
              className={cn(
                "display-font text-lg sm:text-2xl lg:text-3xl",
                yourReturn >= 0 ? "led-glow-green" : "led-glow-red"
              )}
            >
              {formatPercent(yourReturn)}
            </span>
          </div>
          <div className="text-gray-400 text-xs mt-1 score-font hidden sm:block">
            {formatDollars(yourReturnDollars)}
          </div>
        </div>

        {/* VS Badge */}
        <div className="text-center">
          <div className="vs-badge w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center shadow-xl">
            <span className="display-font text-lg sm:text-xl">VS</span>
          </div>
          <div className="mt-1 sm:mt-2 display-font text-[10px] sm:text-xs text-yellow-400/80">
            {isWinning ? "WINNING" : "TRAILING"}
          </div>
        </div>

        {/* AWAY (NPC) */}
        <div className="team-panel-away rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
          <div className="text-red-300 text-[10px] sm:text-xs font-bold tracking-widest mb-0.5">
            AWAY
          </div>
          <div className="display-font text-sm sm:text-lg text-white mb-1">S&P 500</div>
          <div className="segment-display inline-block px-2 sm:px-3 py-1 rounded-lg">
            <span className="display-font text-lg sm:text-2xl lg:text-3xl text-gray-400">
              {formatPercent(npcReturn)}
            </span>
          </div>
          <div className="text-gray-400 text-xs mt-1 score-font hidden sm:block">
            {formatDollars(npcReturnDollars)}
          </div>
        </div>
      </div>

      {/* Alpha Generated */}
      <div className="pt-3 sm:pt-4 border-t-2 border-yellow-500/30 text-center">
        <span className="text-gray-500 text-xs sm:text-sm tracking-wide">
          ALPHA GENERATED
        </span>
        <div className="display-font text-xl sm:text-2xl lg:text-3xl led-glow-yellow mt-1">
          {formatPercent(alphaGenerated)} // {formatDollars(alphaDollars)}
        </div>
      </div>
    </div>
  );
}
