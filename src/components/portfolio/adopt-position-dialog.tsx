"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adoptOrphanPosition,
  type OrphanPosition,
  type AdoptPositionData,
} from "@/app/actions/orphan-positions";
import type { TargetType } from "@/lib/db/schema";

interface AdoptPositionDialogProps {
  position: OrphanPosition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const TARGET_TYPES: { value: TargetType; label: string; description: string }[] = [
  {
    value: "growth",
    label: "Growth",
    description: "Expecting price appreciation",
  },
  {
    value: "value",
    label: "Value",
    description: "Undervalued, waiting for realization",
  },
  {
    value: "momentum",
    label: "Momentum",
    description: "Riding the trend",
  },
  {
    value: "dividend",
    label: "Dividend",
    description: "Income-focused holding",
  },
  {
    value: "speculative",
    label: "Speculative",
    description: "High risk/reward play",
  },
];

export function AdoptPositionDialog({
  position,
  open,
  onOpenChange,
  onSuccess,
}: AdoptPositionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [thesis, setThesis] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("growth");
  const [targetPriceRealistic, setTargetPriceRealistic] = useState("");
  const [targetPriceReach, setTargetPriceReach] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");

  // Reset form when position changes
  const resetForm = () => {
    setThesis("");
    setTargetType("growth");
    setTargetPriceRealistic("");
    setTargetPriceReach("");
    setTargetDate("");
    setStopLossPrice("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!position) return;

    const formData: AdoptPositionData = {
      symbol: position.symbol,
      quantity: parseFloat(position.qty),
      avgEntryPrice: parseFloat(position.avgEntryPrice),
      thesis: thesis.trim(),
      targetType,
      targetPriceRealistic: parseFloat(targetPriceRealistic),
      targetPriceReach: targetPriceReach ? parseFloat(targetPriceReach) : undefined,
      targetDate: new Date(targetDate),
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
    };

    startTransition(async () => {
      const result = await adoptOrphanPosition(formData);

      if (result.success) {
        toast.success(`Position ${position.symbol} adopted successfully`);
        resetForm();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
        // Navigate to the new target
        if (result.targetId) {
          router.push(`/targets/${result.targetId}`);
        }
      } else {
        toast.error(result.error || "Failed to adopt position");
      }
    });
  };

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatPercent = (value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num >= 0 ? "+" : ""}${(num * 100).toFixed(2)}%`;
  };

  if (!position) return null;

  const unrealizedPL = parseFloat(position.unrealizedPL);
  const isProfit = unrealizedPL >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adopt Position: {position.symbol}</DialogTitle>
          <DialogDescription>
            Create a Target, Aim, and Shot to track this position in Outvestments.
          </DialogDescription>
        </DialogHeader>

        {/* Position Summary */}
        <div className="rounded-lg border bg-muted/50 p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Shares:</span>{" "}
              <span className="font-medium">{parseFloat(position.qty).toFixed(0)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Entry:</span>{" "}
              <span className="font-medium">{formatCurrency(position.avgEntryPrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Current Price:</span>{" "}
              <span className="font-medium">{formatCurrency(position.currentPrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Market Value:</span>{" "}
              <span className="font-medium">{formatCurrency(position.marketValue)}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Unrealized P/L:</span>{" "}
              <span className={`font-medium ${isProfit ? "text-gain" : "text-loss"}`}>
                {formatCurrency(position.unrealizedPL)} ({formatPercent(position.unrealizedPLPercent)})
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investment Thesis */}
          <div className="space-y-2">
            <Label htmlFor="thesis">Investment Thesis *</Label>
            <Textarea
              id="thesis"
              placeholder="Why did you buy this position? What's your investment thesis? (min 10 characters)"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={3}
              className="resize-none"
              required
              minLength={10}
            />
            <p className="text-sm text-muted-foreground">
              Document your reasoning for this investment.
            </p>
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <Label htmlFor="targetType">Target Type *</Label>
            <Select
              value={targetType}
              onValueChange={(value) => setTargetType(value as TargetType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Prices */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetPriceRealistic">Target Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="targetPriceRealistic"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter target price"
                  value={targetPriceRealistic}
                  onChange={(e) => setTargetPriceRealistic(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your price target for this position.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPriceReach">Reach Target (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="targetPriceReach"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Optimistic target"
                  value={targetPriceReach}
                  onChange={(e) => setTargetPriceReach(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Stretch goal price.
              </p>
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date *</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
            <p className="text-sm text-muted-foreground">
              When do you expect this target to be reached?
            </p>
          </div>

          {/* Stop Loss */}
          <div className="space-y-2">
            <Label htmlFor="stopLossPrice">Stop Loss (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="stopLossPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Exit price if things go wrong"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              At what price would you cut your losses?
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                !thesis ||
                thesis.trim().length < 10 ||
                !targetPriceRealistic ||
                !targetDate
              }
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
                  Adopting...
                </>
              ) : (
                "Adopt Position"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
