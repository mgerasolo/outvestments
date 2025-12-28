"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fetchSymbolLogo } from "@/app/actions/symbols";
import type { MarketType } from "@/lib/db/schema";

interface SymbolLogoProps {
  symbol: string;
  name?: string;
  logoUrl?: string | null;
  marketType?: MarketType;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** If true, will fetch logo from API if not provided */
  fetchIfMissing?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const sizePx = {
  sm: 24,
  md: 32,
  lg: 40,
};

/**
 * Generate a consistent color based on the symbol string
 */
function getSymbolColor(symbol: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-rose-500",
    "bg-amber-500",
  ];

  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * SymbolLogo - Displays a company/ETF logo or a styled fallback
 *
 * For stocks: Uses Finnhub logos (lazy-loaded and cached)
 * For ETFs: Uses letter placeholder (Finnhub doesn't have ETF logos)
 */
export function SymbolLogo({
  symbol,
  name,
  logoUrl: initialLogoUrl,
  marketType = "stock",
  size = "md",
  className,
  fetchIfMissing = false,
}: SymbolLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logo if not provided and fetchIfMissing is true
  useEffect(() => {
    if (!initialLogoUrl && fetchIfMissing && !logoUrl && !isLoading && marketType === "stock") {
      setIsLoading(true);
      fetchSymbolLogo(symbol)
        .then((url) => {
          if (url) setLogoUrl(url);
        })
        .catch(() => {
          // Ignore errors, fallback will show
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [symbol, initialLogoUrl, fetchIfMissing, logoUrl, isLoading, marketType]);

  // Update logo if prop changes
  useEffect(() => {
    if (initialLogoUrl) {
      setLogoUrl(initialLogoUrl);
      setHasError(false);
    }
  }, [initialLogoUrl]);

  const sizeClass = sizeClasses[size];
  const px = sizePx[size];

  // Show logo if we have one and no error
  if (logoUrl && !hasError) {
    return (
      <div
        className={cn(
          "relative rounded-md overflow-hidden bg-white flex-shrink-0",
          sizeClass,
          className
        )}
      >
        <Image
          src={logoUrl}
          alt={`${name || symbol} logo`}
          width={px}
          height={px}
          className="object-contain"
          onError={() => setHasError(true)}
          unoptimized // External URLs from Finnhub
        />
      </div>
    );
  }

  // Fallback: Letter placeholder with consistent color
  const letter = symbol.charAt(0).toUpperCase();
  const colorClass = getSymbolColor(symbol);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md text-white font-semibold flex-shrink-0",
        sizeClass,
        colorClass,
        className
      )}
      title={name || symbol}
    >
      {letter}
    </div>
  );
}

/**
 * SymbolDisplay - Full symbol display with logo, ticker, and name
 * Use this in lists, cards, and displays throughout the app
 */
interface SymbolDisplayProps {
  symbol: string;
  name?: string;
  logoUrl?: string | null;
  marketType?: MarketType;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showBadge?: boolean;
  className?: string;
  fetchLogo?: boolean;
}

export function SymbolDisplay({
  symbol,
  name,
  logoUrl,
  marketType = "stock",
  size = "md",
  showName = true,
  showBadge = false,
  className,
  fetchLogo = false,
}: SymbolDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SymbolLogo
        symbol={symbol}
        name={name}
        logoUrl={logoUrl}
        marketType={marketType}
        size={size}
        fetchIfMissing={fetchLogo}
      />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">{symbol}</span>
          {showBadge && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0 rounded uppercase font-medium",
                marketType === "etf"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {marketType}
            </span>
          )}
        </div>
        {showName && name && (
          <span className="text-xs text-muted-foreground truncate">{name}</span>
        )}
      </div>
    </div>
  );
}
