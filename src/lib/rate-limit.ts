/**
 * Util: Rate Limit | Type: Server | Deps: node:crypto
 *
 * Small in-memory sliding-window limiter with optional lockout, keyed by a
 * hashed identifier (client IP). Internal-only: in production on serverless
 * hosting each instance/virtual-machine owns its own memory, so a determined
 * attacker hitting many executions can bypass it. For strong guarantees use
 * a durable store (e.g. Upstash/Vercel) — this module is a meaningful
 * baseline for abuse and brute-force protection.
 */
import { createHash } from "node:crypto";

const UNKNOWN_REQUESTER = "unknown";

interface Bucket {
  hits: number[];
  blockedUntil: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  lockoutMs?: number;
}

export interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Best-effort client IP. Behind a trusted reverse proxy (Vercel, etc.) the
 * first `x-forwarded-for` entry is the real client; when running directly in
 * Node the header is client-controlled, so treat it as advisory only.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || "unknown";
}

/**
 * Creates a sliding-window limiter. Calls `prune()` periodically to shed
 * stale buckets (avoids unbounded memory growth from many unique keys).
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, lockoutMs = 0 } = options;
  const buckets = new Map<string, Bucket>();
  let lastPrune = Date.now();

  function prune(now: number): void {
    const windowStart = now - windowMs;
    for (const [key, bucket] of buckets) {
      bucket.hits = bucket.hits.filter((t) => t > windowStart);
      if (bucket.hits.length === 0 && bucket.blockedUntil <= now) {
        buckets.delete(key);
      }
    }
  }

  return {
    isLimited(keyInput: string): RateLimitResult {
      const now = Date.now();
      if (now - lastPrune > windowMs) {
        prune(now);
        lastPrune = now;
      }

      const key = hashKey(keyInput || UNKNOWN_REQUESTER);
      const bucket = buckets.get(key);

      if (bucket && bucket.blockedUntil > now) {
        return {
          limited: true,
          limit: max,
          remaining: 0,
          resetAt: bucket.blockedUntil,
          retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
        };
      }

      if (bucket) {
        const windowStart = now - windowMs;
        bucket.hits = bucket.hits.filter((t) => t > windowStart);
        if (bucket.hits.length >= max) {
          const resetAt = lockoutMs
            ? now + lockoutMs
            : bucket.hits[0] + windowMs;
          bucket.blockedUntil = lockoutMs ? resetAt : 0;
          return {
            limited: true,
            limit: max,
            remaining: 0,
            resetAt,
            retryAfterSeconds: Math.max(
              1,
              Math.ceil((resetAt - now) / 1000),
            ),
          };
        }
        bucket.hits.push(now);
        return {
          limited: false,
          limit: max,
          remaining: Math.max(0, max - bucket.hits.length),
          resetAt: bucket.hits[0] + windowMs,
        };
      }

      buckets.set(key, { hits: [now], blockedUntil: 0 });
      return {
        limited: false,
        limit: max,
        remaining: Math.max(0, max - 1),
        resetAt: now + windowMs,
      };
    },

    reset(keyInput: string): void {
      buckets.delete(hashKey(keyInput || UNKNOWN_REQUESTER));
    },
  };
}
