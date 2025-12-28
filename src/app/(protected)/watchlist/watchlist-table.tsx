"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SymbolLogo } from "@/components/ui/symbol-logo";
import {
  removeFromWatchlist,
  updateWatchlistItem,
  type WatchlistItemWithPrice,
} from "@/app/actions/watchlist";
import { getSnapshots } from "@/app/actions/quotes";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Trash2,
  Bell,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  X,
  Check,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { SnapshotQuote } from "@/lib/quotes/service";

interface WatchlistTableProps {
  items: WatchlistItemWithPrice[];
}

interface EnhancedWatchlistItem extends WatchlistItemWithPrice {
  snapshot?: SnapshotQuote;
}

type SortField = "symbol" | "createdAt" | "alertPrice" | "changePercent";
type SortDirection = "asc" | "desc";

export function WatchlistTable({ items }: WatchlistTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingAlertPrice, setEditingAlertPrice] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<Map<string, SnapshotQuote>>(
    new Map()
  );

  // Fetch snapshot data on mount and when items change
  const refreshQuotes = useCallback(async () => {
    if (items.length === 0) return;

    setIsRefreshing(true);
    try {
      const symbols = items.map((item) => item.symbol);
      const result = await getSnapshots(symbols);

      if (result.success && result.snapshots) {
        const snapshotMap = new Map<string, SnapshotQuote>();
        result.snapshots.forEach((snapshot) => {
          snapshotMap.set(snapshot.symbol, snapshot);
        });
        setSnapshots(snapshotMap);
      } else if (result.error) {
        console.error("Failed to fetch snapshots:", result.error);
      }
    } catch (error) {
      console.error("Error refreshing quotes:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [items]);

  useEffect(() => {
    refreshQuotes();
  }, [refreshQuotes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Enhance items with snapshot data
  const enhancedItems: EnhancedWatchlistItem[] = items.map((item) => ({
    ...item,
    snapshot: snapshots.get(item.symbol),
  }));

  const sortedItems = [...enhancedItems].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "symbol":
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "alertPrice":
        const aAlert = a.alertPrice ? parseFloat(a.alertPrice) : 0;
        const bAlert = b.alertPrice ? parseFloat(b.alertPrice) : 0;
        comparison = aAlert - bAlert;
        break;
      case "changePercent":
        const aChange = a.snapshot?.changePercent || 0;
        const bChange = b.snapshot?.changePercent || 0;
        comparison = aChange - bChange;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await removeFromWatchlist(deleteId);
      if (result.success) {
        toast.success("Removed from watchlist");
      } else {
        toast.error(result.error || "Failed to remove from watchlist");
      }
      setDeleteId(null);
    });
  };

  const handleStartEdit = (item: EnhancedWatchlistItem) => {
    setEditingId(item.id);
    setEditingNotes(item.notes || "");
    setEditingAlertPrice(item.alertPrice || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingNotes("");
    setEditingAlertPrice("");
  };

  const handleSaveEdit = async (id: string) => {
    startTransition(async () => {
      const result = await updateWatchlistItem(id, {
        notes: editingNotes.trim() || undefined,
        alertPrice: editingAlertPrice ? parseFloat(editingAlertPrice) : null,
      });

      if (result.success) {
        toast.success("Watchlist item updated");
        setEditingId(null);
        setEditingNotes("");
        setEditingAlertPrice("");
      } else {
        toast.error(result.error || "Failed to update watchlist item");
      }
    });
  };

  const handleCreateTarget = (symbol: string) => {
    // Navigate to target creation with symbol context
    router.push(`/targets/new?symbol=${encodeURIComponent(symbol)}`);
  };

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return "-";
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(num)) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatChange = (change: number | undefined) => {
    if (change === undefined) return "-";
    const prefix = change >= 0 ? "+" : "";
    return `${prefix}${formatPrice(change)}`;
  };

  const formatPercent = (percent: number | undefined) => {
    if (percent === undefined) return "-";
    const prefix = percent >= 0 ? "+" : "";
    return `${prefix}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: number | undefined) => {
    if (volume === undefined || volume === 0) return "-";
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAlertStatus = (item: EnhancedWatchlistItem) => {
    const currentPrice = item.snapshot?.price || (item.currentPrice ? parseFloat(item.currentPrice) : null);
    if (!item.alertPrice || !currentPrice) return null;

    const alert = parseFloat(item.alertPrice);

    if (currentPrice >= alert) {
      return { triggered: true, above: true };
    }
    const percentAway = ((alert - currentPrice) / currentPrice) * 100;
    if (percentAway <= 5) {
      return { triggered: false, close: true, percentAway };
    }
    return { triggered: false, close: false, percentAway };
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshQuotes}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Quotes"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("symbol")}
                className="-ml-4 h-8 data-[state=open]:bg-accent"
              >
                Symbol
                {getSortIcon("symbol")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                onClick={() => handleSort("changePercent")}
                className="-ml-4 h-8 data-[state=open]:bg-accent"
              >
                Change
                {getSortIcon("changePercent")}
              </Button>
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell">
              Day Range
            </TableHead>
            <TableHead className="text-right hidden md:table-cell">
              Volume
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("alertPrice")}
                className="-ml-4 h-8 data-[state=open]:bg-accent"
              >
                Alert
                {getSortIcon("alertPrice")}
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell">Notes</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item) => {
            const alertStatus = getAlertStatus(item);
            const isEditing = editingId === item.id;
            const snapshot = item.snapshot;
            const isPositive = (snapshot?.changePercent || 0) >= 0;

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <SymbolLogo
                      symbol={item.symbol}
                      name={item.symbol}
                      size="sm"
                    />
                    <span className="font-semibold">{item.symbol}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatPrice(snapshot?.price || item.currentPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {snapshot ? (
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        isPositive ? "text-gain" : "text-loss"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm">
                          {formatChange(snapshot.change)}
                        </span>
                        <span className="text-xs">
                          {formatPercent(snapshot.changePercent)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right hidden lg:table-cell">
                  {snapshot ? (
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                      <span>H: {formatPrice(snapshot.dayHigh)}</span>
                      <span>L: {formatPrice(snapshot.dayLow)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono hidden md:table-cell">
                  {formatVolume(snapshot?.volume)}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingAlertPrice}
                        onChange={(e) => setEditingAlertPrice(e.target.value)}
                        className="w-24 h-8"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.alertPrice ? (
                        <>
                          <span className="font-mono text-sm">
                            {formatPrice(item.alertPrice)}
                          </span>
                          {alertStatus?.triggered && (
                            <Badge
                              variant="default"
                              className="bg-green-600 text-white"
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Hit
                            </Badge>
                          )}
                          {alertStatus?.close && !alertStatus?.triggered && (
                            <Badge variant="secondary" className="text-xs">
                              {alertStatus.percentAway?.toFixed(1)}%
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell max-w-[150px]">
                  {isEditing ? (
                    <Input
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="h-8"
                      placeholder="Add notes..."
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm truncate block">
                      {item.notes || "-"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={isPending}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCancelEdit}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleCreateTarget(item.symbol)}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Create Target
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStartEdit(item)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(item.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from watchlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the symbol from your watchlist. You can always
              add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
