import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { adminStore } from '@/lib/adminStore';

/**
 * PATCH /api/admin/banners/[id]
 * Update a banner
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
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Validate at least one field is being updated
    if (!body.title && !body.description && !body.imageUrl && !body.link) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Update banner using the store
    const updatedBanner = adminStore.updateBanner(id, {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      link: body.link,
    });

    if (!updatedBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBanner);
  } catch (error) {
    logger.error('[Admin Banners PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners/[id]
 * Delete a banner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Delete banner using the store
    const deleted = adminStore.deleteBanner(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Banner deleted successfully', _id: id },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[Admin Banners DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}

