"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAlpacaTradeHistory,
  type AlpacaOrder,
  type TradeHistoryFilters,
} from "@/app/actions/trade-history";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";

type SortField = "symbol" | "side" | "qty" | "filled_avg_price" | "status" | "created_at" | "filled_at";
type SortDirection = "asc" | "desc";

const STATUS_BADGES: Record<string, { color: string; label: string }> = {
  new: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "New" },
  partially_filled: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", label: "Partial" },
  filled: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Filled" },
  done_for_day: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Done" },
  canceled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Canceled" },
  expired: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", label: "Expired" },
  replaced: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Replaced" },
  pending_cancel: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Canceling" },
  pending_replace: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Replacing" },
  pending_new: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Pending" },
  accepted: { color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200", label: "Accepted" },
  stopped: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Stopped" },
  rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Rejected" },
  suspended: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Suspended" },
  calculated: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Calculated" },
};

const SIDE_BADGES: Record<string, { color: string; label: string }> = {
  buy: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", label: "Buy" },
  sell: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Sell" },
};

function SortableHeader({
  field,
  label,
  currentSort,
  currentDirection,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentSort === field;

  return (
    <TableHead
      className={`cursor-pointer hover:bg-muted/50 select-none ${className || ""}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <div className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );
}

export function TradeHistoryTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [orders, setOrders] = useState<AlpacaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from URL params
  const [status, setStatus] = useState<string>(searchParams.get("status") || "all");
  const [side, setSide] = useState<string>(searchParams.get("side") || "all");
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Sorting
  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get("sort") as SortField) || "created_at"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get("dir") as SortDirection) || "desc"
  );

  // Update URL with current filter state
  const updateUrl = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "1") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`/history?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters: TradeHistoryFilters = {
      status: status as TradeHistoryFilters["status"],
      side: side as TradeHistoryFilters["side"],
      symbol: symbol || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit: 500, // Fetch more to allow client-side filtering
    };

    const result = await getAlpacaTradeHistory(filters);

    if (result.success && result.orders) {
      // Apply client-side sorting
      const sortedOrders = [...result.orders].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case "symbol":
            comparison = a.symbol.localeCompare(b.symbol);
            break;
          case "side":
            comparison = a.side.localeCompare(b.side);
            break;
          case "qty":
            comparison = parseFloat(a.qty) - parseFloat(b.qty);
            break;
          case "filled_avg_price":
            const priceA = parseFloat(a.filled_avg_price || "0");
            const priceB = parseFloat(b.filled_avg_price || "0");
            comparison = priceA - priceB;
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "created_at":
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case "filled_at":
            const filledA = a.filled_at ? new Date(a.filled_at).getTime() : 0;
            const filledB = b.filled_at ? new Date(b.filled_at).getTime() : 0;
            comparison = filledA - filledB;
            break;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });

      setOrders(sortedOrders);
      setTotalCount(result.totalCount || 0);
    } else {
      setError(result.error || "Failed to fetch orders");
      setOrders([]);
    }

    setLoading(false);
  }, [status, side, symbol, startDate, endDate, page, sortField, sortDirection]);

  // Initial fetch and on filter change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
      updateUrl({ sort: field, dir: newDirection });
    } else {
      setSortField(field);
      setSortDirection("desc");
      updateUrl({ sort: field, dir: "desc" });
    }
  };

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    updateUrl({ status: value, page: "1" });
  };

  const handleSideChange = (value: string) => {
    setSide(value);
    setPage(1);
    updateUrl({ side: value, page: "1" });
  };

  const handleSymbolChange = (value: string) => {
    setSymbol(value);
    setPage(1);
    updateUrl({ symbol: value, page: "1" });
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
      updateUrl({ startDate: value, page: "1" });
    } else {
      setEndDate(value);
      updateUrl({ endDate: value, page: "1" });
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage.toString() });
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const clearFilters = () => {
    setStatus("all");
    setSide("all");
    setSymbol("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    router.replace("/history", { scroll: false });
  };

  const hasActiveFilters =
    status !== "all" || side !== "all" || symbol || startDate || endDate;

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Filter your trade history</CardDescription>
            </div>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Side Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Side</label>
              <Select value={side} onValueChange={handleSideChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All sides" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Symbol Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Symbol</label>
              <Input
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alpaca Trade History</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading orders..."
                  : `${totalCount} order${totalCount !== 1 ? "s" : ""} found`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-muted-foreground mb-4"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Error Loading History</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
              <Button variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-muted-foreground mb-4"
              >
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "Execute some trades in Alpaca to see them here."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader
                      field="symbol"
                      label="Symbol"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      field="side"
                      label="Side"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <TableHead>Type</TableHead>
                    <SortableHeader
                      field="qty"
                      label="Qty"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="text-right"
                    />
                    <SortableHeader
                      field="filled_avg_price"
                      label="Fill Price"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      className="text-right"
                    />
                    <TableHead className="text-right">Total Value</TableHead>
                    <SortableHeader
                      field="status"
                      label="Status"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      field="created_at"
                      label="Created"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      field="filled_at"
                      label="Filled"
                      currentSort={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const statusBadge = STATUS_BADGES[order.status] || {
                      color: "bg-gray-100 text-gray-800",
                      label: order.status,
                    };
                    const sideBadge = SIDE_BADGES[order.side] || {
                      color: "bg-gray-100 text-gray-800",
                      label: order.side,
                    };
                    const filledQty = parseFloat(order.filled_qty);
                    const fillPrice = order.filled_avg_price
                      ? parseFloat(order.filled_avg_price)
                      : null;
                    const totalValue = fillPrice ? filledQty * fillPrice : null;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.symbol}</TableCell>
                        <TableCell>
                          <Badge className={sideBadge.color}>{sideBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{order.type}</TableCell>
                        <TableCell className="text-right">
                          {filledQty > 0 ? (
                            <>
                              {filledQty.toFixed(filledQty % 1 === 0 ? 0 : 2)}
                              {parseFloat(order.qty) !== filledQty && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  /{parseFloat(order.qty).toFixed(0)}
                                </span>
                              )}
                            </>
                          ) : (
                            parseFloat(order.qty).toFixed(parseFloat(order.qty) % 1 === 0 ? 0 : 2)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {fillPrice ? `$${fillPrice.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {totalValue ? `$${totalValue.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.filled_at
                            ? new Date(order.filled_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalCount)} of {totalCount} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
