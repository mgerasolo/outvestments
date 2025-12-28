"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ArenaActionButtonsProps {
  className?: string;
}

export function ArenaActionButtons({ className }: ArenaActionButtonsProps) {
  return (
    <div className={cn("space-y-2 sm:space-y-3", className)}>
      <Link href="/targets/new" className="block">
        <button className="w-full py-2.5 sm:py-3 lg:py-4 arena-btn-primary rounded-lg sm:rounded-xl display-font text-base sm:text-lg lg:text-xl text-white flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl lg:text-2xl">🎯</span>
          SET NEW TARGET
        </button>
      </Link>

      <Link href="/targets" className="block">
        <button className="w-full py-2.5 sm:py-3 lg:py-4 arena-btn-secondary rounded-lg sm:rounded-xl display-font text-base sm:text-lg lg:text-xl flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl lg:text-2xl">⚡</span>
          PULL TRIGGER
        </button>
      </Link>
    </div>
  );
}
