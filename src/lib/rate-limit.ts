/**
 * @file src/lib/rate-limit.ts
 * @description A small fixed-window rate limiter: at most `limit` requests per key in each window.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Rate Limiting
 *
 * Counts live in memory, so on a serverless host each running instance counts on its own. That makes this a brake on
 * one address sending a flood, not a hard ceiling across the whole site; the OpenRouter spend cap is the ceiling.
 */

export type RateLimitVerdict = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface RateLimiter {
  check(key: string): RateLimitVerdict;
}

interface Options {
  limit: number;
  windowMs: number;
  /** The clock, in milliseconds. Tests pass their own. */
  now?: () => number;
}

/** The most keys kept before expired windows are cleared out, so memory can't grow without bound. */
const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs, now = () => Date.now() }: Options): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();

  return {
    check(key) {
      const t = now();
      let window = windows.get(key);
      if (!window || t - window.start >= windowMs) {
        if (windows.size >= MAX_TRACKED_KEYS) {
          for (const [k, w] of windows) if (t - w.start >= windowMs) windows.delete(k);
        }
        window = { start: t, count: 0 };
        windows.set(key, window);
      }
      if (window.count >= limit) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((window.start + windowMs - t) / 1000)) };
      }
      window.count += 1;
      return { allowed: true };
    },
  };
}
