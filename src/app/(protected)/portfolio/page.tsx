import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getAlpacaPortfolio,
  type AlpacaPosition,
  type AlpacaOrderInfo,
} from "@/app/actions/alpaca";
import { getPortfolioHistory } from "@/app/actions/account";
import { detectOrphanPositions } from "@/app/actions/orphan-positions";
import { PortfolioHistoryChart } from "./portfolio-history-chart";
import { PortfolioOrphansWrapper } from "@/components/portfolio/portfolio-orphans-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Portfolio - Outvestments",
  description: "View your Alpaca paper trading portfolio",
};

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatPercent(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}

function PositionCard({ position }: { position: AlpacaPosition }) {
  const unrealizedPL = parseFloat(position.unrealized_pl);
  const isProfit = unrealizedPL >= 0;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-lg font-bold">{position.symbol}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {parseFloat(position.qty).toFixed(0)} shares
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-sm text-muted-foreground">Market Value</p>
              <p className="font-semibold">{formatCurrency(position.market_value)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Entry</p>
              <p className="font-semibold">{formatCurrency(position.avg_entry_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="font-semibold">{formatCurrency(position.current_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unrealized P/L</p>
              <p className={`font-semibold ${isProfit ? "text-gain" : "text-loss"}`}>
                {formatCurrency(position.unrealized_pl)}
                <span className="text-xs ml-1">
                  ({formatPercent(parseFloat(position.unrealized_plpc) * 100)})
                </span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({ order }: { order: AlpacaOrderInfo }) {
  const isBuy = order.side === "buy";

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant={isBuy ? "default" : "destructive"}>
              {order.side.toUpperCase()}
            </Badge>
            <div>
              <span className="text-lg font-bold">{order.symbol}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {order.qty} shares ({order.type})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            {order.limit_price && (
              <div>
                <p className="text-sm text-muted-foreground">Limit Price</p>
                <p className="font-semibold">{formatCurrency(order.limit_price)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Filled</p>
              <p className="font-semibold">
                {order.filled_qty} / {order.qty}
              </p>
            </div>
            <Badge variant="outline">{order.status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PortfolioPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  const [portfolio, historyResult, orphansResult] = await Promise.all([
    getAlpacaPortfolio(),
    getPortfolioHistory(30),
    detectOrphanPositions(),
  ]);

  if (!portfolio.success) {
    return (
      <div className="container max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        </div>

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
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Connect Your Alpaca Account</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {portfolio.error || "Configure your Alpaca API credentials to view your portfolio."}
            </p>
            <Link href="/settings">
              <Button>Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { account, positions, orders } = portfolio;
  const dayPL = parseFloat(account?.dayPL || "0");
  const dayPLPercent = parseFloat(account?.dayPLPercent || "0");
  const isDayProfit = dayPL >= 0;

  return (
    <div className="container max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Alpaca Paper Trading Account
          </p>
        </div>
        <Badge
          variant={account?.status === "ACTIVE" ? "default" : "secondary"}
        >
          {account?.status || "Unknown"}
        </Badge>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio Value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(account?.portfolioValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today&apos;s P/L</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isDayProfit ? "text-gain" : "text-loss"}`}>
              {formatCurrency(dayPL)}
              <span className="text-sm ml-1">
                ({formatPercent(dayPLPercent)})
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cash</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(account?.cash || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Buying Power</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(account?.buyingPower || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio History Chart */}
      {historyResult.success && historyResult.data && (
        <PortfolioHistoryChart data={historyResult.data} />
      )}

      {/* Orphan Positions Alert */}
      {orphansResult.success && orphansResult.orphanPositions && orphansResult.orphanPositions.length > 0 && (
        <PortfolioOrphansWrapper orphanPositions={orphansResult.orphanPositions} />
      )}

      <Separator />

      {/* Positions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Positions ({positions?.length || 0})
        </h2>

        {!positions || positions.length === 0 ? (
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
                <circle cx="12" cy="12" r="10" />
                <line x1="8" x2="16" y1="12" y2="12" />
              </svg>
              <h3 className="font-semibold">No Open Positions</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Execute trades to see your positions here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <PositionCard key={position.symbol} position={position} />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Pending Orders Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Pending Orders ({orders?.length || 0})
        </h2>

        {!orders || orders.length === 0 ? (
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3 className="font-semibold">No Pending Orders</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Limit orders waiting to be filled will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
