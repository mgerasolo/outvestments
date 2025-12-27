import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims, shots, auditLogs } from "@/lib/db/schema";
import { eq, and, isNull, desc, sql, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard - Outvestments",
  description: "Your paper trading dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] || "Trader";

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
    .limit(5);

  // Fetch recent targets
  const recentTargets = await db
    .select()
    .from(targets)
    .where(
      and(
        eq(targets.userId, session.user.dbId),
        eq(targets.status, "active"),
        isNull(targets.deletedAt)
      )
    )
    .orderBy(desc(targets.createdAt))
    .limit(3);

  const getActivityIcon = (action: string) => {
    if (action.includes("CREATED")) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-green-600"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
      );
    }
    if (action.includes("FIRED")) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-blue-600"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      );
    }
    if (action.includes("DELETED") || action.includes("CANCELLED")) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-red-600"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-gray-600"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
    );
  };

  const formatActivityMessage = (action: string, entityType: string) => {
    const entityName = entityType.toLowerCase();
    if (action.includes("CREATED")) return `Created a new ${entityName}`;
    if (action.includes("UPDATED")) return `Updated ${entityName}`;
    if (action.includes("DELETED")) return `Deleted ${entityName}`;
    if (action.includes("ARMED")) return `Armed shot for execution`;
    if (action.includes("FIRED")) return `Executed a trade`;
    if (action.includes("CLOSED")) return `Closed position`;
    if (action.includes("CANCELLED")) return `Cancelled ${entityName}`;
    if (action.includes("LOGIN")) return `Logged in`;
    return action.replace(/_/g, " ").toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Your paper trading dashboard. Track your targets and shots.
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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Targets
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targetStats?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Investment theses tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aims</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aimCount}</div>
            <p className="text-xs text-muted-foreground">
              Price targets set
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Positions
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShots}</div>
            <p className="text-xs text-muted-foreground">
              Open trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Shots</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingShots}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting execution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Targets & Activity Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Targets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Targets</CardTitle>
              <CardDescription>
                Your latest investment theses
              </CardDescription>
            </div>
            <Link href="/targets">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTargets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-muted-foreground/50 mb-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  No targets yet. Create your first target to get started.
                </p>
                <Link href="/targets/new" className="mt-4">
                  <Button size="sm">Create Target</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTargets.map((target) => (
                  <Link
                    key={target.id}
                    href={`/targets/${target.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{target.thesis}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {target.targetType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(target.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-muted-foreground ml-2"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and trades</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-muted-foreground/50 mb-4"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start by creating a target.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 py-2 border-b last:border-0"
                  >
                    {getActivityIcon(log.action)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {formatActivityMessage(log.action, log.entityType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/targets/new" className="block">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">New Target</p>
                  <p className="text-xs text-muted-foreground">
                    Create investment thesis
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/targets" className="block">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">View Targets</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your theses
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/settings" className="block">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Configure Alpaca API
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
