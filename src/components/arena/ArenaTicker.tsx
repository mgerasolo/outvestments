"use client";

import { cn } from "@/lib/utils";

interface TickerItem {
  id: string;
  icon: string;
  text: string;
  type: "gain" | "loss" | "target" | "achievement" | "info";
}

interface ArenaTickerProps {
  items: TickerItem[];
  className?: string;
}

export function ArenaTicker({ items, className }: ArenaTickerProps) {
  // Duplicate items for seamless loop
  const tickerContent = [...items, ...items];

  const getTextClass = (type: TickerItem["type"]) => {
    switch (type) {
      case "gain":
        return "text-green-400";
      case "loss":
        return "text-red-400";
      case "target":
        return "text-yellow-400";
      case "achievement":
        return "text-purple-400";
      default:
        return "led-glow-yellow";
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={cn("led-panel rounded-xl overflow-hidden", className)}>
      <div className="flex items-center">
        {/* LIVE Badge */}
        <div className="bg-red-600 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 display-font text-white text-sm sm:text-base lg:text-lg flex-shrink-0 z-10 flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden py-1.5 sm:py-2">
          <div className="ticker-scroll whitespace-nowrap display-font text-sm sm:text-base lg:text-lg">
            {tickerContent.map((item, index) => (
              <span key={`${item.id}-${index}`} className="inline-flex items-center">
                <span className="mx-2 sm:mx-3">{item.icon}</span>
                <span className={getTextClass(item.type)}>{item.text}</span>
                <span className="mx-3 sm:mx-4 lg:mx-6 text-gray-600">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default ticker items when no data
export const defaultTickerItems: TickerItem[] = [
  { id: "1", icon: "📊", text: "MARKET TRACKING ACTIVE", type: "info" },
  { id: "2", icon: "🎯", text: "SET A TARGET TO BEGIN", type: "info" },
  { id: "3", icon: "⚡", text: "PULL THE TRIGGER ON YOUR FIRST SHOT", type: "info" },
];
