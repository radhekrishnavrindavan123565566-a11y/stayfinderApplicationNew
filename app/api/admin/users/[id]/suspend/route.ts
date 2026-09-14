import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/users/[id]/suspend
 * Temporarily suspend a user account
 * Note: Auth check should be done in middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { daysCount, reason } = await request.json();

    if (!daysCount || daysCount < 1 || daysCount > 30) {
      return NextResponse.json(
        { error: 'Suspension days must be between 1 and 30' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: User } = await import('@/models/User');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    // Calculate suspension end date
    const suspensionEndDate = new Date();
    suspensionEndDate.setDate(suspensionEndDate.getDate() + daysCount);

    // Find and update user
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        isSuspended: true,
        suspensionEndDate,
        suspensionReason: reason,
        isActive: false,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Log the action
    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'user_blocked',
      entityType: 'user',
      entityId: new ObjectId(params.id),
      metadata: {
        type: 'suspension',
        daysCount,
        suspensionEndDate,
        reason,
      },
      createdAt: new Date(),
    });

    // TODO: Send notification to user about suspension
    // const { sendUserNotification } = await import('@/lib/notifications');
    // await sendUserNotification(user._id, {
    //   type: 'account_suspended',
    //   daysCount,
    //   reason,
    //   endDate: suspensionEndDate,
    // });

    return NextResponse.json({
      success: true,
      message: `User suspended for ${daysCount} days`,
      user: {
        _id: user._id.toString(),
        username: user.username,
        isSuspended: true,
        suspensionEndDate,
      },
    });
  } catch (error) {
    logger.error('[Admin Suspend User] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
