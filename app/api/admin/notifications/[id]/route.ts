import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/notifications/[id]
 * Update a notification
 * Note: Auth check should be done in middleware
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    await connectDB();

    const { default: Notification } = await import('@/models/Notification');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const notification = await Notification.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'notification_sent',
      entityType: 'notification',
      entityId: new ObjectId(params.id),
      metadata: { title: notification.title },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      notification: {
        _id: notification._id.toString(),
        ...notification.toObject(),
      },
    });
  } catch (error) {
    logger.error('[Admin Notification Update] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete a notification
 * Note: Auth check should be done in middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { default: Notification } = await import('@/models/Notification');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const notification = await Notification.findByIdAndDelete(params.id);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'notification_sent',
      entityType: 'notification',
      entityId: new ObjectId(params.id),
      reason: 'Notification deleted by admin',
      metadata: { title: notification.title },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('[Admin Notification Delete] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
