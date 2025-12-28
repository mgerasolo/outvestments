"use client";

import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  icon: string;
  title: string;
  timestamp: string;
  type: "gain" | "loss" | "target" | "shot" | "achievement" | "npc";
}

interface ArenaLiveFeedProps {
  items: FeedItem[];
  className?: string;
}

export function ArenaLiveFeed({ items, className }: ArenaLiveFeedProps) {
  const getTitleClass = (type: FeedItem["type"]) => {
    switch (type) {
      case "gain":
        return "text-green-400";
      case "loss":
        return "text-red-400";
      case "target":
        return "text-yellow-400";
      case "achievement":
        return "text-purple-400";
      case "npc":
        return "text-yellow-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className={cn("led-panel led-dots rounded-xl p-3 sm:p-4 lg:p-5", className)}>
      <div className="display-font text-sm sm:text-base lg:text-lg text-gray-400 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
        LIVE FEED
      </div>

      {items.length === 0 ? (
        <div className="segment-display rounded-lg p-4 sm:p-5 lg:p-6 text-center">
          <div className="text-gray-500 display-font text-sm sm:text-base lg:text-lg">
            NO RECENT ACTIVITY
          </div>
          <div className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
            Actions will appear here
          </div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-56 lg:max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="segment-display rounded-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3"
            >
              <div className="text-lg sm:text-xl lg:text-2xl flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className={cn("font-bold truncate text-sm sm:text-base", getTitleClass(item.type))}>
                  {item.title}
                </div>
                <div className="text-gray-500 text-[10px] sm:text-xs">{item.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
