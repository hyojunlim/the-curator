/**
 * Rate limiter using Upstash Redis for persistent enforcement.
 * Falls back to in-memory store if Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "./config";

// ── Upstash Redis rate limiter (persistent, works across serverless instances) ──
let redisLimiter: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  redisLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, `${Math.round(RATE_LIMIT_WINDOW_MS / 1000)} s`),
    analytics: true,
    prefix: "curator:ratelimit",
  });
}

// ── In-memory fallback (for local dev without Redis) ──
interface Entry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, Entry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function memCleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  memStore.forEach((val, key) => {
    if (val.resetAt <= now) memStore.delete(key);
  });
}

function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  memCleanup();
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ── Public API ──
export async function checkRateLimit(
  key: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // Use Upstash Redis if configured
  if (redisLimiter) {
    const result = await redisLimiter.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }

  // Fallback to in-memory for local development
  return checkMemoryRateLimit(key, maxRequests, windowMs);
}
