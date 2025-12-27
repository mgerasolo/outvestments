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
import { Badge } from "@/components/ui/badge";
import { createShot, type ShotFormData } from "@/app/actions/shots";
import type { Aim, Direction, TriggerType, ShotType } from "@/lib/db/schema";

interface ShotFormProps {
  targetId: string;
  aim: Aim;
  onSuccess?: () => void;
}

const DIRECTIONS: { value: Direction; label: string; color: string }[] = [
  { value: "buy", label: "Buy (Long)", color: "text-green-600" },
  { value: "sell", label: "Sell (Short)", color: "text-red-600" },
];

const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
  { value: "market", label: "Market", description: "Execute at current market price" },
  { value: "limit", label: "Limit", description: "Execute only at specified price" },
];

const SHOT_TYPES: { value: ShotType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "option", label: "Option" },
];

export function ShotForm({ targetId, aim, onSuccess }: ShotFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [direction, setDirection] = useState<Direction>("buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [positionSize, setPositionSize] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("market");
  const [shotType, setShotType] = useState<ShotType>("stock");

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
    };

    startTransition(async () => {
      const result = await createShot(formData);

      if (result.success) {
        toast.success("Shot created");
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pull the Trigger</CardTitle>
            <CardDescription>
              Create a trade entry for {aim.symbol}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            {aim.symbol}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction *</Label>
            <div className="flex gap-4">
              {DIRECTIONS.map((dir) => (
                <Button
                  key={dir.value}
                  type="button"
                  variant={direction === dir.value ? "default" : "outline"}
                  className={`flex-1 ${
                    direction === dir.value
                      ? dir.value === "buy"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                  onClick={() => setDirection(dir.value)}
                >
                  {dir.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Entry Price */}
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
                placeholder={Number(aim.targetPriceRealistic).toFixed(2)}
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="pl-7"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Target: ${Number(aim.targetPriceRealistic).toFixed(2)}
              {aim.targetPriceReach &&
                ` (Reach: $${Number(aim.targetPriceReach).toFixed(2)})`}
            </p>
          </div>

          {/* Entry Date */}
          <div className="space-y-2">
            <Label htmlFor="entryDate">Entry Date *</Label>
            <Input
              id="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Position Size */}
          <div className="space-y-2">
            <Label htmlFor="positionSize">Position Size (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="positionSize"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1000.00"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Total dollar amount invested in this position.
            </p>
          </div>

          {/* Trigger Type */}
          <div className="space-y-2">
            <Label htmlFor="triggerType">Order Type *</Label>
            <Select
              value={triggerType}
              onValueChange={(value) => setTriggerType(value as TriggerType)}
            >
              <SelectTrigger id="triggerType">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((type) => (
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

          {/* Shot Type */}
          <div className="space-y-2">
            <Label htmlFor="shotType">Asset Type *</Label>
            <Select
              value={shotType}
              onValueChange={(value) => setShotType(value as ShotType)}
            >
              <SelectTrigger id="shotType">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {SHOT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isPending || !entryPrice || !entryDate}
              className={
                direction === "buy"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
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
                  Creating...
                </>
              ) : (
                `${direction === "buy" ? "Buy" : "Sell"} ${aim.symbol}`
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
