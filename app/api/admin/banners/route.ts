import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/banners
 * Get all promotional banners with pagination
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

    const { default: Banner } = await import('@/models/Banner');

    const total = await Banner.countDocuments(filter);
    const banners = await Banner.find(filter)
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      banners: banners.map((b: any) => ({
        _id: b._id.toString(),
        title: b.title,
        description: b.description,
        imageUrl: b.imageUrl,
        imageAlt: b.imageAlt,
        actionUrl: b.actionUrl,
        actionType: b.actionType,
        position: b.position,
        isActive: b.isActive,
        startDate: b.startDate,
        endDate: b.endDate,
        targetAudience: b.targetAudience,
        displayPlatform: b.displayPlatform,
        impressions: b.impressions || 0,
        clicks: b.clicks || 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error('[Admin Banners] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/banners
 * Create a new banner
 * Requires: Admin role
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.title || !data.imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: Banner } = await import('@/models/Banner');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    const banner = await Banner.create({
      ...data,
      createdBy: new ObjectId('000000000000000000000000'),
      createdAt: new Date(),
      updatedAt: new Date(),
      impressions: 0,
      clicks: 0,
    });

    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'banner_created',
      entityType: 'banner',
      entityId: banner._id,
      metadata: { title: data.title },
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        banner: {
          _id: banner._id.toString(),
          ...data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('[Admin Banner Create] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
