"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  closePartialPosition,
  closeFullPosition,
} from "@/app/actions/shots";
import type { Shot } from "@/lib/db/schema";

interface PartialCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shot: Shot;
  symbol: string;
}

export function PartialCloseDialog({
  open,
  onOpenChange,
  shot,
  symbol,
}: PartialCloseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Get current position size
  const currentQty = shot.filledQty
    ? Math.floor(Number(shot.filledQty))
    : shot.positionSize
      ? Math.floor(Number(shot.positionSize))
      : 0;

  const entryPrice = shot.fillPrice
    ? Number(shot.fillPrice)
    : Number(shot.entryPrice);

  // Form state
  const [quantity, setQuantity] = useState(currentQty);
  const [useLimitPrice, setUseLimitPrice] = useState(false);
  const [limitPrice, setLimitPrice] = useState(entryPrice.toFixed(2));
  const [sliderValue, setSliderValue] = useState([100]); // Percentage

  // Update quantity when slider changes
  useEffect(() => {
    const newQty = Math.round((sliderValue[0] / 100) * currentQty);
    setQuantity(Math.max(1, newQty));
  }, [sliderValue, currentQty]);

  // Update slider when quantity changes
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(Math.max(0, numValue), currentQty);
    setQuantity(clampedValue);
    setSliderValue([Math.round((clampedValue / currentQty) * 100)]);
  };

  const isPartialClose = quantity < currentQty;
  const remainingQty = currentQty - quantity;

  // Estimate P&L
  const estimatedExitPrice = useLimitPrice ? parseFloat(limitPrice) : entryPrice;
  const estimatedPL =
    shot.direction === "buy"
      ? (estimatedExitPrice - entryPrice) * quantity
      : (entryPrice - estimatedExitPrice) * quantity;

  const handleClose = () => {
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    startTransition(async () => {
      const exitPrice = useLimitPrice ? parseFloat(limitPrice) : undefined;

      const result = isPartialClose
        ? await closePartialPosition({
            shotId: shot.id,
            quantity,
            exitPrice,
          })
        : await closeFullPosition(shot.id, exitPrice);

      if (result.success) {
        const plText = result.realizedPL
          ? ` | P&L: $${result.realizedPL.toFixed(2)}`
          : "";
        toast.success(
          isPartialClose
            ? `Closed ${quantity} shares${plText}. ${remainingQty} shares remaining.`
            : `Position closed${plText}`
        );
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to close position");
      }
    });
  };

  // Quick action buttons
  const setPercentage = (percent: number) => {
    setSliderValue([percent]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Close Position
            <Badge variant="outline">{symbol}</Badge>
          </DialogTitle>
          <DialogDescription>
            {shot.direction === "buy" ? "Sell" : "Buy back"} shares to close
            your {shot.direction} position.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Position Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Position</span>
              <span className="font-medium">{currentQty} shares</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="font-medium">${entryPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Direction</span>
              <Badge
                variant="outline"
                className={
                  shot.direction === "buy"
                    ? "text-green-600 border-green-600"
                    : "text-red-600 border-red-600"
                }
              >
                {shot.direction.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Quantity Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quantity">Shares to Close</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-24 text-right"
                  min={1}
                  max={currentQty}
                />
                <span className="text-sm text-muted-foreground">
                  of {currentQty}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>{sliderValue[0]}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Quick percentage buttons */}
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant={sliderValue[0] === percent ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPercentage(percent)}
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Limit Price Option */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="use-limit">Use Limit Price</Label>
                <p className="text-xs text-muted-foreground">
                  Set a specific price instead of market order
                </p>
              </div>
              <Switch
                id="use-limit"
                checked={useLimitPrice}
                onCheckedChange={setUseLimitPrice}
              />
            </div>

            {useLimitPrice && (
              <div className="flex items-center gap-2">
                <Label htmlFor="limit-price" className="w-24">
                  Limit Price
                </Label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="limit-price"
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="pl-7"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Estimated Results */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Closing</span>
              <span className="font-medium">{quantity} shares</span>
            </div>
            {isPartialClose && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{remainingQty} shares</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Type</span>
              <span className="font-medium">
                {useLimitPrice ? `Limit @ $${limitPrice}` : "Market"}
              </span>
            </div>
            {useLimitPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. P&L</span>
                <span
                  className={`font-medium ${
                    estimatedPL >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {estimatedPL >= 0 ? "+" : ""}${estimatedPL.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={isPending || quantity <= 0}
            variant={isPartialClose ? "default" : "destructive"}
          >
            {isPending
              ? "Submitting..."
              : isPartialClose
                ? `Close ${quantity} Shares`
                : "Close Full Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
