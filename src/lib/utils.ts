import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency value (stored as cents) to display string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/**
 * Format PPD (Performance Per Day) value
 */
export function formatPPD(ppd: number): string {
  return `${ppd >= 0 ? "+" : ""}${ppd.toFixed(4)}%/day`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format relative date (e.g., "3 days ago", "in 2 weeks")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffDays) < 1) {
    return "today";
  } else if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(Math.round(diffDays / 7), "week");
  } else if (Math.abs(diffDays) < 365) {
    return rtf.format(Math.round(diffDays / 30), "month");
  } else {
    return rtf.format(Math.round(diffDays / 365), "year");
  }
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
