import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/users/[id]/block
 * Permanently block a user account
 * Note: Auth check should be done in middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json();

    await connectDB();

    const { default: User } = await import('@/models/User');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    // Find and update user
    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive: false, isBlocked: true, blockReason: reason, isSuspended: false },
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
        type: 'permanent_block',
        blockReason: reason,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'User permanently blocked',
      user: {
        _id: user._id.toString(),
        username: user.username,
        isActive: user.isActive,
        isBlocked: true,
      },
    });
  } catch (error) {
    logger.error('[Admin Block User] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
