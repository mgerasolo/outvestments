import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { shots, aims, targets } from "@/lib/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTable } from "./trade-history-table";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Trade History - Outvestments",
  description: "View your trading history and performance",
};

const STATE_BADGES: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Pending" },
  armed: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Armed" },
  fired: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Fired" },
  active: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Active" },
  closed: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Closed" },
};

const DIRECTION_BADGES: Record<string, { color: string; label: string }> = {
  buy: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", label: "Long" },
  sell: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Short" },
};

interface LocalShotsTableProps {
  userId: string;
}

async function LocalShotsTable({ userId }: LocalShotsTableProps) {
  // Get all user's targets first
  const userTargets = await db
    .select({ id: targets.id })
    .from(targets)
    .where(
      and(
        eq(targets.userId, userId),
        isNull(targets.deletedAt)
      )
    );

  const targetIds = userTargets.map((t) => t.id);

  if (targetIds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
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
          <h3 className="text-lg font-semibold">No shots yet</h3>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Create a target and add some shots to start tracking your trades.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get aims for those targets
  const userAims = await db
    .select()
    .from(aims)
    .where(
      and(
        inArray(aims.targetId, targetIds),
        isNull(aims.deletedAt)
      )
    );

  const aimIds = userAims.map((a) => a.id);
  const aimMap = new Map(userAims.map((a) => [a.id, a]));

  if (aimIds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
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
          <h3 className="text-lg font-semibold">No shots yet</h3>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Add some aims and shots to start tracking your trades.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get all shots for those aims
  const allShots = await db
    .select()
    .from(shots)
    .where(
      and(
        inArray(shots.aimId, aimIds),
        isNull(shots.deletedAt)
      )
    )
    .orderBy(desc(shots.createdAt));

  // Calculate stats
  const activeShots = allShots.filter((s) => s.state === "active");
  const closedShots = allShots.filter((s) => s.state === "closed");
  const pendingShots = allShots.filter((s) => s.state === "pending" || s.state === "armed");
  const firedShots = allShots.filter((s) => s.state === "fired");

  // Calculate P&L for closed shots that have fill data
  const closedWithFills = closedShots.filter((s) => s.fillPrice);
  const totalPL = closedWithFills.reduce((sum, shot) => {
    const entryPrice = Number(shot.entryPrice);
    const fillPrice = Number(shot.fillPrice);
    const qty = Number(shot.filledQty || shot.positionSize || 1);
    const pl = shot.direction === "buy"
      ? (fillPrice - entryPrice) * qty
      : (entryPrice - fillPrice) * qty;
    return sum + pl;
  }, 0);

  const winCount = closedWithFills.filter((s) => {
    const entryPrice = Number(s.entryPrice);
    const fillPrice = Number(s.fillPrice);
    const isProfit = s.direction === "buy"
      ? fillPrice > entryPrice
      : fillPrice < entryPrice;
    return isProfit;
  }).length;

  const winRate = closedWithFills.length > 0
    ? ((winCount / closedWithFills.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Positions</CardDescription>
            <CardTitle className="text-2xl">{activeShots.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Orders</CardDescription>
            <CardTitle className="text-2xl">{pendingShots.length + firedShots.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed Trades</CardDescription>
            <CardTitle className="text-2xl">{closedShots.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">{winRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total P&L</CardDescription>
            <CardTitle className={`text-2xl ${totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outvestments Shots</CardTitle>
          <CardDescription>
            Trades tracked in Outvestments with thesis and scoring context
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allShots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No shots recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Entry Price</TableHead>
                  <TableHead className="text-right">Fill Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allShots.map((shot) => {
                  const aim = aimMap.get(shot.aimId || "");
                  const stateBadge = STATE_BADGES[shot.state] || STATE_BADGES.pending;
                  const directionBadge = DIRECTION_BADGES[shot.direction] || DIRECTION_BADGES.buy;

                  // Calculate P&L
                  let pl: number | null = null;
                  if (shot.fillPrice) {
                    const entryPrice = Number(shot.entryPrice);
                    const fillPrice = Number(shot.fillPrice);
                    const qty = Number(shot.filledQty || shot.positionSize || 1);
                    pl = shot.direction === "buy"
                      ? (fillPrice - entryPrice) * qty
                      : (entryPrice - fillPrice) * qty;
                  }

                  return (
                    <TableRow key={shot.id}>
                      <TableCell className="font-medium">
                        {aim?.symbol || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={directionBadge.color}>
                          {directionBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={stateBadge.color}>
                          {stateBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(shot.entryPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {shot.fillPrice ? `$${Number(shot.fillPrice).toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {shot.filledQty || shot.positionSize || "—"}
                      </TableCell>
                      <TableCell className={`text-right ${pl !== null ? (pl >= 0 ? "text-green-600" : "text-red-600") : ""}`}>
                        {pl !== null ? `${pl >= 0 ? "+" : ""}$${pl.toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(shot.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  return (
    <div className="container max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trade History</h1>
        <p className="text-muted-foreground">
          View your complete trading history and performance across Alpaca and Outvestments.
        </p>
      </div>

      <Tabs defaultValue="alpaca" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="alpaca">Alpaca Orders</TabsTrigger>
          <TabsTrigger value="outvestments">Outvestments Shots</TabsTrigger>
        </TabsList>

        <TabsContent value="alpaca" className="space-y-6">
          <Suspense fallback={<LoadingState />}>
            <TradeHistoryTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="outvestments" className="space-y-6">
          <Suspense fallback={<LoadingState />}>
            <LocalShotsTable userId={session.user.dbId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
