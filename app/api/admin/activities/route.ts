import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/activities
 * Fetch paginated, filtered activity log from MongoDB.
 * countDocuments + find run in parallel for lower latency.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? '';
  const log = logger.child({ route: 'GET /api/admin/activities', requestId });

  try {
    await connectDB();
    const { default: ActivityLog } = await import('@/models/ActivityLog');

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const search    = searchParams.get('search')    || '';
    const type      = searchParams.get('type')      || '';
    const timeRange = searchParams.get('timeRange') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      if (timeRange === 'today')  query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
      if (timeRange === 'week')   query.createdAt = { $gte: new Date(Date.now() - 7  * 86_400_000) };
      if (timeRange === 'month')  query.createdAt = { $gte: new Date(Date.now() - 30 * 86_400_000) };
    }

    // ── Run count + fetch in parallel ─────────────────────────────────────────
    const [total, activities] = await Promise.all([
      ActivityLog.countDocuments(query),
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalised = activities.map((a: any) => ({
      _id:         a._id.toString(),
      type:        a.type,
      title:       a.title,
      description: a.description,
      metadata:    a.metadata ?? {},
      severity:    a.severity ?? 'low',
      timestamp:   a.createdAt,
      createdAt:   a.createdAt,
    }));

    log.debug('Activities fetched', { total, page, limit });

    return NextResponse.json(
      { activities: normalised, total, page, limit, totalPages: Math.ceil(total / limit) },
      { headers: { ...(requestId && { 'x-request-id': requestId }) } }
    );
  } catch (error) {
    log.error('Failed to fetch activities', error);
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
      type: body.type, title: body.title,
      description: body.description || '',
      metadata: body.metadata || {},
      severity: body.severity || 'low',
      actorId: body.actorId, targetId: body.targetId, targetType: body.targetType,
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    logger.error('Failed to log activity', error);
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
    logger.error('Failed to clear activities', error);
    return NextResponse.json({ error: 'Failed to clear activities' }, { status: 500 });
  }
}
