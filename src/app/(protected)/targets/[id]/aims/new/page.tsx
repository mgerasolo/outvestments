import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hasPermission } from "@/lib/auth/rbac";
import { AimForm } from "../aim-form";

export const metadata = {
  title: "New Aim - Outvestments",
  description: "Add a new price target aim",
};

export default async function NewAimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session.user.role, "CREATE_AIM")) {
    redirect(`/targets/${id}?error=unauthorized`);
  }

  // Fetch target to verify ownership and display context
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

  return (
    <div className="container max-w-2xl space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/targets" className="hover:text-foreground">
            Targets
          </Link>
          <span>/</span>
          <Link href={`/targets/${id}`} className="hover:text-foreground">
            {target.thesis.length > 30
              ? target.thesis.substring(0, 30) + "..."
              : target.thesis}
          </Link>
          <span>/</span>
          <span>New Aim</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Add Aim</h1>
        <p className="text-muted-foreground">
          Set a specific price target for this thesis.
        </p>
      </div>

      <AimForm targetId={id} />
    </div>
  );
}
