// src/core/utils/hash.ts
import crypto from 'crypto';

/**
 * Generates a SHA-256 hex digest for strings or binary buffers.
 * Used for photo deduplication and cached AI comparison keys.
 */
export function sha256(input: string | Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
