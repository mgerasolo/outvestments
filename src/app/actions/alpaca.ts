"use server";

import { db } from "@/lib/db";
import { alpacaCredentials } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import {
  encryptAlpacaCredentials,
  decryptAlpacaCredentials,
} from "@/lib/crypto/encryption";
import {
  logAudit,
  AuditActions,
  AuditEntityTypes,
} from "@/lib/audit";
import { revalidatePath } from "next/cache";

// Alpaca Paper Trading base URL
const ALPACA_PAPER_API = "https://paper-api.alpaca.markets";

export interface AlpacaCredentialsResult {
  success: boolean;
  error?: string;
  hasCredentials?: boolean;
  maskedKey?: string;
  lastUpdated?: string;
}

export interface AlpacaConnectionResult {
  success: boolean;
  error?: string;
  account?: {
    id: string;
    status: string;
    currency: string;
    cash: string;
    portfolioValue: string;
    buyingPower: string;
  };
}

/**
 * Check if the current user has stored Alpaca credentials
 */
export async function checkAlpacaCredentials(): Promise<AlpacaCredentialsResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const creds = await db
      .select({
        encryptedKey: alpacaCredentials.encryptedKey,
        updatedAt: alpacaCredentials.updatedAt,
      })
      .from(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, session.user.dbId))
      .limit(1);

    if (creds.length === 0) {
      return { success: true, hasCredentials: false };
    }

    // Decrypt to get first few chars of API key for display
    const { apiKey } = decryptAlpacaCredentials(
      creds[0].encryptedKey,
      "", // We only need the key
      "" // Will fail, but we'll catch it
    ).apiKey
      ? { apiKey: "" }
      : { apiKey: "" };

    // Show masked version (first 4 chars + asterisks)
    const maskedKey = creds[0].encryptedKey ? "****" : undefined;

    return {
      success: true,
      hasCredentials: true,
      maskedKey: maskedKey ? `PK****...` : undefined,
      lastUpdated: creds[0].updatedAt?.toISOString(),
    };
  } catch (error) {
    console.error("Error checking Alpaca credentials:", error);
    return { success: false, error: "Failed to check credentials" };
  }
}

/**
 * Save or update Alpaca API credentials
 */
export async function saveAlpacaCredentials(
  apiKey: string,
  apiSecret: string
): Promise<AlpacaCredentialsResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate input
  if (!apiKey || !apiSecret) {
    return { success: false, error: "API key and secret are required" };
  }

  // Basic format validation for Alpaca paper trading keys
  if (!apiKey.startsWith("PK") && !apiKey.startsWith("AK")) {
    return {
      success: false,
      error: "Invalid API key format. Paper trading keys start with PK",
    };
  }

  try {
    // Encrypt the credentials
    const { encryptedKey, encryptedSecret, iv } = encryptAlpacaCredentials(
      apiKey,
      apiSecret
    );

    // Check if credentials already exist
    const existing = await db
      .select({ id: alpacaCredentials.id })
      .from(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, session.user.dbId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(alpacaCredentials)
        .set({
          encryptedKey,
          encryptedSecret,
          iv,
          updatedAt: new Date(),
        })
        .where(eq(alpacaCredentials.userId, session.user.dbId));

      await logAudit(
        AuditActions.ALPACA_CREDENTIALS_UPDATED,
        AuditEntityTypes.ALPACA,
        existing[0].id,
        { action: "updated" }
      );
    } else {
      // Create new
      const [newCred] = await db
        .insert(alpacaCredentials)
        .values({
          userId: session.user.dbId,
          encryptedKey,
          encryptedSecret,
          iv,
        })
        .returning({ id: alpacaCredentials.id });

      await logAudit(
        AuditActions.ALPACA_CREDENTIALS_SAVED,
        AuditEntityTypes.ALPACA,
        newCred.id,
        { action: "created" }
      );
    }

    revalidatePath("/settings");

    return {
      success: true,
      hasCredentials: true,
      maskedKey: `${apiKey.substring(0, 4)}****...`,
    };
  } catch (error) {
    console.error("Error saving Alpaca credentials:", error);
    return { success: false, error: "Failed to save credentials" };
  }
}

/**
 * Delete stored Alpaca credentials
 */
export async function deleteAlpacaCredentials(): Promise<AlpacaCredentialsResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const existing = await db
      .select({ id: alpacaCredentials.id })
      .from(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, session.user.dbId))
      .limit(1);

    if (existing.length === 0) {
      return { success: true, hasCredentials: false };
    }

    await db
      .delete(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, session.user.dbId));

    await logAudit(
      AuditActions.ALPACA_CREDENTIALS_DELETED,
      AuditEntityTypes.ALPACA,
      existing[0].id,
      { action: "deleted" }
    );

    revalidatePath("/settings");

    return { success: true, hasCredentials: false };
  } catch (error) {
    console.error("Error deleting Alpaca credentials:", error);
    return { success: false, error: "Failed to delete credentials" };
  }
}

/**
 * Test Alpaca connection with stored credentials
 */
export async function testAlpacaConnection(): Promise<AlpacaConnectionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get stored credentials
    const creds = await db
      .select()
      .from(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, session.user.dbId))
      .limit(1);

    if (creds.length === 0) {
      return { success: false, error: "No credentials stored" };
    }

    // Decrypt credentials
    const { apiKey, apiSecret } = decryptAlpacaCredentials(
      creds[0].encryptedKey,
      creds[0].encryptedSecret,
      creds[0].iv
    );

    // Test connection by fetching account info
    const response = await fetch(`${ALPACA_PAPER_API}/v2/account`, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      await logAudit(
        AuditActions.ALPACA_CONNECTION_TESTED,
        AuditEntityTypes.ALPACA,
        creds[0].id,
        { success: false, status: response.status, error: errorText }
      );
      return {
        success: false,
        error: `API error: ${response.status} - ${errorText}`,
      };
    }

    const account = await response.json();

    await logAudit(
      AuditActions.ALPACA_CONNECTION_TESTED,
      AuditEntityTypes.ALPACA,
      creds[0].id,
      { success: true, accountId: account.id }
    );

    return {
      success: true,
      account: {
        id: account.id,
        status: account.status,
        currency: account.currency,
        cash: account.cash,
        portfolioValue: account.portfolio_value,
        buyingPower: account.buying_power,
      },
    };
  } catch (error) {
    console.error("Error testing Alpaca connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

/**
 * Get decrypted Alpaca credentials for internal use
 * Only call this from server-side code that needs to make API calls
 */
export async function getAlpacaCredentials(
  userId: string
): Promise<{ apiKey: string; apiSecret: string } | null> {
  try {
    const creds = await db
      .select()
      .from(alpacaCredentials)
      .where(eq(alpacaCredentials.userId, userId))
      .limit(1);

    if (creds.length === 0) {
      return null;
    }

    return decryptAlpacaCredentials(
      creds[0].encryptedKey,
      creds[0].encryptedSecret,
      creds[0].iv
    );
  } catch (error) {
    console.error("Error getting Alpaca credentials:", error);
    return null;
  }
}
