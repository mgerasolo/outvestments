"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PositionCalculator } from "@/components/trading/position-calculator";
import { createShot, type ShotFormData } from "@/app/actions/shots";
import type { Aim, Direction, TriggerType, ShotType } from "@/lib/db/schema";

interface ShotFormProps {
  targetId: string;
  aim: Aim;
}

export function ShotForm({ targetId, aim }: ShotFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [direction, setDirection] = useState<Direction>("buy");
  const [entryPrice, setEntryPrice] = useState<string>(
    aim.targetPriceRealistic ? Number(aim.targetPriceRealistic).toFixed(2) : ""
  );
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [positionSize, setPositionSize] = useState<string>("");
  const [triggerType, setTriggerType] = useState<TriggerType>("limit");
  const [shotType, setShotType] = useState<ShotType>("stock");
  // Trading discipline field - inherit from aim if set
  const [stopLossPrice, setStopLossPrice] = useState<string>(
    aim.stopLossPrice ? Number(aim.stopLossPrice).toFixed(2) : ""
  );

  const handlePositionSizeFromCalculator = (shares: number) => {
    setPositionSize(shares.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: ShotFormData = {
      aimId: aim.id,
      direction,
      entryPrice: Number(entryPrice),
      entryDate: new Date(entryDate),
      positionSize: positionSize ? Number(positionSize) : undefined,
      triggerType,
      shotType,
      stopLossPrice: stopLossPrice ? Number(stopLossPrice) : undefined,
    };

    startTransition(async () => {
      const result = await createShot(formData);

      if (result.success) {
        toast.success("Shot created successfully");
        router.push(`/targets/${targetId}/aims/${aim.id}`);
      } else {
        toast.error(result.error || "Failed to create shot");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Position Calculator - Collapsible */}
      <PositionCalculator
        defaultEntryPrice={Number(entryPrice) || undefined}
        onPositionSizeChange={handlePositionSizeFromCalculator}
        defaultOpen={false}
      />

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shot Details</CardTitle>
          <CardDescription>
            Configure your trade entry for {aim.symbol}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Direction */}
            <div className="space-y-2">
              <Label>Direction *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={direction === "buy" ? "default" : "outline"}
                  onClick={() => setDirection("buy")}
                  className={
                    direction === "buy"
                      ? "bg-gain hover:bg-gain/90 flex-1"
                      : "flex-1"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  BUY (Long)
                </Button>
                <Button
                  type="button"
                  variant={direction === "sell" ? "default" : "outline"}
                  onClick={() => setDirection("sell")}
                  className={
                    direction === "sell"
                      ? "bg-loss hover:bg-loss/90 flex-1"
                      : "flex-1"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  SELL (Short)
                </Button>
              </div>
            </div>

            {/* Entry Price and Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price *</Label>
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
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Aim target: ${Number(aim.targetPriceRealistic).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryDate">Entry Date *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Position Size */}
            <div className="space-y-2">
              <Label htmlFor="positionSize">Position Size (Shares)</Label>
              <Input
                id="positionSize"
                type="number"
                step="1"
                min="1"
                placeholder="100"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Use the calculator above to determine optimal size.
              </p>
            </div>

            {/* Stop Loss */}
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
                  placeholder="140.00"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Strongly encouraged.</strong> At what price would you cut losses? Define this before the trade.
              </p>
              {!stopLossPrice && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Trading without a stop loss increases risk. Consider setting one.
                </p>
              )}
            </div>

            {/* Trigger Type and Shot Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="triggerType">Order Type *</Label>
                <Select
                  value={triggerType}
                  onValueChange={(value: TriggerType) => setTriggerType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {triggerType === "market"
                    ? "Execute at current market price"
                    : "Execute at specified entry price or better"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shotType">Instrument Type *</Label>
                <Select
                  value={shotType}
                  onValueChange={(value: ShotType) => setShotType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {shotType === "stock"
                    ? "Trade equity shares"
                    : "Trade options contracts"}
                </p>
              </div>
            </div>

            {/* Summary */}
            {entryPrice && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Symbol:</span>{" "}
                    <span className="font-medium">{aim.symbol}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Direction:</span>{" "}
                    <span
                      className={`font-medium ${
                        direction === "buy" ? "text-gain" : "text-loss"
                      }`}
                    >
                      {direction.toUpperCase()}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Entry Price:</span>{" "}
                    <span className="font-medium">
                      ${Number(entryPrice).toFixed(2)}
                    </span>
                  </p>
                  {positionSize && (
                    <>
                      <p>
                        <span className="text-muted-foreground">Shares:</span>{" "}
                        <span className="font-medium">{positionSize}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Est. Value:
                        </span>{" "}
                        <span className="font-medium">
                          $
                          {(
                            Number(positionSize) * Number(entryPrice)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </p>
                    </>
                  )}
                  <p>
                    <span className="text-muted-foreground">Order Type:</span>{" "}
                    <span className="font-medium capitalize">{triggerType}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Instrument:</span>{" "}
                    <span className="font-medium capitalize">{shotType}</span>
                  </p>
                  {stopLossPrice && (
                    <p>
                      <span className="text-muted-foreground">Stop Loss:</span>{" "}
                      <span className="font-medium text-loss">
                        ${Number(stopLossPrice).toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isPending || !entryPrice || !entryDate}
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="22" x2="18" y1="12" y2="12" />
                      <line x1="6" x2="2" y1="12" y2="12" />
                      <line x1="12" x2="12" y1="6" y2="2" />
                      <line x1="12" x2="12" y1="22" y2="18" />
                    </svg>
                    Create Shot
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
