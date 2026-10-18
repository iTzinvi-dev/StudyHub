/**
 * Cryptographically secure random ID generator.
 * Replaces insecure Math.random()-based ID generation flagged by CodeQL.
 * Uses Web Crypto API (available in all modern browsers).
 */

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a cryptographically secure random string of the given length.
 */
export function secureRandomString(length: number = 12): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
    }
    return result;
  }
  // Fallback: use crypto.randomUUID if available (extremely unlikely to reach here)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length);
  }
  // Last resort fallback — should never happen in modern browsers
  throw new Error('No secure random source available');
}

/**
 * Generate a secure guest user ID (replaces Math.random().toString(36).substring(2,9)).
 */
export function generateGuestId(): string {
  return 'guest_' + secureRandomString(7);
}

/**
 * Generate a secure session record ID (replaces 'sess_' + Date.now()).
 */
export function generateSessionId(): string {
  return 'sess_' + secureRandomString(10);
}

/**
 * Generate a secure generic ID with a prefix.
 */
export function generateSecureId(prefix: string): string {
  return `${prefix}_${secureRandomString(12)}`;
}
