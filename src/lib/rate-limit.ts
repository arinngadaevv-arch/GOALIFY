import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting with a production-ready Upstash Redis backend when configured,
 * and a bounded in-memory sliding-window fallback otherwise (works in local dev
 * and single-instance deployments). Limiter errors fail *open* (allow the
 * request) so a limiter outage never takes down auth or generation.
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms when the window resets
};

type Rule = { limit: number; windowMs: number };

/** Named rules used across the app. Tune here. */
export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 5 * 60_000 }, // 10 / 5 min
  register: { limit: 6, windowMs: 60 * 60_000 }, // 6 / hour
  forgotPassword: { limit: 5, windowMs: 15 * 60_000 }, // 5 / 15 min
  resetPassword: { limit: 8, windowMs: 15 * 60_000 }, // 8 / 15 min
  generate: { limit: 20, windowMs: 60_000 }, // 20 / min
  analyticsTrack: { limit: 60, windowMs: 60_000 }, // 60 / min
  reviewSubmit: { limit: 5, windowMs: 60_000 }, // 5 / min
} satisfies Record<string, Rule>;

export type RateLimitName = keyof typeof RATE_LIMITS;

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

// --- Upstash backend (lazy singletons per rule) ---
const upstashLimiters = new Map<RateLimitName, Ratelimit>();

function getUpstashLimiter(name: RateLimitName): Ratelimit {
  let limiter = upstashLimiters.get(name);
  if (!limiter) {
    const rule = RATE_LIMITS[name];
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(rule.limit, `${rule.windowMs} ms`),
      prefix: `goalify:rl:${name}`,
      analytics: false,
    });
    upstashLimiters.set(name, limiter);
  }
  return limiter;
}

// --- In-memory fallback (bounded, self-cleaning) ---
const memoryStore = new Map<string, number[]>();
const MAX_KEYS = 10_000;

function memoryLimit(key: string, rule: Rule): RateLimitResult {
  const now = Date.now();
  const windowStart = now - rule.windowMs;
  const hits = (memoryStore.get(key) ?? []).filter((t) => t > windowStart);

  const success = hits.length < rule.limit;
  if (success) hits.push(now);
  memoryStore.set(key, hits);

  // Opportunistic cleanup to keep the map bounded.
  if (memoryStore.size > MAX_KEYS) {
    for (const [k, times] of memoryStore) {
      const fresh = times.filter((t) => t > now - rule.windowMs);
      if (fresh.length === 0) memoryStore.delete(k);
      else memoryStore.set(k, fresh);
    }
  }

  return {
    success,
    remaining: Math.max(0, rule.limit - hits.length),
    reset: (hits[0] ?? now) + rule.windowMs,
  };
}

export async function rateLimit(
  name: RateLimitName,
  identifier: string
): Promise<RateLimitResult> {
  const rule = RATE_LIMITS[name];
  const key = `${name}:${identifier}`;

  try {
    if (hasUpstash) {
      const res = await getUpstashLimiter(name).limit(key);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    }
  } catch (err) {
    // Fail open: never let a limiter outage break the app.
    console.error(`[rate-limit] backend error for "${name}", allowing`, err);
    return { success: true, remaining: rule.limit, reset: Date.now() };
  }

  return memoryLimit(key, rule);
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function retryAfterSeconds(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}
