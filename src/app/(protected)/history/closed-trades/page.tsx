import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClosedShots, type ClosedShotWithContext } from "@/app/actions/shots";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Loader2, TrendingUp, TrendingDown, Target, Clock, Award, ArrowUpDown, ChevronLeft } from "lucide-react";
import { ClosedTradesTable } from "./closed-trades-table";

export const metadata = {
  title: "Closed Trades - Outvestments",
  description: "View your completed trades with scores and performance metrics",
};

// Stat card component with Arena styling
function StatCard({
  label,
  value,
  subValue,
  type = "default",
}: {
  label: string;
  value: string | number;
  subValue?: string;
  type?: "default" | "gain" | "loss" | "gold";
}) {
  const getValueClass = () => {
    switch (type) {
      case "gain":
        return "led-glow-green";
      case "loss":
        return "led-glow-red";
      case "gold":
        return "led-glow-yellow";
      default:
        return "led-glow-yellow";
    }
  };

  return (
    <div className="led-panel led-dots rounded-lg p-3 sm:p-4">
      <div className="text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={cn("display-font text-xl sm:text-2xl lg:text-3xl", getValueClass())}>
        {value}
      </div>
      {subValue && (
        <div className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{subValue}</div>
      )}
    </div>
  );
}

// Summary stats section
function SummaryStats({
  stats,
}: {
  stats: NonNullable<Awaited<ReturnType<typeof getClosedShots>>["stats"]>;
}) {
  const plType = stats.totalPL >= 0 ? "gain" : "loss";
  const avgReturnType = stats.avgReturn >= 0 ? "gain" : "loss";

  return (
    <div className="jumbotron p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-700/50 pb-3">
        <h2 className="display-font text-lg sm:text-xl led-glow-yellow">
          PERFORMANCE SUMMARY
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs uppercase">All Time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Total Trades"
          value={stats.totalTrades}
          type="gold"
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.winCount}W / ${stats.lossCount}L`}
          type={stats.winRate >= 50 ? "gain" : "loss"}
        />
        <StatCard
          label="Total P&L"
          value={`${stats.totalPL >= 0 ? "+" : ""}$${stats.totalPL.toFixed(2)}`}
          type={plType}
        />
        <StatCard
          label="Avg Return"
          value={`${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn.toFixed(2)}%`}
          type={avgReturnType}
        />
        <StatCard
          label="Best Trade"
          value={`+${stats.bestReturn.toFixed(1)}%`}
          type="gain"
        />
        <StatCard
          label="Worst Trade"
          value={`${stats.worstReturn.toFixed(1)}%`}
          type="loss"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px] uppercase">Avg Days Held</div>
            <div className="display-font text-lg led-glow-yellow">
              {stats.avgDaysHeld.toFixed(0)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px] uppercase">Avg Score</div>
            <div className="display-font text-lg led-glow-yellow">
              {stats.avgCompositeScore.toFixed(0)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-gray-400 text-[10px] uppercase">Profit Factor</div>
            <div className={cn(
              "display-font text-lg",
              stats.winCount > stats.lossCount ? "led-glow-green" : "led-glow-red"
            )}>
              {stats.lossCount > 0
                ? (stats.winCount / stats.lossCount).toFixed(2)
                : stats.winCount > 0 ? "INF" : "0.00"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component
async function ClosedTradesContent() {
  const result = await getClosedShots();

  if (!result.success || !result.shots) {
    return (
      <div className="led-panel led-dots rounded-xl p-8 text-center">
        <div className="text-red-400 display-font text-lg mb-2">Error Loading Data</div>
        <p className="text-gray-400 text-sm">{result.error || "Failed to load closed trades"}</p>
      </div>
    );
  }

  if (result.shots.length === 0) {
    return (
      <div className="led-panel led-dots rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-gray-500" />
        </div>
        <div className="display-font text-xl led-glow-yellow mb-2">No Closed Trades Yet</div>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Complete your first trade to see your performance metrics and scores here.
        </p>
        <Link
          href="/targets"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 arena-btn-primary rounded-lg text-white font-semibold"
        >
          <Target className="w-4 h-4" />
          View Targets
        </Link>
      </div>
    );
  }

  return (
    <>
      <SummaryStats stats={result.stats!} />
      <ClosedTradesTable shots={result.shots} />
    </>
  );
}

function LoadingState() {
  return (
    <div className="led-panel led-dots rounded-xl p-12 flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mb-4" />
      <div className="display-font text-lg led-glow-yellow">Loading Trades...</div>
    </div>
  );
}

export default async function ClosedTradesPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <Link
            href="/history"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-300 text-sm mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to History
          </Link>
          <div className="led-panel led-dots rounded-xl p-4 sm:p-6">
            <h1 className="display-font text-2xl sm:text-3xl lg:text-4xl led-glow-yellow mb-2">
              CLOSED TRADES
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Complete trade history with raw facts and performance scores
            </p>
          </div>
        </div>

        <Suspense fallback={<LoadingState />}>
          <ClosedTradesContent />
        </Suspense>
      </div>
    </div>
  );
}
