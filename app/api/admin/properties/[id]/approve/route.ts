import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { AdminAuditLog } from '@/lib/admin/models';
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/properties/[id]/approve
 * Approve a pending property listing
 * Requires: Admin role
 * Note: Auth check should be done in middleware
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = '000000000000000000000000';

    const { action, notes } = await request.json();

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: Property } = await import('@/models/Property');
    const { default: User } = await import('@/models/User');
    const db = (await connectDB()).connection.db;

    // Fetch property
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if already approved/rejected
    if (property.status !== 'pending') {
      return NextResponse.json(
        { error: 'Property is not in pending status' },
        { status: 409 }
      );
    }

    // Fetch owner
    const owner = await User.findById(property.ownerId);
    if (!owner?.isVerified) {
      return NextResponse.json(
        { error: 'Owner must be verified before property approval' },
        { status: 400 }
      );
    }

    // Validate minimum images
    if (!property.images || property.images.length < 3) {
      return NextResponse.json(
        { error: 'Minimum 3 images required' },
        { status: 400 }
      );
    }

    // Update property status
    if (action === 'approve') {
      property.status = 'active';
      property.isApproved = true;
      property.approvedAt = new Date();
      property.approvedBy = new ObjectId(adminId);
    } else if (action === 'reject') {
      property.status = 'rejected';
      property.rejectionReason = notes || 'Rejected by admin';
      property.rejectedAt = new Date();
      property.rejectedBy = new ObjectId(adminId);
    }

    await property.save();

    // Create audit log
    const auditLog: AdminAuditLog = {
      adminId: new ObjectId(adminId),
      action: action === 'approve' ? 'property_approved' : 'property_rejected',
      entityType: 'property',
      entityId: new ObjectId(params.id),
      reason: notes,
      metadata: {
        propertyTitle: property.title,
        ownerEmail: owner.email,
      },
      createdAt: new Date(),
    };

    await db.collection('admin_audit_logs').insertOne(auditLog);

    // Send notification to owner
    // TODO: Implement notification service
    logger.info(`Property ${action}ed:`, {
      propertyId: params.id,
      adminId: adminId,
    });

    return NextResponse.json({
      success: true,
      message: `Property ${action}ed successfully`,
      property: {
        id: property._id,
        title: property.title,
        status: property.status,
      },
    });
  } catch (error) {
    logger.error('[Property Approval] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
