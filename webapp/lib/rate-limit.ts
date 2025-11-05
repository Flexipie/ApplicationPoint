/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using:
 * - Redis-based rate limiting (@upstash/ratelimit)
 * - Edge middleware (Vercel Edge Config)
 * - CloudFlare rate limiting
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per window
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache: Map<string, TokenBucket>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.cache = new Map();
    this.config = config;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.cache.entries()) {
      if (bucket.resetTime < now) {
        this.cache.delete(key);
      }
    }
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const bucket = this.cache.get(identifier);

    if (!bucket || bucket.resetTime < now) {
      // Create new bucket or reset expired one
      const resetTime = now + this.config.interval;
      this.cache.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        success: true,
        limit: this.config.uniqueTokenPerInterval,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: resetTime,
      };
    }

    // Check if limit exceeded
    if (bucket.count >= this.config.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: this.config.uniqueTokenPerInterval,
        remaining: 0,
        reset: bucket.resetTime,
      };
    }

    // Increment count
    bucket.count++;
    this.cache.set(identifier, bucket);

    return {
      success: true,
      limit: this.config.uniqueTokenPerInterval,
      remaining: this.config.uniqueTokenPerInterval - bucket.count,
      reset: bucket.resetTime,
    };
  }
}

// Create rate limiter instances for different use cases

// Strict rate limit for authentication endpoints (10 requests per 15 minutes)
export const authRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 10,
});

// Standard rate limit for API endpoints (60 requests per minute)
export const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 60,
});

// Relaxed rate limit for read operations (100 requests per minute)
export const readRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

/**
 * Helper function to get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const headers = request.headers;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Rate limit middleware helper
 * Returns response if rate limited, otherwise null
 */
export async function rateLimit(
  request: Request,
  limiter: RateLimiter = apiRateLimiter
): Promise<Response | null> {
  const ip = getClientIp(request);
  const result = await limiter.check(ip);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        limit: result.limit,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
