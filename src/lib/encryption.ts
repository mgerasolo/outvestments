import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;

/**
 * Derives an encryption key from the environment secret using scrypt
 */
function deriveKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64-encoded string containing salt:iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Combine salt:iv:authTag:ciphertext
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, "hex"),
  ]);

  return combined.toString("base64");
}

/**
 * Decrypts data encrypted with the encrypt function
 */
export function decrypt(encryptedData: string): string {
  const combined = Buffer.from(encryptedData, "base64");

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const ciphertext = combined.subarray(
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );

  const key = deriveKey(salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext.toString("hex"), "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypts Alpaca API credentials
 */
export function encryptAlpacaCredentials(
  apiKey: string,
  apiSecret: string
): { encryptedKey: string; encryptedSecret: string } {
  return {
    encryptedKey: encrypt(apiKey),
    encryptedSecret: encrypt(apiSecret),
  };
}

/**
 * Decrypts Alpaca API credentials
 */
export function decryptAlpacaCredentials(
  encryptedKey: string,
  encryptedSecret: string
): { apiKey: string; apiSecret: string } {
  return {
    apiKey: decrypt(encryptedKey),
    apiSecret: decrypt(encryptedSecret),
  };
}
