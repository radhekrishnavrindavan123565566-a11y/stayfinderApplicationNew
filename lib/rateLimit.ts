import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
class RateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, 300000);
  }

  /**
   * Check if request should be rate limited
   * 
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    // No record or expired - create new
    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: limit - 1, resetTime };
    }

    // Limit exceeded
    if (record.count >= limit) {
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for API routes
 * 
 * @param req - Next.js request object
 * @param limit - Maximum requests allowed (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Rate limit result
 * 
 * @example
 * export async function POST(req: NextRequest) {
 *   const { success, remaining } = rateLimit(req, 5, 60000);
 *   if (!success) {
 *     return errorResponse('Too many requests', 429);
 *   }
 *   // ... rest of handler
 * }
 */
export function rateLimit(
  req: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  // Get identifier from IP or user
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';

  return rateLimiter.check(ip, limit, windowMs);
}

/**
 * Rate limit by user ID (for authenticated routes)
 */
export function rateLimitByUser(
  userId: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  return rateLimiter.check(`user:${userId}`, limit, windowMs);
}

/**
 * Reset rate limit for IP or user
 */
export function resetRateLimit(identifier: string): void {
  rateLimiter.reset(identifier);
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => rateLimiter.destroy());
  process.on('SIGINT', () => rateLimiter.destroy());
}

export default rateLimiter;
