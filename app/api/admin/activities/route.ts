import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/activities
 * Fetch paginated, filtered activity log from MongoDB.
 *
 * POST /api/admin/activities
 * Manually add an activity entry (used by internal services).
 *
 * DELETE /api/admin/activities
 * Clear all activities (admin only — dev/testing use).
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { default: ActivityLog } = await import('@/models/ActivityLog');

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const timeRange = searchParams.get('timeRange') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      if (timeRange === 'today') {
        query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
      } else if (timeRange === 'week') {
        query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (timeRange === 'month') {
        query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    const total = await ActivityLog.countDocuments(query);
    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Normalise shape — map `_id` and `createdAt` → `timestamp` for UI compatibility
    const normalised = activities.map((a: any) => ({
      _id: a._id.toString(),
      type: a.type,
      title: a.title,
      description: a.description,
      metadata: a.metadata ?? {},
      severity: a.severity ?? 'low',
      timestamp: a.createdAt,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      activities: normalised,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('[Admin Activities GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { default: ActivityLog } = await import('@/models/ActivityLog');

    const body = await request.json();
    if (!body.type || !body.title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    const activity = await ActivityLog.create({
      type: body.type,
      title: body.title,
      description: body.description || '',
      metadata: body.metadata || {},
      severity: body.severity || 'low',
      actorId: body.actorId,
      targetId: body.targetId,
      targetType: body.targetType,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    logger.error('[Admin Activities POST] Error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { default: ActivityLog } = await import('@/models/ActivityLog');
    await ActivityLog.deleteMany({});
    return NextResponse.json({ message: 'All activities cleared' });
  } catch (error) {
    logger.error('[Admin Activities DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to clear activities' }, { status: 500 });
  }
}
