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
import { createAim, updateAim, type AimFormData } from "@/app/actions/aims";
import type { Aim } from "@/lib/db/schema";

interface AimFormProps {
  targetId: string;
  aim?: Aim;
  onSuccess?: () => void;
}

export function AimForm({ targetId, aim, onSuccess }: AimFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [symbol, setSymbol] = useState(aim?.symbol || "");
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

  const isEditing = !!aim;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: AimFormData = {
      targetId,
      symbol: symbol.toUpperCase(),
      targetPriceRealistic: Number(targetPriceRealistic),
      targetPriceReach: targetPriceReach ? Number(targetPriceReach) : undefined,
      targetDate: new Date(targetDate),
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateAim(aim.id, {
            symbol: formData.symbol,
            targetPriceRealistic: formData.targetPriceRealistic,
            targetPriceReach: formData.targetPriceReach,
            targetDate: formData.targetDate,
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
            <Input
              id="symbol"
              placeholder="e.g., AAPL, MSFT, TSLA"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="uppercase"
              required
              maxLength={10}
            />
            <p className="text-sm text-muted-foreground">
              The stock ticker symbol.
            </p>
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
