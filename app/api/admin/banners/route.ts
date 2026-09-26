import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { adminStore } from '@/lib/adminStore';

/**
 * GET /api/admin/banners
 * Get paginated list of banners
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Get banners from store
    const allBanners = adminStore.getBanners();

    // Filter banners
    let filtered = allBanners;
    if (search) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      banners: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  } catch (error) {
    logger.error('[Admin Banners GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/banners
 * Create a new banner
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

    if (!body.imageUrl || !body.imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const newBanner = {
      _id: Date.now().toString(),
      title: body.title.trim(),
      description: body.description?.trim() || '',
      imageUrl: body.imageUrl.trim(),
      link: body.link?.trim() || '/',
      isActive: true,
      displayOrder: adminStore.getBanners().length + 1,
      impressions: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const added = adminStore.addBanner(newBanner);

    return NextResponse.json(added, { status: 201 });
  } catch (error) {
    logger.error('[Admin Banners POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
