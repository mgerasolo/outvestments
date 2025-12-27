import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get the encryption key from environment variables
 * Key must be 32 bytes (256 bits) - hex encoded = 64 characters
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes (64 hex chars), got ${keyBuffer.length} bytes`
    );
  }

  return keyBuffer;
}

export interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded IV
  authTag: string; // Base64 encoded authentication tag
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Decrypt data that was encrypted with encrypt()
 * @param encryptedData - The encrypted data object
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, "base64");
  const authTag = Buffer.from(encryptedData.authTag, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypt Alpaca credentials for storage
 * Stores both key and secret with a single IV for the pair
 */
export function encryptAlpacaCredentials(
  apiKey: string,
  apiSecret: string
): { encryptedKey: string; encryptedSecret: string; iv: string } {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  // Encrypt API Key
  const cipherKey = createCipheriv(ALGORITHM, key, iv);
  let encryptedKey = cipherKey.update(apiKey, "utf8", "base64");
  encryptedKey += cipherKey.final("base64");
  const authTagKey = cipherKey.getAuthTag();

  // Encrypt API Secret
  const cipherSecret = createCipheriv(ALGORITHM, key, iv);
  let encryptedSecret = cipherSecret.update(apiSecret, "utf8", "base64");
  encryptedSecret += cipherSecret.final("base64");
  const authTagSecret = cipherSecret.getAuthTag();

  // Combine encrypted data with auth tags
  return {
    encryptedKey: `${encryptedKey}:${authTagKey.toString("base64")}`,
    encryptedSecret: `${encryptedSecret}:${authTagSecret.toString("base64")}`,
    iv: iv.toString("base64"),
  };
}

/**
 * Decrypt Alpaca credentials from storage
 */
export function decryptAlpacaCredentials(
  encryptedKey: string,
  encryptedSecret: string,
  iv: string
): { apiKey: string; apiSecret: string } {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, "base64");

  // Parse API Key
  const [encryptedKeyData, authTagKeyStr] = encryptedKey.split(":");
  const authTagKey = Buffer.from(authTagKeyStr, "base64");
  const decipherKey = createDecipheriv(ALGORITHM, key, ivBuffer);
  decipherKey.setAuthTag(authTagKey);
  let apiKey = decipherKey.update(encryptedKeyData, "base64", "utf8");
  apiKey += decipherKey.final("utf8");

  // Parse API Secret
  const [encryptedSecretData, authTagSecretStr] = encryptedSecret.split(":");
  const authTagSecret = Buffer.from(authTagSecretStr, "base64");
  const decipherSecret = createDecipheriv(ALGORITHM, key, ivBuffer);
  decipherSecret.setAuthTag(authTagSecret);
  let apiSecret = decipherSecret.update(encryptedSecretData, "base64", "utf8");
  apiSecret += decipherSecret.final("utf8");

  return { apiKey, apiSecret };
}
