import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims, shots, symbols } from "@/lib/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TargetActions } from "./target-actions";
import { TargetProgress } from "@/components/trading/target-progress";
import { SymbolLogo } from "@/components/ui/symbol-logo";
import { TrajectoryBadge } from "@/components/trading/trajectory-badge";
import { getQuotes } from "@/app/actions/quotes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "Target Details - Outvestments",
  description: "View target details and associated aims",
};

const TARGET_TYPE_COLORS: Record<string, string> = {
  growth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  value: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  momentum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  dividend: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  speculative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_BADGE_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  watching: {
    label: "Watching",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
};

const STATE_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  armed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  fired: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

function getTargetHealthStatus(
  targetShots: { state: string; fillPrice: string | null; entryPrice: string; filledQty: string | null; positionSize: string | null; direction: string }[]
): { status: "excellent" | "good" | "warning" | "danger" | "neutral"; label: string; description: string } {
  if (targetShots.length === 0) {
    return {
      status: "neutral",
      label: "No Activity",
      description: "No shots created yet",
    };
  }

  const closedShots = targetShots.filter((s) => s.state === "closed" && s.fillPrice);
  if (closedShots.length === 0) {
    const activeCount = targetShots.filter((s) => s.state === "active").length;
    const pendingCount = targetShots.filter((s) => ["pending", "armed", "fired"].includes(s.state)).length;

    if (activeCount > 0) {
      return {
        status: "good",
        label: "In Progress",
        description: `${activeCount} active, ${pendingCount} pending`,
      };
    }
    return {
      status: "neutral",
      label: "Pending",
      description: `${pendingCount} shots waiting`,
    };
  }

  // Calculate win rate from closed shots
  let wins = 0;
  let losses = 0;
  let totalPL = 0;

  for (const shot of closedShots) {
    const entryPrice = Number(shot.entryPrice);
    const fillPrice = Number(shot.fillPrice);
    const qty = Number(shot.filledQty || shot.positionSize || 1);
    const pl =
      shot.direction === "buy"
        ? (fillPrice - entryPrice) * qty
        : (entryPrice - fillPrice) * qty;
    totalPL += pl;
    if (pl >= 0) wins++;
    else losses++;
  }

  const winRate = closedShots.length > 0 ? (wins / closedShots.length) * 100 : 0;

  if (winRate >= 70 && totalPL > 0) {
    return {
      status: "excellent",
      label: "Excellent",
      description: `${winRate.toFixed(0)}% win rate`,
    };
  }
  if (winRate >= 50 && totalPL >= 0) {
    return {
      status: "good",
      label: "Good",
      description: `${winRate.toFixed(0)}% win rate`,
    };
  }
  if (winRate >= 40 || totalPL >= 0) {
    return {
      status: "warning",
      label: "Needs Attention",
      description: `${winRate.toFixed(0)}% win rate`,
    };
  }
  return {
    status: "danger",
    label: "Struggling",
    description: `${winRate.toFixed(0)}% win rate`,
  };
}

const healthStatusStyles: Record<string, string> = {
  excellent: "bg-gain/15 text-gain border-gain/30",
  good: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  warning: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 dark:text-yellow-400",
  danger: "bg-loss/15 text-loss border-loss/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

export default async function TargetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Fetch target
  const [target] = await db
    .select()
    .from(targets)
    .where(
      and(
        eq(targets.id, id),
        eq(targets.userId, session.user.dbId),
        isNull(targets.deletedAt)
      )
    )
    .limit(1);

  if (!target) {
    notFound();
  }

  // Fetch aims for this target
  const targetAims = await db
    .select()
    .from(aims)
    .where(and(eq(aims.targetId, id), isNull(aims.deletedAt)))
    .orderBy(desc(aims.createdAt));

  // Fetch all shots for this target's aims
  const aimIds = targetAims.map((a) => a.id);
  const targetShots = aimIds.length > 0
    ? await db
        .select()
        .from(shots)
        .where(and(inArray(shots.aimId, aimIds), isNull(shots.deletedAt)))
        .orderBy(desc(shots.createdAt))
    : [];

  // Fetch symbol data for logos
  const uniqueSymbols = [...new Set(targetAims.map((a) => a.symbol))];
  const symbolData = uniqueSymbols.length > 0
    ? await db
        .select()
        .from(symbols)
        .where(inArray(symbols.symbol, uniqueSymbols))
    : [];
  const symbolMap = new Map(symbolData.map((s) => [s.symbol, s]));

  // Fetch current prices for trajectory calculation
  const priceMap = new Map<string, number>();
  if (uniqueSymbols.length > 0) {
    try {
      const quotesResult = await getQuotes(uniqueSymbols);
      if (quotesResult.success && quotesResult.quotes) {
        for (const quote of quotesResult.quotes) {
          priceMap.set(quote.symbol, quote.price);
        }
      }
    } catch {
      // Quotes unavailable - trajectory badges will not show
    }
  }

  // Build entry data map for each aim (from first filled shot)
  const aimEntryDataMap = new Map<string, { entryPrice: number; entryDate: Date }>();
  for (const aim of targetAims) {
    const aimShotsFiltered = targetShots.filter(
      (s) => s.aimId === aim.id && s.state !== "pending" && s.state !== "armed" && s.fillPrice
    );
    if (aimShotsFiltered.length > 0) {
      const sortedShots = [...aimShotsFiltered].sort((a, b) => {
        const aTime = a.fillTimestamp ? new Date(a.fillTimestamp).getTime() : 0;
        const bTime = b.fillTimestamp ? new Date(b.fillTimestamp).getTime() : 0;
        return aTime - bTime;
      });
      const firstShot = sortedShots[0];
      aimEntryDataMap.set(aim.id, {
        entryPrice: parseFloat(firstShot.fillPrice!),
        entryDate: firstShot.fillTimestamp
          ? new Date(firstShot.fillTimestamp)
          : new Date(firstShot.entryDate),
      });
    }
  }

  // Create aim ID to symbol mapping for shot display
  const aimSymbolMap = new Map(targetAims.map((a) => [a.id, a.symbol]));

  // Calculate progress stats
  const progressStats = {
    totalAims: targetAims.length,
    totalShots: targetShots.length,
    pendingShots: targetShots.filter((s) => s.state === "pending" || s.state === "armed" || s.state === "fired").length,
    activeShots: targetShots.filter((s) => s.state === "active").length,
    closedShots: targetShots.filter((s) => s.state === "closed").length,
    winningShots: 0,
    losingShots: 0,
    totalPL: 0,
    totalInvested: 0,
  };

  // Calculate P&L for closed shots
  for (const shot of targetShots.filter((s) => s.state === "closed" && s.fillPrice)) {
    const entryPrice = Number(shot.entryPrice);
    const fillPrice = Number(shot.fillPrice);
    const qty = Number(shot.filledQty || shot.positionSize || 1);
    const pl =
      shot.direction === "buy"
        ? (fillPrice - entryPrice) * qty
        : (entryPrice - fillPrice) * qty;

    progressStats.totalPL += pl;
    progressStats.totalInvested += entryPrice * qty;

    if (pl >= 0) {
      progressStats.winningShots++;
    } else {
      progressStats.losingShots++;
    }
  }

  const typeColor = TARGET_TYPE_COLORS[target.targetType] || "";
  const statusStyle = STATUS_BADGE_STYLES[target.status] || STATUS_BADGE_STYLES.active;
  const healthStatus = getTargetHealthStatus(targetShots);
  const confidenceLevel = target.confidenceLevel ? Number(target.confidenceLevel) : null;

  return (
    <div className="container max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/targets" className="hover:text-foreground">
              Targets
            </Link>
            <span>/</span>
            <span>Details</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Target Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <Link href={`/targets/${id}/edit`}>
            <Button variant="outline" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              Edit
            </Button>
          </Link>
          <Link href={`/targets/${id}/aims/new`}>
            <Button size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Aim
            </Button>
          </Link>
          <TargetActions target={target} />
        </div>
      </div>

      {/* Target Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={typeColor}>{target.targetType}</Badge>
              <Badge className={statusStyle.className}>
                {statusStyle.label}
              </Badge>
              <Badge
                variant="outline"
                className={healthStatusStyles[healthStatus.status]}
                title={healthStatus.description}
              >
                {healthStatus.status === "excellent" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
                {healthStatus.status === "good" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3 w-3"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                )}
                {healthStatus.status === "warning" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3 w-3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
                )}
                {healthStatus.status === "danger" && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-3 w-3"><circle cx="12" cy="12" r="10"></circle><line x1="15" x2="9" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="15"></line></svg>
                )}
                {healthStatus.label}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              Created{" "}
              {new Date(target.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thesis */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Investment Thesis
            </h3>
            <p className="text-lg leading-relaxed">{target.thesis}</p>
          </div>

          {/* Catalyst */}
          {target.catalyst && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Catalyst
              </h3>
              <p>{target.catalyst}</p>
            </div>
          )}

          {/* Trading Discipline Section */}
          {(confidenceLevel || target.risks || target.exitTriggers) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Trading Discipline
                </h3>

                {/* Confidence Level */}
                {confidenceLevel && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence Level</span>
                      <span className="font-medium">
                        {confidenceLevel}/10
                        <span className="ml-2 text-muted-foreground text-sm">
                          {confidenceLevel <= 3 ? "(Low)" : confidenceLevel <= 6 ? "(Medium)" : "(High)"}
                        </span>
                      </span>
                    </div>
                    <Progress value={confidenceLevel * 10} className="h-2" />
                  </div>
                )}

                {/* Risks */}
                {target.risks && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-yellow-500"
                      >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <line x1="12" x2="12" y1="9" y2="13" />
                        <line x1="12" x2="12.01" y1="17" y2="17" />
                      </svg>
                      <span className="text-sm font-medium">Risks & Concerns</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                      {target.risks}
                    </p>
                  </div>
                )}

                {/* Exit Triggers */}
                {target.exitTriggers && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-red-500"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      <span className="text-sm font-medium">Exit Triggers</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                      {target.exitTriggers}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tags */}
          {(target.tags as string[])?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(target.tags as string[]).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {targetShots.length > 0 && <TargetProgress stats={progressStats} />}

      <Separator />

      {/* Aims Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Aims ({targetAims.length})
          </h2>
          <Link href={`/targets/${id}/aims/new`}>
            <Button size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Aim
            </Button>
          </Link>
        </div>

        {targetAims.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-muted-foreground mb-3"
              >
                <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              <h3 className="font-semibold">No aims yet</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-sm">
                Add specific price targets with symbols and dates to this target.
              </p>
              <Link href={`/targets/${id}/aims/new`} className="mt-4">
                <Button size="sm">Add Your First Aim</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {targetAims.map((aim) => {
              const symbolInfo = symbolMap.get(aim.symbol);
              const aimShotCount = targetShots.filter((s) => s.aimId === aim.id).length;
              const daysRemaining = Math.max(
                0,
                Math.ceil(
                  (new Date(aim.targetDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              );
              const currentPrice = priceMap.get(aim.symbol);
              const entryData = aimEntryDataMap.get(aim.id);

              return (
                <Link key={aim.id} href={`/targets/${id}/aims/${aim.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SymbolLogo
                            symbol={aim.symbol}
                            name={symbolInfo?.name}
                            logoUrl={symbolInfo?.logoUrl}
                            marketType={symbolInfo?.marketType || "stock"}
                            size="md"
                            fetchIfMissing
                          />
                          <div>
                            <CardTitle className="text-xl font-bold">
                              {aim.symbol}
                            </CardTitle>
                            {symbolInfo?.name && (
                              <CardDescription className="text-xs truncate max-w-[150px]">
                                {symbolInfo.name}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline">
                            {new Date(aim.targetDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Badge>
                          <span className={`text-xs ${daysRemaining <= 7 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                            {daysRemaining}d remaining
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Realistic Target
                          </p>
                          <p className="text-lg font-semibold text-gain">
                            ${Number(aim.targetPriceRealistic).toFixed(2)}
                          </p>
                        </div>
                        {aim.targetPriceReach && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Reach Target
                            </p>
                            <p className="text-lg font-semibold text-gold">
                              ${Number(aim.targetPriceReach).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {aimShotCount > 0 ? (
                            <span className="text-muted-foreground">
                              {aimShotCount} shot{aimShotCount !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">No shots</span>
                          )}
                          {/* Trajectory badge - only shows when we have entry data */}
                          {entryData && currentPrice && (
                            <TrajectoryBadge
                              aim={aim}
                              currentPrice={currentPrice}
                              entryPrice={entryData.entryPrice}
                              entryDate={entryData.entryDate}
                              variant="compact"
                            />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {aim.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* All Shots Summary */}
      {targetShots.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                All Shots ({targetShots.length})
              </h2>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targetShots.slice(0, 10).map((shot) => {
                      const shotSymbol = shot.aimId ? aimSymbolMap.get(shot.aimId) : null;
                      const symbolInfo = shotSymbol ? symbolMap.get(shotSymbol) : null;

                      let pl: number | null = null;
                      let plPercent: number | null = null;
                      if (shot.state === "closed" && shot.fillPrice) {
                        const entryPrice = Number(shot.entryPrice);
                        const fillPrice = Number(shot.fillPrice);
                        const qty = Number(shot.filledQty || shot.positionSize || 1);
                        pl =
                          shot.direction === "buy"
                            ? (fillPrice - entryPrice) * qty
                            : (entryPrice - fillPrice) * qty;
                        plPercent =
                          shot.direction === "buy"
                            ? ((fillPrice - entryPrice) / entryPrice) * 100
                            : ((entryPrice - fillPrice) / entryPrice) * 100;
                      }

                      return (
                        <TableRow key={shot.id}>
                          <TableCell>
                            {shotSymbol ? (
                              <div className="flex items-center gap-2">
                                <SymbolLogo
                                  symbol={shotSymbol}
                                  logoUrl={symbolInfo?.logoUrl}
                                  marketType={symbolInfo?.marketType || "stock"}
                                  size="sm"
                                />
                                <span className="font-medium">{shotSymbol}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${
                                shot.direction === "buy" ? "text-gain" : "text-loss"
                              }`}
                            >
                              {shot.direction.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            ${Number(shot.entryPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {shot.positionSize
                              ? `${Math.floor(Number(shot.positionSize))} shares`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATE_COLORS[shot.state]}>
                              {shot.state}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {pl !== null ? (
                              <div className="flex flex-col items-end">
                                <span
                                  className={`font-medium ${
                                    pl >= 0 ? "text-gain" : "text-loss"
                                  }`}
                                >
                                  {pl >= 0 ? "+" : ""}$
                                  {Math.abs(pl).toFixed(2)}
                                </span>
                                {plPercent !== null && (
                                  <span
                                    className={`text-xs ${
                                      plPercent >= 0 ? "text-gain" : "text-loss"
                                    }`}
                                  >
                                    {plPercent >= 0 ? "+" : ""}
                                    {plPercent.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {targetShots.length > 10 && (
                  <div className="p-4 border-t text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing 10 of {targetShots.length} shots. View individual aims for complete details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
