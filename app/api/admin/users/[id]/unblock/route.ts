import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/users/[id]/unblock
 * Unblock a user account
 * Note: Auth check should be done in middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Import models
    const { default: User } = await import('@/models/User');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    // Find and update user
    const user = await User.findByIdAndUpdate(
      params.id,
      { isActive: true, isBlocked: false },
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
      action: 'user_unblocked',
      entityType: 'user',
      entityId: new ObjectId(params.id),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
      user: {
        _id: user._id.toString(),
        username: user.username,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    logger.error('[Admin Unblock User] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
