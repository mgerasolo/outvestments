import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { targets, aims } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { AimForm } from "../../aim-form";

export const metadata = {
  title: "Edit Aim - Outvestments",
  description: "Edit aim details",
};

export default async function EditAimPage({
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
          <Link
            href={`/targets/${id}/aims/${aimId}`}
            className="hover:text-foreground"
          >
            {aim.symbol}
          </Link>
          <span>/</span>
          <span>Edit</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Aim</h1>
        <p className="text-muted-foreground">
          Update the price targets for {aim.symbol}.
        </p>
      </div>

      <AimForm targetId={id} aim={aim} />
    </div>
  );
}
