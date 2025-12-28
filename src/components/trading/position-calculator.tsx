"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAccountEquity } from "@/app/actions/account";

interface PositionCalculatorProps {
  /** Pre-fill entry price from aim's target price */
  defaultEntryPrice?: number;
  /** Callback when position size is calculated */
  onPositionSizeChange?: (shares: number) => void;
  /** Whether the collapsible section is open by default */
  defaultOpen?: boolean;
}

interface CalculationResult {
  positionSize: number;
  positionValue: number;
  riskAmount: number;
  direction: "long" | "short";
  isValid: boolean;
  warnings: string[];
}

export function PositionCalculator({
  defaultEntryPrice,
  onPositionSizeChange,
  defaultOpen = false,
}: PositionCalculatorProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Input state
  const [accountSize, setAccountSize] = useState<string>("");
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<string>(
    defaultEntryPrice?.toString() || ""
  );
  const [stopLossPrice, setStopLossPrice] = useState<string>("");

  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Fetch account equity from Alpaca
  const fetchAccountEquity = useCallback(() => {
    startTransition(async () => {
      const response = await getAccountEquity();
      if (response.success && response.equity) {
        setAccountSize(response.equity.toFixed(2));
      }
    });
  }, []);

  // Calculate position size whenever inputs change
  useEffect(() => {
    const account = parseFloat(accountSize);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLossPrice);

    // Reset result if inputs are invalid
    if (isNaN(account) || isNaN(entry) || isNaN(stop) || account <= 0 || entry <= 0 || stop <= 0) {
      setResult(null);
      return;
    }

    // Entry and stop cannot be the same
    if (entry === stop) {
      setResult(null);
      return;
    }

    const warnings: string[] = [];

    // Determine direction
    const direction: "long" | "short" = entry > stop ? "long" : "short";

    // Calculate risk per share (absolute value)
    const riskPerShare = Math.abs(entry - stop);

    // Calculate risk amount in dollars
    const riskAmount = (account * riskPercent) / 100;

    // Calculate position size (shares)
    // Formula: Position Size = (Account x Risk%) / (Entry - StopLoss)
    const positionSize = Math.floor(riskAmount / riskPerShare);

    // Calculate position value
    const positionValue = positionSize * entry;

    // Check if position is too large (>10% of account)
    const positionPercent = (positionValue / account) * 100;
    if (positionPercent > 10) {
      warnings.push(
        `Warning: Position is ${positionPercent.toFixed(1)}% of account (>10%)`
      );
    }

    // Check if position value exceeds buying power (rough check)
    if (positionValue > account) {
      warnings.push(
        "Warning: Position value exceeds account size"
      );
    }

    // Ensure at least 1 share
    const finalPositionSize = Math.max(positionSize, 0);

    setResult({
      positionSize: finalPositionSize,
      positionValue: finalPositionSize * entry,
      riskAmount,
      direction,
      isValid: finalPositionSize > 0,
      warnings,
    });

    // Notify parent of position size change
    if (onPositionSizeChange && finalPositionSize > 0) {
      onPositionSizeChange(finalPositionSize);
    }
  }, [accountSize, riskPercent, entryPrice, stopLossPrice, onPositionSizeChange]);

  // Update entry price when prop changes
  useEffect(() => {
    if (defaultEntryPrice !== undefined) {
      setEntryPrice(defaultEntryPrice.toString());
    }
  }, [defaultEntryPrice]);

  const handleApplyToForm = () => {
    if (result && result.positionSize > 0 && onPositionSizeChange) {
      onPositionSizeChange(result.positionSize);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="16" height="16" x="4" y="4" rx="2" />
                    <path d="M4 12h16" />
                    <path d="M12 4v16" />
                  </svg>
                  Position Size Calculator
                </CardTitle>
                <CardDescription>
                  Calculate optimal position size based on risk management
                </CardDescription>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-5 w-5 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Account Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="accountSize">Account Size</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fetchAccountEquity}
                  disabled={isPending}
                  className="h-7 text-xs"
                >
                  {isPending ? (
                    <svg
                      className="animate-spin h-3 w-3 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 mr-1"
                    >
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                  )}
                  Fetch from Alpaca
                </Button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="accountSize"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100000.00"
                  value={accountSize}
                  onChange={(e) => setAccountSize(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            {/* Risk Percentage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="riskPercent">Risk Percentage</Label>
                <span className="text-sm font-medium">{riskPercent}%</span>
              </div>
              <Slider
                id="riskPercent"
                min={0.5}
                max={5}
                step={0.5}
                value={[riskPercent]}
                onValueChange={(value) => setRiskPercent(value[0])}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Typical range: 1-2% conservative, 2-3% moderate, 3-5% aggressive
              </p>
            </div>

            {/* Entry and Stop Loss Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="150.00"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLossPrice">Stop Loss Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="stopLossPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="145.00"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            {result && result.isValid && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Position Type
                  </span>
                  <span
                    className={`font-semibold ${
                      result.direction === "long" ? "text-gain" : "text-loss"
                    }`}
                  >
                    {result.direction.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{result.positionSize}</p>
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ${result.positionValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Position Value
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-loss">
                      ${result.riskAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Risk Amount</p>
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 flex-shrink-0"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <line x1="12" x2="12" y1="9" y2="13" />
                          <line x1="12" x2="12.01" y1="17" y2="17" />
                        </svg>
                        {warning}
                      </div>
                    ))}
                  </div>
                )}

                {/* Apply Button */}
                {onPositionSizeChange && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyToForm}
                    className="w-full mt-2"
                  >
                    Apply {result.positionSize} shares to form
                  </Button>
                )}
              </div>
            )}

            {/* Formula explanation */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <p className="font-medium mb-1">Formula:</p>
              <p>
                Position Size = (Account Size x Risk %) / |Entry Price - Stop
                Loss|
              </p>
              <p className="mt-2">
                <strong>Long:</strong> Entry &gt; Stop Loss |{" "}
                <strong>Short:</strong> Entry &lt; Stop Loss
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
