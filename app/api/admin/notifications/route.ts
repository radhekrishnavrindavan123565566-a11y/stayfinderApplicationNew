import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { adminStore } from '@/lib/adminStore';

/**
 * GET /api/admin/notifications
 * Get paginated list of notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Get notifications from store
    const allNotifications = adminStore.getNotifications();

    // Filter notifications
    let filtered = allNotifications;
    if (search) {
      filtered = filtered.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      notifications: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  } catch (error) {
    logger.error('[Admin Notifications GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const newNotification = {
      _id: Date.now().toString(),
      title: body.title.trim(),
      message: body.message.trim(),
      channels: body.channels || ['push'],
      targetAudience: body.targetAudience || 'all',
      status: 'draft',
      sentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const added = adminStore.addNotification(newNotification);

    return NextResponse.json(added, { status: 201 });
  } catch (error) {
    logger.error('[Admin Notifications POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
