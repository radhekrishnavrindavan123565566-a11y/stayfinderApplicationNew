import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * PATCH /api/admin/properties/[id]/status
 * Update property status (Available, Booked, Hidden, Rejected)
 * Note: Auth check should be done in middleware
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, rejectionReason } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'active', 'booked', 'hidden', 'under_review', 'rejected', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate rejection reason if rejecting
    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is mandatory' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: Property } = await import('@/models/Property');
    const { default: AdminAuditLog } = await import('@/models/AdminAuditLog');

    // Find property
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const oldStatus = property.status;

    // Update property
    const updateData: any = { status };
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = new ObjectId((session.user as any)?.id);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    // Log the action
    await AdminAuditLog.create({
      adminId: new ObjectId('000000000000000000000000'), // Placeholder - will be set by middleware
      action: status === 'rejected' ? 'property_rejected' : status === 'active' ? 'property_approved' : 'property_status_changed',
      entityType: 'property',
      entityId: new ObjectId(params.id),
      changes: [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: status,
        },
      ],
      reason: rejectionReason || undefined,
      createdAt: new Date(),
    });

    // TODO: Send notification to property owner
    // if (status === 'active') {
    //   // Property approved notification
    // } else if (status === 'rejected') {
    //   // Property rejected notification with reason
    // }

    return NextResponse.json({
      success: true,
      property: {
        _id: updatedProperty._id.toString(),
        title: updatedProperty.title,
        status: updatedProperty.status,
        rejectionReason: updatedProperty.rejectionReason,
        updatedAt: updatedProperty.updatedAt,
      },
    });
  } catch (error) {
    logger.error('[Admin Property Status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
