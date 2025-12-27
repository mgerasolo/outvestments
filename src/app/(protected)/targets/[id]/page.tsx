import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims } from "@/lib/db/schema";
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
import { TargetActions } from "./target-actions";

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

  const typeColor = TARGET_TYPE_COLORS[target.targetType] || "";

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
        <TargetActions target={target} />
      </div>

      {/* Target Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge className={typeColor}>{target.targetType}</Badge>
              <Badge
                variant={target.status === "active" ? "default" : "secondary"}
              >
                {target.status}
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
            {targetAims.map((aim) => (
              <Link key={aim.id} href={`/targets/${id}/aims/${aim.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold">
                        {aim.symbol}
                      </CardTitle>
                      <Badge variant="outline">
                        {new Date(aim.targetDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Badge>
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
