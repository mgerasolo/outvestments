import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  logAuditSystem,
  AuditActions,
  AuditEntityTypes,
} from "@/lib/audit";

// Custom Authentik provider configuration
const authentikProvider = {
  id: "authentik",
  name: "Authentik",
  type: "oidc" as const,
  issuer: process.env.AUTHENTIK_ISSUER,
  clientId: process.env.AUTHENTIK_CLIENT_ID,
  clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
  authorization: {
    params: {
      scope: "openid email profile",
    },
  },
  profile(profile: {
    sub: string;
    email: string;
    name?: string;
    preferred_username?: string;
    groups?: string[];
  }) {
    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name || profile.preferred_username,
      image: null,
      groups: profile.groups || [],
    };
  },
};

// Determine user role based on Authentik groups
function getUserRole(groups: string[] = []): "admin" | "power_user" | "user" {
  if (groups.includes("outvestments-admins") || groups.includes("Admins")) {
    return "admin";
  }
  if (groups.includes("outvestments-power-users") || groups.includes("Power Users")) {
    return "power_user";
  }
  return "user";
}

export const authConfig: NextAuthConfig = {
  providers: [authentikProvider],
  trustHost: true,
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname === "/login";
      const isPublicRoute =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname === "/api/health";

      if (isOnLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isPublicRoute) {
        return true;
      }

      return isLoggedIn;
    },
    async signIn({ user, profile }) {
      if (!user.email || !profile?.sub) {
        return false;
      }

      try {
        // Check if user exists in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.authentikSub, profile.sub as string))
          .limit(1);

        const groups = (profile as { groups?: string[] }).groups || [];
        const role = getUserRole(groups);

        let dbUserId: string;
        const isNewUser = existingUser.length === 0;

        if (isNewUser) {
          // Create new user on first login
          const [newUser] = await db
            .insert(users)
            .values({
              authentikSub: profile.sub as string,
              email: user.email,
              name: user.name || null,
              role: role,
            })
            .returning({ id: users.id });
          dbUserId = newUser.id;
        } else {
          // Update existing user's email/name/role if changed
          await db
            .update(users)
            .set({
              email: user.email,
              name: user.name || null,
              role: role,
              updatedAt: new Date(),
            })
            .where(eq(users.authentikSub, profile.sub as string));
          dbUserId = existingUser[0].id;
        }

        // Log the login event for audit trail
        await logAuditSystem(
          dbUserId,
          AuditActions.USER_LOGGED_IN,
          AuditEntityTypes.USER,
          dbUserId,
          {
            email: user.email,
            isNewUser,
            role,
            groups,
            provider: "authentik",
          }
        );

        return true;
      } catch (error) {
        console.error("Error syncing user to database:", error);
        // Allow sign in even if DB sync fails - we can sync later
        return true;
      }
    },
    async jwt({ token, profile, account }) {
      if (account && profile) {
        // Store groups from the profile
        const groups = (profile as { groups?: string[] }).groups || [];
        token.groups = groups;
        token.role = getUserRole(groups);
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        // Get the database user ID for the token
        try {
          const dbUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.authentikSub, profile.sub as string))
            .limit(1);

          if (dbUser.length > 0) {
            token.dbUserId = dbUser[0].id;
          }
        } catch (error) {
          console.error("Error fetching user from database:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.dbId = token.dbUserId as string | undefined;
        session.user.groups = token.groups as string[];
        session.user.role = token.role as "admin" | "power_user" | "user";
        session.accessToken = token.accessToken as string;
        session.expiresAt = token.expiresAt as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 60 minutes default session
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
