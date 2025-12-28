import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { targets, aims, shots, auditLogs } from "@/lib/db/schema";
import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import {
  ArenaHeader,
  ArenaJumbotron,
  ArenaTicker,
  ArenaStatPanel,
  ArenaPositionGrid,
  ArenaLiveFeed,
  ArenaPlayerCard,
  ArenaActionButtons,
  ArenaBuyingPower,
  ArenaPortfolioChart,
  ArenaPaceGauge,
  defaultTickerItems,
} from "@/components/arena";
import { getAlpacaPortfolio, type AlpacaPosition } from "@/app/actions/alpaca";
import { getPortfolioHistory } from "@/app/actions/account";
import type { PaceStatus } from "@/lib/pace-tracking";

export const metadata = {
  title: "Dashboard - Outvestments",
  description: "Your paper trading command center",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] || "Trader";
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "TR";

  // Fetch stats
  const [targetStats] = await db
    .select({ count: count() })
    .from(targets)
    .where(
      and(eq(targets.userId, session.user.dbId), isNull(targets.deletedAt))
    );

  // Count aims for user's targets
  const userTargetIds = await db
    .select({ id: targets.id })
    .from(targets)
    .where(
      and(eq(targets.userId, session.user.dbId), isNull(targets.deletedAt))
    );

  const targetIdList = userTargetIds.map((t) => t.id);

  let aimCount = 0;
  let activeShots = 0;
  let pendingShots = 0;
  const closedWins = 0;
  const closedLosses = 0;

  if (targetIdList.length > 0) {
    const [aimStats] = await db
      .select({ count: count() })
      .from(aims)
      .where(
        and(
          sql`${aims.targetId} IN ${targetIdList}`,
          isNull(aims.deletedAt)
        )
      );
    aimCount = aimStats?.count || 0;

    // Get aim IDs for shot counting
    const userAimIds = await db
      .select({ id: aims.id })
      .from(aims)
      .where(
        and(
          sql`${aims.targetId} IN ${targetIdList}`,
          isNull(aims.deletedAt)
        )
      );

    const aimIdList = userAimIds.map((a) => a.id);

    if (aimIdList.length > 0) {
      const [activeShotStats] = await db
        .select({ count: count() })
        .from(shots)
        .where(
          and(
            sql`${shots.aimId} IN ${aimIdList}`,
            eq(shots.state, "active"),
            isNull(shots.deletedAt)
          )
        );
      activeShots = activeShotStats?.count || 0;

      const [pendingShotStats] = await db
        .select({ count: count() })
        .from(shots)
        .where(
          and(
            sql`${shots.aimId} IN ${aimIdList}`,
            sql`${shots.state} IN ('pending', 'armed')`,
            isNull(shots.deletedAt)
          )
        );
      pendingShots = pendingShotStats?.count || 0;
    }
  }

  // Fetch recent activity
  const recentActivity = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, session.user.dbId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(6);

  // Fetch Alpaca data
  let alpacaAccount: {
    portfolioValue: string;
    buyingPower: string;
    dayPL: string;
    dayPLPercent: string;
  } | null = null;
  let alpacaPositions: AlpacaPosition[] = [];

  try {
    const portfolioResult = await getAlpacaPortfolio();
    if (portfolioResult.success && portfolioResult.account) {
      alpacaAccount = portfolioResult.account;
    }
    if (portfolioResult.success && portfolioResult.positions) {
      alpacaPositions = portfolioResult.positions;
    }
  } catch {
    // Alpaca not configured - use defaults
  }

  // Fetch portfolio history for chart
  let portfolioHistoryData: Array<{
    date: Date | string;
    value: number;
    cashValue?: number;
    positionsValue?: number;
  }> = [];

  try {
    const historyResult = await getPortfolioHistory(30);
    if (historyResult.success && historyResult.data) {
      portfolioHistoryData = historyResult.data.map((d) => ({
        date: d.date,
        value: d.value,
        cashValue: d.cash,
        positionsValue: d.positions,
      }));
    }
  } catch {
    // History not available - will show empty state
  }

  // Calculate dashboard metrics
  const portfolioValue = alpacaAccount?.portfolioValue
    ? parseFloat(alpacaAccount.portfolioValue)
    : 100000;
  const buyingPower = alpacaAccount?.buyingPower
    ? parseFloat(alpacaAccount.buyingPower)
    : 100000;
  const deployed = portfolioValue - buyingPower;

  // Calculate today's P&L from Alpaca or positions
  const todayPnL = alpacaAccount?.dayPL
    ? parseFloat(alpacaAccount.dayPL)
    : alpacaPositions.reduce((sum, p) => sum + parseFloat(p.unrealized_pl || "0"), 0);
  const todayPnLPercent = alpacaAccount?.dayPLPercent
    ? parseFloat(alpacaAccount.dayPLPercent)
    : portfolioValue > 0 ? (todayPnL / portfolioValue) * 100 : 0;

  // Calculate total return (mock - would need entry point data)
  const totalReturn = todayPnLPercent * 5; // Placeholder multiplier
  const totalReturnDollars = todayPnL * 5;

  // NPC (S&P 500) comparison - mock data
  const npcReturn = 12.5;
  const npcReturnDollars = (portfolioValue * 0.125);

  // Alpha calculation
  const alphaGenerated = totalReturn - npcReturn;
  const alphaDollars = totalReturnDollars - npcReturnDollars;

  // Calculate win rate
  const totalClosed = closedWins + closedLosses;
  const winRate = totalClosed > 0 ? Math.round((closedWins / totalClosed) * 100) : 0;

  // Calculate pace metrics for the gauge
  // Using a target of 10% annualized return as baseline
  const targetAnnualReturn = 10; // 10% annual target
  const targetMonthlyReturn = targetAnnualReturn / 12;

  // Calculate current pace based on portfolio history or today's performance
  let currentMonthlyPace = 0;
  let paceStatus: PaceStatus = "unknown";

  if (portfolioHistoryData.length >= 2) {
    const startValue = portfolioHistoryData[0].value;
    const endValue = portfolioHistoryData[portfolioHistoryData.length - 1].value;
    const days = portfolioHistoryData.length;
    const periodReturn = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
    // Extrapolate to monthly
    currentMonthlyPace = days > 0 ? (periodReturn / days) * 30 : 0;
  } else if (todayPnLPercent !== 0) {
    // Use today's P&L extrapolated to monthly (21 trading days)
    currentMonthlyPace = todayPnLPercent * 21;
  }

  // Determine pace status
  if (targetMonthlyReturn > 0) {
    const paceRatio = currentMonthlyPace / targetMonthlyReturn;
    if (paceRatio >= 1.1) {
      paceStatus = "ahead";
    } else if (paceRatio <= 0.9) {
      paceStatus = "behind";
    } else {
      paceStatus = "on_pace";
    }
  }

  // Format positions for ArenaPositionGrid
  const formattedPositions = alpacaPositions.map((p) => ({
    symbol: p.symbol,
    quantity: parseInt(p.qty || "0"),
    returnPercent: parseFloat(p.unrealized_plpc || "0") * 100,
    returnDollars: parseFloat(p.unrealized_pl || "0"),
  }));

  // Format activity for ArenaLiveFeed
  const formatActivityMessage = (action: string, entityType: string) => {
    const entityName = entityType.toLowerCase();
    if (action.includes("CREATED")) return `Created ${entityName}`;
    if (action.includes("UPDATED")) return `Updated ${entityName}`;
    if (action.includes("DELETED")) return `Deleted ${entityName}`;
    if (action.includes("ARMED")) return `Armed shot`;
    if (action.includes("FIRED")) return `Shot fired!`;
    if (action.includes("CLOSED")) return `Position closed`;
    if (action.includes("CANCELLED")) return `Cancelled ${entityName}`;
    if (action.includes("LOGIN")) return `Logged in`;
    return action.replace(/_/g, " ").toLowerCase();
  };

  const getActivityIcon = (action: string) => {
    if (action.includes("CREATED")) return "➕";
    if (action.includes("FIRED")) return "⚡";
    if (action.includes("DELETED") || action.includes("CANCELLED")) return "🗑️";
    if (action.includes("CLOSED")) return "✅";
    if (action.includes("ARMED")) return "🎯";
    return "📋";
  };

  const getActivityType = (action: string): "gain" | "loss" | "target" | "shot" | "achievement" | "npc" => {
    if (action.includes("FIRED") || action.includes("ARMED")) return "shot";
    if (action.includes("CLOSED")) return "gain";
    return "target";
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const feedItems = recentActivity.map((log) => ({
    id: log.id,
    icon: getActivityIcon(log.action),
    title: formatActivityMessage(log.action, log.entityType),
    timestamp: formatTimeAgo(new Date(log.createdAt)),
    type: getActivityType(log.action),
  }));

  // Ticker items based on real data
  const tickerItems = alpacaPositions.length > 0
    ? alpacaPositions.slice(0, 3).map((p, i) => ({
        id: `pos-${i}`,
        icon: parseFloat(p.unrealized_pl || "0") >= 0 ? "📈" : "📉",
        text: `${p.symbol} ${parseFloat(p.unrealized_pl || "0") >= 0 ? "+" : ""}$${Math.abs(parseFloat(p.unrealized_pl || "0")).toFixed(0)}`,
        type: (parseFloat(p.unrealized_pl || "0") >= 0 ? "gain" : "loss") as "gain" | "loss",
      }))
    : defaultTickerItems;

  // Season stats for left panel
  const seasonStats = [
    { label: "WIN RATE", value: `${winRate}%`, type: winRate >= 50 ? "gain" as const : "loss" as const },
    { label: "PPD SCORE", value: "0.00%", type: "default" as const },
    { label: "RECORD", value: `${closedWins}-${closedLosses}`, subValue: "W-L" },
    { label: "STREAK", value: "🔥 0W", type: "fire" as const },
  ];

  return (
    <div className="min-h-screen space-y-3 sm:space-y-4 lg:space-y-6 pb-4 sm:pb-6 lg:pb-8">
      {/* Running Lights Top */}
      <div className="h-1 sm:h-1.5 lg:h-2 running-lights rounded-full" />

      {/* Arena Header */}
      <ArenaHeader userName={firstName} />

      {/* News Ticker */}
      <ArenaTicker items={tickerItems} />

      {/* Main Scoreboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        {/* LEFT COLUMN: Player Stats (hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-3 space-y-3 lg:space-y-4">
          <ArenaPlayerCard
            name={firstName.toUpperCase()}
            initials={initials}
            level={1}
            xp={0}
            xpToNextLevel={1000}
            rank="ROOKIE"
          />

          {/* Pace Gauge */}
          <ArenaPaceGauge
            currentPace={currentMonthlyPace}
            requiredPace={targetMonthlyReturn}
            status={paceStatus}
            title="PORTFOLIO PACE"
          />

          <ArenaStatPanel
            title="SEASON STATS"
            stats={seasonStats}
          />
        </div>

        {/* CENTER COLUMN: Main Jumbotron Scoreboard */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4 lg:space-y-6">
          <ArenaJumbotron
            todayPnL={todayPnL}
            todayPnLPercent={todayPnLPercent}
            yourReturn={totalReturn}
            yourReturnDollars={totalReturnDollars}
            npcReturn={npcReturn}
            npcReturnDollars={npcReturnDollars}
            alphaGenerated={alphaGenerated}
            alphaDollars={alphaDollars}
          />

          {/* Portfolio Performance Chart */}
          {portfolioHistoryData.length > 0 && (
            <ArenaPortfolioChart
              data={portfolioHistoryData}
              showCashSplit={true}
            />
          )}

          <ArenaPositionGrid positions={formattedPositions} />
        </div>

        {/* RIGHT COLUMN: Account & Actions */}
        <div className="lg:col-span-3 space-y-3 lg:space-y-4">
          <ArenaBuyingPower
            buyingPower={buyingPower}
            deployed={deployed}
            total={portfolioValue}
          />

          <ArenaLiveFeed items={feedItems} />

          <ArenaActionButtons />
        </div>
      </div>

      {/* Quick Stats Row (Mobile visible) */}
      <div className="lg:hidden">
        <ArenaStatPanel
          title="YOUR STATS"
          stats={[
            { label: "TARGETS", value: targetStats?.count || 0 },
            { label: "AIMS", value: aimCount },
            { label: "ACTIVE", value: activeShots },
            { label: "PENDING", value: pendingShots },
          ]}
        />
      </div>

      {/* Running Lights Bottom */}
      <div className="h-1 sm:h-1.5 lg:h-2 running-lights rounded-full" />
    </div>
  );
}
