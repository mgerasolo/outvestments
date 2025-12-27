import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims } from "@/lib/db/schema";
import { eq, and, isNull, desc, count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Targets - Outvestments",
  description: "View and manage your investment targets",
};

const TARGET_TYPE_COLORS: Record<string, string> = {
  growth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  value: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  momentum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  dividend: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  speculative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  active: { variant: "default", label: "Active" },
  watching: { variant: "secondary", label: "Watching" },
  archived: { variant: "outline", label: "Archived" },
};

export default async function TargetsPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Fetch targets with aim counts
  const userTargets = await db
    .select({
      target: targets,
      aimCount: count(aims.id),
    })
    .from(targets)
    .leftJoin(
      aims,
      and(
        eq(aims.targetId, targets.id),
        isNull(aims.deletedAt)
      )
    )
    .where(
      and(
        eq(targets.userId, session.user.dbId),
        isNull(targets.deletedAt)
      )
    )
    .groupBy(targets.id)
    .orderBy(desc(targets.createdAt));

  const activeTargets = userTargets.filter((t) => t.target.status === "active");
  const watchingTargets = userTargets.filter((t) => t.target.status === "watching");
  const archivedTargets = userTargets.filter((t) => t.target.status === "archived");

  return (
    <div className="container max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Targets</h1>
          <p className="text-muted-foreground">
            Manage your investment theses and research targets.
          </p>
        </div>
        <Link href="/targets/new">
          <Button>
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
            New Target
          </Button>
        </Link>
      </div>

      {userTargets.length === 0 ? (
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
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <h3 className="text-lg font-semibold">No targets yet</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              Create your first target to start documenting your investment
              thesis and tracking your trade ideas.
            </p>
            <Link href="/targets/new" className="mt-4">
              <Button>Create Your First Target</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Targets */}
          {activeTargets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Active Targets ({activeTargets.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeTargets.map(({ target, aimCount }) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    aimCount={aimCount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Watching Targets */}
          {watchingTargets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Watching ({watchingTargets.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {watchingTargets.map(({ target, aimCount }) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    aimCount={aimCount}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived Targets */}
          {archivedTargets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Archived ({archivedTargets.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                {archivedTargets.map(({ target, aimCount }) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    aimCount={aimCount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TargetCard({
  target,
  aimCount,
}: {
  target: typeof targets.$inferSelect;
  aimCount: number;
}) {
  const statusBadge = STATUS_BADGES[target.status] || STATUS_BADGES.active;
  const typeColor = TARGET_TYPE_COLORS[target.targetType] || "";

  return (
    <Link href={`/targets/${target.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Badge className={typeColor}>{target.targetType}</Badge>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2 mt-2">
            {target.thesis.length > 80
              ? target.thesis.substring(0, 80) + "..."
              : target.thesis}
          </CardTitle>
          {target.catalyst && (
            <CardDescription className="line-clamp-1">
              Catalyst: {target.catalyst}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {aimCount} aim{aimCount !== 1 ? "s" : ""}
            </span>
            <span>
              {new Date(target.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {(target.tags as string[])?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {(target.tags as string[]).slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {(target.tags as string[]).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(target.tags as string[]).length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
