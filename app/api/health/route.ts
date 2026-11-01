import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { cache } from '@/lib/cache';
import mongoose from 'mongoose';

/**
 * GET /api/health
 * Liveness + readiness probe.
 * Returns structured JSON suitable for uptime monitors (UptimeRobot, Grafana, etc.)
 *
 * Shape:
 * {
 *   status: 'healthy' | 'degraded',
 *   version, environment, uptime, timestamp,
 *   checks: { db, cache },
 *   perf: { heapUsedMb, heapTotalMb, rss }
 * }
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const start = Date.now();

  // ── MongoDB check ─────────────────────────────────────────────────────────
  let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';
  let dbLatencyMs = 0;
  try {
    const t0 = Date.now();
    await connectDB();
    // Quick ping via admin command
    await mongoose.connection.db?.admin().ping();
    dbLatencyMs = Date.now() - t0;
    dbStatus = 'healthy';
  } catch {
    dbStatus = 'unhealthy';
  }

  const mem = process.memoryUsage();
  const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded';

  const body = {
    status: overallStatus,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    environment: process.env.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      db:    { status: dbStatus,  latencyMs: dbLatencyMs },
      cache: { status: 'healthy', entries: cache.size },
    },
    perf: {
      heapUsedMb:  Math.round(mem.heapUsed  / 1_048_576),
      heapTotalMb: Math.round(mem.heapTotal / 1_048_576),
      rssMb:       Math.round(mem.rss       / 1_048_576),
      responseMs:  Date.now() - start,
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: overallStatus === 'healthy' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'x-request-id': req.headers.get('x-request-id') ?? '',
    },
  });
}
