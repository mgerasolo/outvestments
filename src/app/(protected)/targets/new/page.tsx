import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TargetForm } from "../target-form";
import { hasPermission } from "@/lib/auth/rbac";

export const metadata = {
  title: "New Target - Outvestments",
  description: "Create a new investment target",
};

export default async function NewTargetPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session.user.role, "CREATE_TARGET")) {
    redirect("/targets?error=unauthorized");
  }

  return (
    <div className="container max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Target</h1>
        <p className="text-muted-foreground">
          Document a new investment thesis.
        </p>
      </div>

      <TargetForm />
    </div>
  );
}
