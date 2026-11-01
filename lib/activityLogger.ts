/**
 * Centralized activity logger.
 * Persists activities to MongoDB via the ActivityLog model.
 * Also pushes real-time SSE events to connected admin clients.
 * Import and call logActivity() anywhere in server-side code.
 */
import { connectDB } from '@/lib/mongodb';
import type { IActivityLog } from '@/models/ActivityLog';

type ActivityType = IActivityLog['type'];

interface LogActivityParams {
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high';
  actorId?: string;
  targetId?: string;
  targetType?: IActivityLog['targetType'];
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await connectDB();
    const { default: ActivityLog } = await import('@/models/ActivityLog');
    const doc = await ActivityLog.create({
      type: params.type,
      title: params.title,
      description: params.description ?? '',
      metadata: params.metadata ?? {},
      severity: params.severity ?? 'low',
      actorId: params.actorId ?? undefined,
      targetId: params.targetId ?? undefined,
      targetType: params.targetType ?? undefined,
    });

    // Push real-time SSE update to any connected admin dashboards
    try {
      const { emitActivity } = await import('@/app/api/admin/activities/stream/route');
      emitActivity({
        _id: doc._id.toString(),
        type: doc.type,
        title: doc.title,
        description: doc.description,
        metadata: doc.metadata ?? {},
        severity: doc.severity,
        timestamp: doc.createdAt,
        createdAt: doc.createdAt,
      });
    } catch {
      // SSE emitter import may fail in edge environments — not critical
    }
  } catch (err) {
    // Never let activity logging break the main flow
    console.error('[ActivityLogger] Failed to log activity:', err);
  }
}
