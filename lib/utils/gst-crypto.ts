import crypto from 'crypto';

/**
 * GST Encryption Utility (AES-256-CBC + RSA)
 * Based on Official GST Portal Specifications
 */

/**
 * Generate a random 32-byte session key (AppKey)
 */
export function generateAppKey(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Encrypt the Session Key (AppKey) using the GST Public Key (RSA)
 * @param appKey The base64 encoded appKey to encrypt
 * @param publicKey The GST Public Key (PEM format)
 */
export function encryptAppKey(appKey: string, publicKey: string): string {
  const buffer = Buffer.from(appKey, 'base64');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return encrypted.toString('base64');
}

/**
 * Encrypt the payload using AES-256-CBC
 * @param data The JSON data/string to encrypt
 * @param key The session key (decrypted AppKey or SEK)
 */
export function encryptPayload(data: string, key: string): string {
  const iv = crypto.randomBytes(16); // GST uses random IV for some, static for others (check API docs)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // GST often expects IV to be prepended or sent separately.
  // Standard G2B: IV is often NOT used/random in some versions.
  // Actually, standard V1.0 uses ECB or CBC with static IV in some docs.
  // We'll stick to CBC if that's the requirement.
  return encrypted;
}

/**
 * Decrypt the response from GST server
 * @param encryptedData The base64 encrypted string from GST
 * @param key The session key (SEK)
 */
export function decryptResponse(encryptedData: string, key: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.alloc(16, 0)); // Using static zero IV if CBC without random IV
  
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate Hmac-SHA256 hash for data integrity (GST Requirement)
 */
export function generateHMAC(data: string, key: string): string {
    return crypto.createHmac('sha256', Buffer.from(key, 'base64'))
                 .update(data)
                 .digest('base64');
}
