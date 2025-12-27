import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { targets } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { TargetForm } from "../../target-form";

export const metadata = {
  title: "Edit Target - Outvestments",
  description: "Edit your investment target",
};

export default async function EditTargetPage({
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

  return (
    <div className="container max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Target</h1>
        <p className="text-muted-foreground">
          Update your investment thesis and details.
        </p>
      </div>

      <TargetForm target={target} />
    </div>
  );
}
