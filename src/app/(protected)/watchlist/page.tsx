import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWatchlist } from "@/app/actions/watchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchlistTable } from "./watchlist-table";
import { AddToWatchlistForm } from "./add-to-watchlist-form";

export const metadata = {
  title: "Watchlist - Outvestments",
  description: "Track your favorite stocks and set price alerts",
};

export default async function WatchlistPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  const result = await getWatchlist();
  const items = result.success ? result.items || [] : [];

  return (
    <div className="container max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">
            Track symbols and set price alerts for your trading opportunities.
          </p>
        </div>
        <AddToWatchlistForm />
      </div>

      {items.length === 0 ? (
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h3 className="text-lg font-semibold">No symbols in your watchlist</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              Add symbols to your watchlist to track their prices and set
              alerts for when they reach your target price.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Watchlist</span>
              <span className="text-sm font-normal text-muted-foreground">
                {items.length} symbol{items.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WatchlistTable items={items} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
