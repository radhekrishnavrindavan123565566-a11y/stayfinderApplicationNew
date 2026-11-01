/**
 * Lightweight in-process TTL cache.
 *
 * Works in Next.js serverless routes (each module is a long-lived Node.js
 * module in dev and in a single-instance deployment).  For multi-instance
 * or edge deployments, swap the backing store for Redis.
 *
 * Usage:
 *   import { cache } from '@/lib/cache';
 *
 *   // Cache admin stats for 30 seconds
 *   const stats = await cache.getOrSet('admin:stats', fetchStats, 30);
 *
 *   // Manually invalidate
 *   cache.del('admin:stats');
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private store = new Map<string, Entry<any>>();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    // Sweep expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.timer = setInterval(() => this.sweep(), 5 * 60 * 1000);
      // Don't keep the process alive just for sweeping
      if (this.timer?.unref) this.timer.unref();
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  /** Return cached value or call factory, cache the result, and return it. */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    const value = await factory();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /** Invalidate all keys that start with the given prefix. */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  /** Current number of cached entries (for monitoring). */
  get size(): number {
    return this.store.size;
  }
}

// Singleton shared across all route handlers in the same Node.js process
declare global {
  // eslint-disable-next-line no-var
  var __sstCache: TtlCache | undefined;
}

export const cache: TtlCache = global.__sstCache ?? new TtlCache();
global.__sstCache = cache;
