import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims, shots } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
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
import { hasPermission } from "@/lib/auth/rbac";
import { AimActions } from "./aim-actions";
import { ShotActions } from "./shot-actions";

export const metadata = {
  title: "Aim Details - Outvestments",
  description: "View aim details and associated shots",
};

const STATE_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  armed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  fired: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const DIRECTION_COLORS: Record<string, string> = {
  buy: "text-gain",
  sell: "text-loss",
};

export default async function AimDetailPage({
  params,
}: {
  params: Promise<{ id: string; aimId: string }>;
}) {
  const { id, aimId } = await params;
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Fetch target to verify ownership
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

  // Fetch aim
  const [aim] = await db
    .select()
    .from(aims)
    .where(
      and(
        eq(aims.id, aimId),
        eq(aims.targetId, id),
        isNull(aims.deletedAt)
      )
    )
    .limit(1);

  if (!aim) {
    notFound();
  }

  // Fetch shots for this aim
  const aimShots = await db
    .select()
    .from(shots)
    .where(and(eq(shots.aimId, aimId), isNull(shots.deletedAt)))
    .orderBy(desc(shots.createdAt));

  const canCreateShot = hasPermission(session.user.role, "CREATE_SHOT");

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
            <Link href={`/targets/${id}`} className="hover:text-foreground">
              {target.thesis.length > 20
                ? target.thesis.substring(0, 20) + "..."
                : target.thesis}
            </Link>
            <span>/</span>
            <span>{aim.symbol}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{aim.symbol}</h1>
          <p className="text-muted-foreground">
            Target Date:{" "}
            {new Date(aim.targetDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <AimActions aim={aim} targetId={id} />
      </div>

      {/* Aim Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Price Targets</CardTitle>
          <CardDescription>
            Target prices set for this symbol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Realistic Target
              </p>
              <p className="text-2xl font-bold text-gain">
                ${Number(aim.targetPriceRealistic).toFixed(2)}
              </p>
            </div>
            {aim.targetPriceReach && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Reach Target
                </p>
                <p className="text-2xl font-bold text-gold">
                  ${Number(aim.targetPriceReach).toFixed(2)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Days Remaining
              </p>
              <p className="text-2xl font-bold">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(aim.targetDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      <Separator />

      {/* Shots Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shots ({aimShots.length})</h2>
          {canCreateShot && (
            <Link href={`/targets/${id}/aims/${aimId}/shots/new`}>
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
                Create Shot
              </Button>
            </Link>
          )}
        </div>

        {aimShots.length === 0 ? (
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
                <line x1="22" x2="18" y1="12" y2="12" />
                <line x1="6" x2="2" y1="12" y2="12" />
                <line x1="12" x2="12" y1="6" y2="2" />
                <line x1="12" x2="12" y1="22" y2="18" />
              </svg>
              <h3 className="font-semibold">No shots yet</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 max-w-sm">
                Create shots to execute trades based on this aim&apos;s price targets.
              </p>
              {canCreateShot && (
                <Link
                  href={`/targets/${id}/aims/${aimId}/shots/new`}
                  className="mt-4"
                >
                  <Button size="sm">Create Your First Shot</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {aimShots.map((shot) => (
              <Card key={shot.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span
                          className={`text-lg font-bold ${
                            DIRECTION_COLORS[shot.direction]
                          }`}
                        >
                          {shot.direction.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {shot.triggerType} | {shot.shotType}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          @ ${Number(shot.entryPrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(shot.entryDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {shot.positionSize && (
                        <>
                          <Separator orientation="vertical" className="h-10" />
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              ${Number(shot.positionSize).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Position
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATE_COLORS[shot.state]}>
                        {shot.state}
                      </Badge>
                      <ShotActions shot={shot} symbol={aim.symbol} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
