import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface Notification {
  _id?: string;
  title: string;
  message: string;
  channels: ('sms' | 'whatsapp' | 'push' | 'email')[];
  targetAudience: 'all' | 'owners' | 'tenants';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentCount?: number;
  scheduledAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// In-memory storage for notifications
let notifications: Notification[] = [];

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

    // Filter notifications
    let filtered = notifications;
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

    const newNotification: Notification = {
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

    notifications.push(newNotification);

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    logger.error('[Admin Notifications POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
