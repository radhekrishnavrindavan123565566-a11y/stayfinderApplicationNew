import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * DELETE /api/admin/properties/[id]
 * Delete a property (hard delete)
 * Note: Auth check should be done in middleware
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Import models
    const { default: Property } = await import('@/models/Property');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');
    const { default: Inquiry } = await import('@/models/Inquiry');

    // Find property to delete
    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete related inquiries
    await Inquiry.deleteMany({ propertyId: new ObjectId(params.id) });

    // Delete property
    await Property.findByIdAndDelete(params.id);

    // Log the action
    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'),
      action: 'property_edited',
      entityType: 'property',
      entityId: new ObjectId(params.id),
      reason: 'Property deleted by admin',
      metadata: {
        deletedProperty: {
          title: property.title,
          price: property.price,
          ownerId: property.ownerId,
        },
      },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      deletedPropertyId: params.id,
    });
  } catch (error) {
    logger.error('[Admin Property Delete] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
