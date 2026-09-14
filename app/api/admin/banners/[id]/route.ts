import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/banners/[id]
 * Update a banner
 * Note: Auth check should be done in middleware
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    await connectDB();

    const { default: Banner } = await import('@/models/Banner');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const banner = await Banner.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'banner_updated',
      entityType: 'banner',
      entityId: new ObjectId(params.id),
      metadata: { title: banner.title },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      banner: {
        _id: banner._id.toString(),
        ...banner.toObject(),
      },
    });
  } catch (error) {
    logger.error('[Admin Banner Update] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners/[id]
 * Delete a banner
 * Note: Auth check should be done in middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { default: Banner } = await import('@/models/Banner');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const banner = await Banner.findByIdAndDelete(params.id);

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'banner_deleted',
      entityType: 'banner',
      entityId: new ObjectId(params.id),
      reason: 'Banner deleted by admin',
      metadata: { title: banner.title },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    logger.error('[Admin Banner Delete] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
