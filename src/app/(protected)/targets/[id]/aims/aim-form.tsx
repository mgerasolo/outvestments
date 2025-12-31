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
import { Textarea } from "@/components/ui/textarea";
import { SymbolSearchInput } from "@/components/ui/symbol-search-input";
import { createAim, updateAim, type AimFormData } from "@/app/actions/aims";
import type { Aim, AimType, InvestmentDirection } from "@/lib/db/schema";
import type { SymbolSearchResult } from "@/app/actions/symbols";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AimFormProps {
  targetId: string;
  aim?: Aim;
  onSuccess?: () => void;
}

export function AimForm({ targetId, aim, onSuccess }: AimFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [symbol, setSymbol] = useState(aim?.symbol || "");
  const [companyName, setCompanyName] = useState("");
  const [targetPriceRealistic, setTargetPriceRealistic] = useState(
    aim?.targetPriceRealistic ? Number(aim.targetPriceRealistic) : ""
  );
  const [targetPriceReach, setTargetPriceReach] = useState(
    aim?.targetPriceReach ? Number(aim.targetPriceReach) : ""
  );
  const [targetDate, setTargetDate] = useState(
    aim?.targetDate
      ? new Date(aim.targetDate).toISOString().split("T")[0]
      : ""
  );
  // Aim type
  const [aimType, setAimType] = useState<AimType>(aim?.aimType || "playable");
  // Investment direction - long (betting price goes up) or short (betting price goes down)
  const [investmentDirection, setInvestmentDirection] = useState<InvestmentDirection>(
    aim?.investmentDirection || "long"
  );
  // Trading discipline fields
  const [stopLossPrice, setStopLossPrice] = useState(
    aim?.stopLossPrice ? Number(aim.stopLossPrice) : ""
  );
  const [takeProfitPrice, setTakeProfitPrice] = useState(
    aim?.takeProfitPrice ? Number(aim.takeProfitPrice) : ""
  );
  const [exitConditions, setExitConditions] = useState(aim?.exitConditions || "");

  const isEditing = !!aim;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: AimFormData = {
      targetId,
      symbol: symbol.toUpperCase(),
      targetPriceRealistic: Number(targetPriceRealistic),
      targetPriceReach: targetPriceReach ? Number(targetPriceReach) : undefined,
      targetDate: new Date(targetDate),
      // Aim type
      aimType,
      // Investment direction
      investmentDirection,
      // Trading discipline fields
      stopLossPrice: stopLossPrice ? Number(stopLossPrice) : undefined,
      takeProfitPrice: takeProfitPrice ? Number(takeProfitPrice) : undefined,
      exitConditions: exitConditions || undefined,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateAim(aim.id, {
            symbol: formData.symbol,
            targetPriceRealistic: formData.targetPriceRealistic,
            targetPriceReach: formData.targetPriceReach,
            targetDate: formData.targetDate,
            aimType: formData.aimType,
            investmentDirection: formData.investmentDirection,
            stopLossPrice: formData.stopLossPrice,
            takeProfitPrice: formData.takeProfitPrice,
            exitConditions: formData.exitConditions,
          })
        : await createAim(formData);

      if (result.success) {
        toast.success(isEditing ? "Aim updated" : "Aim created");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/targets/${targetId}`);
        }
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Aim" : "Add Aim"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your price target details."
            : "Set a specific price target with a symbol and date."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <SymbolSearchInput
              value={symbol}
              onChange={(sym, result) => {
                setSymbol(sym);
                if (result) {
                  setCompanyName(result.name);
                }
              }}
              placeholder="Search stock symbol..."
              disabled={isPending}
            />
            {companyName && (
              <p className="text-sm text-muted-foreground">
                {companyName}
              </p>
            )}
            {!companyName && (
              <p className="text-sm text-muted-foreground">
                Search for a stock or ETF symbol.
              </p>
            )}
          </div>

          {/* Target Prices */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetPriceRealistic">Realistic Target *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="targetPriceRealistic"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="150.00"
                  value={targetPriceRealistic}
                  onChange={(e) => setTargetPriceRealistic(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your primary price target.
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
                  placeholder="175.00"
                  value={targetPriceReach}
                  onChange={(e) => setTargetPriceReach(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Optimistic stretch goal.
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

          {/* Aim Type */}
          <div className="space-y-2">
            <Label htmlFor="aimType">Aim Type *</Label>
            <Select
              value={aimType}
              onValueChange={(value: AimType) => setAimType(value)}
              disabled={isPending}
            >
              <SelectTrigger id="aimType">
                <SelectValue placeholder="Select aim type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="playable">
                  <div className="flex flex-col">
                    <span className="font-medium">Playable</span>
                    <span className="text-xs text-muted-foreground">
                      Intend to trade this (fire shots)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="monitor">
                  <div className="flex flex-col">
                    <span className="font-medium">Monitor</span>
                    <span className="text-xs text-muted-foreground">
                      Just tracking the prediction (no trades)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {aimType === "playable"
                ? "You plan to execute trades for this aim."
                : "Track this prediction without placing trades."}
            </p>
          </div>

          {/* Investment Direction */}
          <div className="space-y-2">
            <Label htmlFor="investmentDirection">Direction *</Label>
            <Select
              value={investmentDirection}
              onValueChange={(value: InvestmentDirection) => setInvestmentDirection(value)}
              disabled={isPending}
            >
              <SelectTrigger id="investmentDirection">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">
                  <div className="flex flex-col">
                    <span className="font-medium">📈 Long (Up)</span>
                    <span className="text-xs text-muted-foreground">
                      Betting price will increase
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="short">
                  <div className="flex flex-col">
                    <span className="font-medium">📉 Short (Down)</span>
                    <span className="text-xs text-muted-foreground">
                      Betting price will decrease (puts, short sales)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {investmentDirection === "long"
                ? "Target price should be ABOVE current price. Profit when price goes UP."
                : "Target price should be BELOW current price. Profit when price goes DOWN."}
            </p>
          </div>

          {/* Trading Discipline Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Risk Management</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Define your exit strategy before entering the trade.
            </p>

            {/* Stop Loss and Take Profit */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
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
                    placeholder={investmentDirection === "long" ? "140.00" : "160.00"}
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {investmentDirection === "long"
                    ? "Price BELOW entry where you'd exit to limit losses."
                    : "Price ABOVE entry where you'd exit to limit losses (shorts lose when price rises)."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfitPrice">Take Profit Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="takeProfitPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={investmentDirection === "long" ? "175.00" : "125.00"}
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {investmentDirection === "long"
                    ? "Price ABOVE entry where you'd lock in profits."
                    : "Price BELOW entry where you'd lock in profits (shorts profit when price falls)."}
                </p>
              </div>
            </div>

            {/* Exit Conditions */}
            <div className="space-y-2">
              <Label htmlFor="exitConditions">Exit Conditions</Label>
              <Textarea
                id="exitConditions"
                placeholder="Describe additional exit conditions beyond price targets. e.g., 'Exit if earnings miss by more than 10%', 'Close if volume drops significantly'..."
                value={exitConditions}
                onChange={(e) => setExitConditions(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                What other conditions would trigger an exit? Think beyond just price.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={
                isPending ||
                !symbol ||
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
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Aim"
              ) : (
                "Create Aim"
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
  );
}
