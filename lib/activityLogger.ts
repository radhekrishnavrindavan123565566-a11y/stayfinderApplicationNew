/**
 * Centralized fire-and-forget activity logger.
 *
 * - Persists to MongoDB (ActivityLog collection).
 * - Pushes SSE update to connected admin browsers.
 * - Never blocks the calling request — all errors are swallowed.
 *
 * The emitActivity import is done once at module load (cached by Node.js
 * module system), removing the per-call dynamic import overhead.
 */
import { connectDB } from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';
import type { IActivityLog } from '@/models/ActivityLog';

// Import SSE emitter once — Node caches the module
import { emitActivity } from '@/app/api/admin/activities/stream/route';

type ActivityType = IActivityLog['type'];

export interface LogActivityParams {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high';
  actorId?: string;
  targetId?: string;
  targetType?: IActivityLog['targetType'];
}

/**
 * Log an activity.  Call without await — this is designed to be fire-and-forget.
 *
 *   logActivity({ type: 'property_added', title: '...', ... });
 */
export function logActivity(params: LogActivityParams): void {
  // Kick off async work without blocking the caller
  _persist(params).catch((err) =>
    logger.error('activityLogger: persist failed', err)
  );
}

async function _persist(params: LogActivityParams): Promise<void> {
  await connectDB();
  const { default: ActivityLog } = await import('@/models/ActivityLog');

  const doc = await ActivityLog.create({
    type:       params.type,
    title:      params.title,
    description: params.description ?? '',
    metadata:   params.metadata ?? {},
    severity:   params.severity ?? 'low',
    actorId:    params.actorId,
    targetId:   params.targetId,
    targetType: params.targetType,
  });

  // Invalidate cached admin stats so the next poll reflects the new event
  cache.del('admin:stats');

  // Push to SSE listeners (in-process; no-op if no admins are connected)
  try {
    emitActivity({
      _id:         doc._id.toString(),
      type:        doc.type,
      title:       doc.title,
      description: doc.description,
      metadata:    doc.metadata ?? {},
      severity:    doc.severity,
      timestamp:   doc.createdAt,
      createdAt:   doc.createdAt,
    });
  } catch {
    // SSE emitter unavailable — not critical
  }
}
