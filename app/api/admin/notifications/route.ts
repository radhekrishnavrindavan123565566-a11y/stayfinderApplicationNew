import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/notifications
 * Get all notifications with pagination
 * Note: Auth check should be done in middleware
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const { default: Notification } = await import('@/models/Notification');

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        notificationType: n.notificationType,
        channel: n.channel,
        targetAudience: n.targetAudience,
        scheduledDate: n.scheduledDate,
        sentAt: n.sentAt,
        status: n.status,
        deliveryStats: n.deliveryStats,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error('[Admin Notifications] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification
 * Requires: Admin role
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.title || !data.message || !data.channel || data.channel.length === 0) {
      return NextResponse.json(
        { error: 'Title, message, and at least one channel are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: Notification } = await import('@/models/Notification');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const notification = await Notification.create({
      ...data,
      status: data.scheduledDate ? 'scheduled' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryStats: {
        total: 0,
        delivered: 0,
        failed: 0,
      },
    });

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'notification_sent',
      entityType: 'notification',
      entityId: notification._id,
      metadata: { title: data.title },
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        notification: {
          _id: notification._id.toString(),
          ...data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('[Admin Notification Create] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
