/**
 * Simple in-memory rate limiter using sliding window algorithm
 * 
 * Note: This is suitable for single-instance deployments.
 * For multi-instance deployments, use Redis or a similar distributed store.
 */

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Clean up old entries from the rate limit store
 * Removes entries that haven't been accessed recently to prevent memory leaks
 */
function cleanupStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, key) => {
    // Remove entries that haven't been accessed in 2x the cleanup interval
    // This provides a buffer while still cleaning up stale entries
    if (now - entry.lastCleanup > CLEANUP_INTERVAL_MS * 2) {
      keysToDelete.push(key);
    }
  });

  // Delete stale entries
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
  
  // Log cleanup in development for debugging
  if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
    console.debug(`[RateLimit] Cleaned up ${keysToDelete.length} stale entries`);
  }
}

// Run cleanup periodically
// Note: unref() ensures the interval doesn't prevent Node.js process from exiting
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(cleanupStore, CLEANUP_INTERVAL_MS);
  // Allow the process to exit if this is the only active timer
  cleanupInterval.unref?.();
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check if a request is allowed under the rate limit
 * 
 * @param key - Unique identifier for the rate limit (e.g., userId)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
  entry.lastCleanup = now;

  // Check if under limit
  const currentCount = entry.timestamps.length;
  const remaining = Math.max(0, config.maxRequests - currentCount);

  if (currentCount >= config.maxRequests) {
    // Calculate when the oldest request will expire
    const oldestTimestamp = entry.timestamps[0];
    const resetAt = oldestTimestamp + config.windowMs;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt: now + config.windowMs,
  };
}

/**
 * Default rate limit for coach AI endpoints
 * 20 requests per minute per user
 */
export const COACH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Rate limit for session creation
 * 5 sessions per minute per user
 */
export const SESSION_CREATE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Rate limit for argument finalization
 * 10 finalizations per minute per user
 */
export const FINALIZE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Rate limit for AI title generation
 * 10 title generations per minute per user
 */
export const TITLE_GENERATION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}
