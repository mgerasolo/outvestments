import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hasPermission } from "@/lib/auth/rbac";
import { ShotForm } from "../shot-form";

export const metadata = {
  title: "New Shot - Outvestments",
  description: "Create a new trade entry",
};

export default async function NewShotPage({
  params,
}: {
  params: Promise<{ id: string; aimId: string }>;
}) {
  const { id, aimId } = await params;
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session.user.role, "CREATE_SHOT")) {
    redirect(`/targets/${id}?error=unauthorized`);
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
      and(eq(aims.id, aimId), eq(aims.targetId, id), isNull(aims.deletedAt))
    )
    .limit(1);

  if (!aim) {
    notFound();
  }

  return (
    <div className="container max-w-2xl space-y-8">
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
          <span>/</span>
          <span>New Shot</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pull the Trigger</h1>
        <p className="text-muted-foreground">
          Record a trade entry for {aim.symbol}
        </p>
      </div>

      <ShotForm targetId={id} aim={aim} />
    </div>
  );
}
