import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      dbId?: string;
      groups: string[];
      role: "admin" | "power_user" | "user" | "viewer";
    } & DefaultSession["user"];
    accessToken?: string;
    expiresAt?: number;
  }

  interface User {
    groups?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    groups?: string[];
    role?: "admin" | "power_user" | "user" | "viewer";
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    dbUserId?: string;
  }
}
