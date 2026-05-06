/**
 * Shared validation helpers.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true when the string is a valid UUID v1-v5. */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}
