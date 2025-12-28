"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolSearchInput } from "@/components/ui/symbol-search-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { addToWatchlist } from "@/app/actions/watchlist";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { SymbolSearchResult } from "@/app/actions/symbols";

export function AddToWatchlistForm() {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [symbolData, setSymbolData] = useState<SymbolSearchResult | undefined>();
  const [notes, setNotes] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSymbolChange = (value: string, result?: SymbolSearchResult) => {
    setSymbol(value);
    setSymbolData(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim()) {
      toast.error("Please enter a symbol");
      return;
    }

    startTransition(async () => {
      const result = await addToWatchlist({
        symbol: symbol.trim().toUpperCase(),
        notes: notes.trim() || undefined,
        alertPrice: alertPrice ? parseFloat(alertPrice) : undefined,
      });

      if (result.success) {
        toast.success(`${symbol.toUpperCase()} added to watchlist`);
        setSymbol("");
        setSymbolData(undefined);
        setNotes("");
        setAlertPrice("");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to add to watchlist");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setSymbol("");
      setSymbolData(undefined);
      setNotes("");
      setAlertPrice("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Symbol
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add to Watchlist</SheetTitle>
          <SheetDescription>
            Search for a symbol to add to your watchlist. You can also set notes
            and a price alert.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <SymbolSearchInput
              value={symbol}
              onChange={handleSymbolChange}
              placeholder="Search for a symbol..."
              disabled={isPending}
            />
            {symbolData && (
              <p className="text-sm text-muted-foreground">
                {symbolData.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you watching this symbol?"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertPrice">Alert Price (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="alertPrice"
                type="number"
                step="0.01"
                min="0"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                disabled={isPending}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a target price to be notified when the symbol reaches it.
            </p>
          </div>

          <SheetFooter className="gap-2 sm:gap-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending || !symbol.trim()}>
              {isPending ? "Adding..." : "Add to Watchlist"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
