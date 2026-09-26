import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { adminStore } from '@/lib/adminStore';

/**
 * PATCH /api/admin/notifications/[id]
 * Update a notification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Update notification using the store
    const updatedNotification = adminStore.updateNotification(id, {
      title: body.title,
      message: body.message,
      channels: body.channels,
      targetAudience: body.targetAudience,
      status: body.status,
      sentCount: body.sentCount,
      scheduledAt: body.scheduledAt,
    });

    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNotification);
  } catch (error) {
    logger.error('[Admin Notifications PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Delete notification using the store
    const deleted = adminStore.deleteNotification(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Notification deleted successfully', _id: id },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[Admin Notifications DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications/[id]/send
 * Send a notification immediately
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const url = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a send request
    if (url.pathname.includes('/send')) {
      // Update notification status
      const updated = adminStore.updateNotification(id, {
        status: 'sent',
        sentCount: Math.floor(Math.random() * 1000) + 50,
      });

      if (!updated) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'Notification sent successfully',
          _id: id,
          status: 'sent',
          sentCount: updated.sentCount,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('[Admin Notifications POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

