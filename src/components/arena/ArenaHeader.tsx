"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ArenaHeaderProps {
  userName?: string;
  className?: string;
}

export function ArenaHeader({ userName, className }: ArenaHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Format as HH:MM:SS
      setCurrentTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      // Check if market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
      const day = now.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const etHour = hours; // Simplified - would need proper timezone handling
      const isMarketHours = etHour >= 9 && etHour < 16;
      setIsMarketOpen(isWeekday && isMarketHours);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={cn("led-panel led-dots rounded-xl p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-md group-hover:blur-lg transition-all" />
            <Image
              src="/logo.png"
              alt="Outvestments"
              width={48}
              height={48}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-yellow-500 shadow-lg shadow-yellow-500/20"
            />
          </div>
          <div>
            <div className="display-font text-xl sm:text-2xl lg:text-3xl led-glow-yellow">
              OUTVESTMENTS
            </div>
            <div className="text-gray-400 text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] hidden sm:block">
              CHAMPIONSHIP TRADING
            </div>
          </div>
        </Link>

        {/* Live Clock - Hidden on small screens */}
        <div className="segment-display rounded-lg hidden md:block">
          <div className="display-font text-2xl lg:text-3xl led-glow-green led-flicker">
            {currentTime || "00:00:00"}
          </div>
          <div className="text-center text-gray-500 text-[10px] mt-0.5">
            MARKET TIME
          </div>
        </div>

        {/* Market Status */}
        <div className="segment-display rounded-lg flex items-center gap-2 px-2 sm:px-4">
          <div
            className={cn(
              "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-lg flex-shrink-0",
              isMarketOpen
                ? "bg-green-500 animate-pulse shadow-green-500/50"
                : "bg-red-500 shadow-red-500/50"
            )}
          />
          <div>
            <div
              className={cn(
                "display-font text-xs sm:text-sm",
                isMarketOpen ? "led-glow-green" : "led-glow-red"
              )}
            >
              {isMarketOpen ? "OPEN" : "CLOSED"}
            </div>
            <div className="text-gray-500 text-[10px] uppercase hidden sm:block">{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
