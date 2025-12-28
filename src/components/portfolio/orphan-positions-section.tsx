"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdoptPositionDialog } from "./adopt-position-dialog";
import type { OrphanPosition } from "@/app/actions/orphan-positions";

interface OrphanPositionsSectionProps {
  orphanPositions: OrphanPosition[];
  onAdoptSuccess?: () => void;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatPercent(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num >= 0 ? "+" : ""}${(num * 100).toFixed(2)}%`;
}

function OrphanPositionCard({
  position,
  onAdopt,
}: {
  position: OrphanPosition;
  onAdopt: () => void;
}) {
  const unrealizedPL = parseFloat(position.unrealizedPL);
  const isProfit = unrealizedPL >= 0;

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              Untracked
            </Badge>
            <div>
              <span className="text-lg font-bold">{position.symbol}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {parseFloat(position.qty).toFixed(0)} shares
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">Market Value</p>
              <p className="font-semibold">{formatCurrency(position.marketValue)}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-muted-foreground">Avg Entry</p>
              <p className="font-semibold">{formatCurrency(position.avgEntryPrice)}</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="font-semibold">{formatCurrency(position.currentPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">P/L</p>
              <p className={`font-semibold ${isProfit ? "text-gain" : "text-loss"}`}>
                {formatCurrency(position.unrealizedPL)}
                <span className="text-xs ml-1 hidden sm:inline">
                  ({formatPercent(position.unrealizedPLPercent)})
                </span>
              </p>
            </div>
            <Button variant="default" size="sm" onClick={onAdopt}>
              Adopt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrphanPositionsSection({
  orphanPositions,
  onAdoptSuccess,
}: OrphanPositionsSectionProps) {
  const [selectedPosition, setSelectedPosition] = useState<OrphanPosition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdopt = (position: OrphanPosition) => {
    setSelectedPosition(position);
    setDialogOpen(true);
  };

  const handleAdoptSuccess = () => {
    setSelectedPosition(null);
    if (onAdoptSuccess) {
      onAdoptSuccess();
    }
  };

  if (orphanPositions.length === 0) {
    return null;
  }

  const totalMarketValue = orphanPositions.reduce(
    (sum, p) => sum + parseFloat(p.marketValue),
    0
  );

  return (
    <>
      <div className="space-y-4">
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600">Untracked Positions Detected</AlertTitle>
          <AlertDescription className="text-amber-600/80">
            You have {orphanPositions.length} position{orphanPositions.length > 1 ? "s" : ""}{" "}
            in Alpaca ({formatCurrency(totalMarketValue)}) that {orphanPositions.length > 1 ? "are" : "is"} not being tracked
            in Outvestments. Adopt {orphanPositions.length > 1 ? "them" : "it"} to start tracking performance
            and setting targets.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Untracked Positions</CardTitle>
                <CardDescription>
                  Positions in your Alpaca account not linked to any Target/Aim/Shot
                </CardDescription>
              </div>
              <Badge variant="secondary">{orphanPositions.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {orphanPositions.map((position) => (
              <OrphanPositionCard
                key={position.symbol}
                position={position}
                onAdopt={() => handleAdopt(position)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <AdoptPositionDialog
        position={selectedPosition}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleAdoptSuccess}
      />
    </>
  );
}
