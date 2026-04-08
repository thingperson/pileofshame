// Simple in-memory rate limiter for API routes.
// Tracks request counts per IP with a sliding window.
// Resets when serverless instance recycles (which is fine — it's a speed bump, not a fortress).

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean stale entries periodically to prevent memory leak
let lastClean = Date.now();
const CLEAN_INTERVAL = 60_000; // 1 min

function cleanStale() {
  const now = Date.now();
  if (now - lastClean < CLEAN_INTERVAL) return;
  lastClean = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request should be rate limited.
 * @returns null if allowed, or { retryAfter } in seconds if blocked.
 */
export function checkRateLimit(
  ip: string,
  route: string,
  maxRequests: number,
  windowMs: number,
): { retryAfter: number } | null {
  cleanStale();

  const key = `${route}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return null;
}

/**
 * Get client IP from Next.js request headers.
 * Vercel sets x-forwarded-for; falls back to 'unknown'.
 */
export function getClientIP(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
