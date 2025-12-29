"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ClosedShotWithContext } from "@/app/actions/shots";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";

type SortKey =
  | "symbol"
  | "direction"
  | "entryPrice"
  | "exitPrice"
  | "entryDate"
  | "exitDate"
  | "daysHeld"
  | "realizedPL"
  | "returnPercentage"
  | "annualizedReturnPercentage"
  | "accuracyScore"
  | "performanceScore"
  | "difficultyMultiplier"
  | "compositeScore";

type SortDirection = "asc" | "desc";

interface ClosedTradesTableProps {
  shots: ClosedShotWithContext[];
}

// Format value helpers
function formatPrice(value: string | null): string {
  if (!value) return "-";
  const num = Number(value);
  return `$${num.toFixed(2)}`;
}

function formatReturn(value: string | null, showSign = true): string {
  if (!value) return "-";
  const num = Number(value);
  const sign = showSign && num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

function formatScore(value: string | null): string {
  if (!value) return "-";
  const num = Number(value);
  return num.toFixed(0);
}

function formatPL(value: string | null): string {
  if (!value) return "-";
  const num = Number(value);
  const sign = num >= 0 ? "+" : "";
  return `${sign}$${Math.abs(num).toFixed(2)}`;
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

// Sortable header component
function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      className={cn(
        "px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors select-none whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
      onClick={() => onSort(sortKey)}
    >
      <div
        className={cn(
          "flex items-center gap-1",
          align === "right" && "justify-end",
          align === "center" && "justify-center"
        )}
      >
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="w-3 h-3 text-yellow-500" />
          ) : (
            <ArrowDown className="w-3 h-3 text-yellow-500" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

// Direction badge component
function DirectionBadge({ direction }: { direction: "buy" | "sell" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded uppercase",
        direction === "buy"
          ? "bg-green-900/50 text-green-400 border border-green-700/50"
          : "bg-red-900/50 text-red-400 border border-red-700/50"
      )}
    >
      {direction === "buy" ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {direction === "buy" ? "Long" : "Short"}
    </span>
  );
}

// Value cell with color coding
function ColoredValue({
  value,
  formatter,
  className,
}: {
  value: string | null;
  formatter: (v: string | null) => string;
  className?: string;
}) {
  if (!value) return <span className="text-gray-500">-</span>;
  const num = Number(value);
  const isPositive = num > 0;
  const isNegative = num < 0;

  return (
    <span
      className={cn(
        "display-font",
        isPositive && "led-glow-green",
        isNegative && "led-glow-red",
        !isPositive && !isNegative && "text-gray-300",
        className
      )}
    >
      {formatter(value)}
    </span>
  );
}

export function ClosedTradesTable({ shots }: ClosedTradesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("exitDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedShots = useMemo(() => {
    return [...shots].sort((a, b) => {
      let aValue: number | string | Date | null;
      let bValue: number | string | Date | null;

      switch (sortKey) {
        case "symbol":
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case "direction":
          aValue = a.direction;
          bValue = b.direction;
          break;
        case "entryPrice":
          aValue = a.entryPrice ? Number(a.entryPrice) : 0;
          bValue = b.entryPrice ? Number(b.entryPrice) : 0;
          break;
        case "exitPrice":
          aValue = a.exitPrice ? Number(a.exitPrice) : 0;
          bValue = b.exitPrice ? Number(b.exitPrice) : 0;
          break;
        case "entryDate":
          aValue = new Date(a.entryDate).getTime();
          bValue = new Date(b.entryDate).getTime();
          break;
        case "exitDate":
          aValue = a.exitDate ? new Date(a.exitDate).getTime() : 0;
          bValue = b.exitDate ? new Date(b.exitDate).getTime() : 0;
          break;
        case "daysHeld":
          aValue = a.daysHeld ?? 0;
          bValue = b.daysHeld ?? 0;
          break;
        case "realizedPL":
          aValue = a.realizedPL ? Number(a.realizedPL) : 0;
          bValue = b.realizedPL ? Number(b.realizedPL) : 0;
          break;
        case "returnPercentage":
          aValue = a.returnPercentage ? Number(a.returnPercentage) : 0;
          bValue = b.returnPercentage ? Number(b.returnPercentage) : 0;
          break;
        case "annualizedReturnPercentage":
          aValue = a.annualizedReturnPercentage
            ? Number(a.annualizedReturnPercentage)
            : 0;
          bValue = b.annualizedReturnPercentage
            ? Number(b.annualizedReturnPercentage)
            : 0;
          break;
        case "accuracyScore":
          aValue = a.accuracyScore ? Number(a.accuracyScore) : 0;
          bValue = b.accuracyScore ? Number(b.accuracyScore) : 0;
          break;
        case "performanceScore":
          aValue = a.performanceScore ? Number(a.performanceScore) : 0;
          bValue = b.performanceScore ? Number(b.performanceScore) : 0;
          break;
        case "difficultyMultiplier":
          aValue = a.difficultyMultiplier ? Number(a.difficultyMultiplier) : 0;
          bValue = b.difficultyMultiplier ? Number(b.difficultyMultiplier) : 0;
          break;
        case "compositeScore":
          aValue = a.compositeScore ? Number(a.compositeScore) : 0;
          bValue = b.compositeScore ? Number(b.compositeScore) : 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [shots, sortKey, sortDirection]);

  return (
    <div className="led-panel led-dots rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <h3 className="display-font text-lg led-glow-yellow">TRADE LOG</h3>
        <div className="text-gray-400 text-sm">
          {shots.length} {shots.length === 1 ? "trade" : "trades"}
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-900/50 border-b border-gray-700/50">
            <tr>
              <SortableHeader
                label="Symbol"
                sortKey="symbol"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Dir"
                sortKey="direction"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortableHeader
                label="Entry"
                sortKey="entryPrice"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Exit"
                sortKey="exitPrice"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="In"
                sortKey="entryDate"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortableHeader
                label="Out"
                sortKey="exitDate"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              />
              <SortableHeader
                label="Days"
                sortKey="daysHeld"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="P&L"
                sortKey="realizedPL"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Return"
                sortKey="returnPercentage"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Annual"
                sortKey="annualizedReturnPercentage"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Accuracy"
                sortKey="accuracyScore"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Perform"
                sortKey="performanceScore"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Diff"
                sortKey="difficultyMultiplier"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="Score"
                sortKey="compositeScore"
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              />
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {sortedShots.map((shot, index) => {
              const isWin =
                shot.returnPercentage && Number(shot.returnPercentage) > 0;
              const rowBgClass = index % 2 === 0 ? "bg-gray-900/20" : "";

              return (
                <tr
                  key={shot.id}
                  className={cn(
                    rowBgClass,
                    "hover:bg-gray-800/50 transition-colors"
                  )}
                >
                  {/* Symbol */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-1 h-8 rounded-full",
                          isWin ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                      <div>
                        <div className="display-font text-sm sm:text-base text-white">
                          {shot.symbol}
                        </div>
                        <div className="text-gray-500 text-[10px] truncate max-w-[120px]">
                          {shot.targetThesis.substring(0, 30)}
                          {shot.targetThesis.length > 30 ? "..." : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Direction */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                    <DirectionBadge direction={shot.direction} />
                  </td>

                  {/* Entry Price */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <span className="display-font text-sm text-gray-300">
                      {formatPrice(shot.entryPrice)}
                    </span>
                  </td>

                  {/* Exit Price */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <span className="display-font text-sm text-gray-300">
                      {formatPrice(shot.exitPrice)}
                    </span>
                  </td>

                  {/* Entry Date */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                    <span className="text-gray-400 text-xs">
                      {formatDate(shot.entryDate)}
                    </span>
                  </td>

                  {/* Exit Date */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                    <span className="text-gray-400 text-xs">
                      {formatDate(shot.exitDate)}
                    </span>
                  </td>

                  {/* Days Held */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <span className="display-font text-sm led-glow-yellow">
                      {shot.daysHeld ?? "-"}
                    </span>
                  </td>

                  {/* P&L */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <ColoredValue
                      value={shot.realizedPL}
                      formatter={formatPL}
                      className="text-sm"
                    />
                  </td>

                  {/* Return % */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <ColoredValue
                      value={shot.returnPercentage}
                      formatter={formatReturn}
                      className="text-sm"
                    />
                  </td>

                  {/* Annualized % */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <ColoredValue
                      value={shot.annualizedReturnPercentage}
                      formatter={formatReturn}
                      className="text-xs"
                    />
                  </td>

                  {/* Accuracy Score */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <ColoredValue
                      value={shot.accuracyScore}
                      formatter={formatScore}
                      className="text-sm"
                    />
                  </td>

                  {/* Performance Score */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <ColoredValue
                      value={shot.performanceScore}
                      formatter={formatScore}
                      className="text-sm"
                    />
                  </td>

                  {/* Difficulty Multiplier */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <span className="display-font text-sm text-yellow-400">
                      {shot.difficultyMultiplier
                        ? `${Number(shot.difficultyMultiplier).toFixed(1)}x`
                        : "-"}
                    </span>
                  </td>

                  {/* Composite Score */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-right">
                    <div className="segment-display inline-block px-2 py-1 rounded">
                      <span
                        className={cn(
                          "display-font text-base",
                          shot.compositeScore
                            ? Number(shot.compositeScore) >= 100
                              ? "led-glow-green"
                              : Number(shot.compositeScore) >= 50
                                ? "led-glow-yellow"
                                : "led-glow-red"
                            : "text-gray-500"
                        )}
                      >
                        {shot.compositeScore
                          ? Number(shot.compositeScore).toFixed(0)
                          : "-"}
                      </span>
                    </div>
                  </td>

                  {/* Link to Target */}
                  <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                    <Link
                      href={`/targets/${shot.targetId}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-yellow-500 transition-colors"
                      title="View Target"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Legend */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/30">
        <div className="flex flex-wrap gap-4 text-[10px] sm:text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Loss</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-400">Score:</span>
            <span className="led-glow-green">100+ = Excellent</span>
            <span className="mx-1">|</span>
            <span className="led-glow-yellow">50-99 = Good</span>
            <span className="mx-1">|</span>
            <span className="led-glow-red">&lt;50 = Needs Work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
