import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { db } from "@/lib/db";
import { alpacaCredentials } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Settings - Outvestments",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has Alpaca credentials stored
  let hasAlpacaCredentials = false;
  if (session.user.dbId) {
    try {
      const creds = await db
        .select({ id: alpacaCredentials.id })
        .from(alpacaCredentials)
        .where(eq(alpacaCredentials.userId, session.user.dbId))
        .limit(1);
      hasAlpacaCredentials = creds.length > 0;
    } catch {
      // Ignore errors, default to false
    }
  }

  return (
    <div className="container max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <SettingsForm
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role,
          groups: session.user.groups,
        }}
        expiresAt={session.expiresAt}
        hasAlpacaCredentials={hasAlpacaCredentials}
      />
    </div>
  );
}
