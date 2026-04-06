/**
 * In-memory rate limiter with per-endpoint support.
 *
 * WARNING: This works per-instance only. On serverless platforms (Vercel),
 * each cold start resets the store. For strict enforcement, replace with
 * Upstash Redis or similar persistent store. The current implementation
 * still provides reasonable protection for moderate traffic.
 */

interface Entry {
  count: number;
  resetAt: number;
}

import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "./config";

const store = new Map<string, Entry>();

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  store.forEach((val, key) => {
    if (val.resetAt <= now) store.delete(key);
  });
}

/**
 * Check rate limit for a given key.
 * @param key - Unique identifier (e.g., userId, or "userId:endpoint" for per-endpoint limits)
 * @param maxRequests - Override max requests (defaults to RATE_LIMIT_MAX_REQUESTS)
 * @param windowMs - Override window (defaults to RATE_LIMIT_WINDOW_MS)
 */
export function checkRateLimit(
  key: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
