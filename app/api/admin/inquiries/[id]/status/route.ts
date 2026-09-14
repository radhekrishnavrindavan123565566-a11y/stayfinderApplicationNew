import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { LeadStatusHistory, LeadStatus } from '@/lib/admin/models';
import { ObjectId } from 'mongodb';

const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new_lead: ['call_done', 'closed_not_interested', 'visit_scheduled'],
  call_done: ['visit_scheduled', 'closed_not_interested', 'visit_completed'],
  visit_scheduled: ['visit_completed', 'closed_not_interested'],
  visit_completed: ['closed_booked', 'closed_not_interested'],
  closed_booked: [],
  closed_not_interested: [],
};

/**
 * PATCH /api/admin/inquiries/[id]/status
 * Update inquiry/lead status with validation
 * Note: Auth check should be done in middleware
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      newStatus,
      notes,
      visitDate,
      visitTime,
      followUpDate,
      callDuration,
    } = await request.json();

    await connectDB();

    const { default: Inquiry } = await import('@/models/Inquiry');
    const db = (await connectDB()).connection.db;

    // Fetch inquiry
    const inquiry = await Inquiry.findById(params.id);
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    const previousStatus = inquiry.status;

    // Validate status transition
    const validNextStatuses = VALID_TRANSITIONS[previousStatus] || [];
    if (!validNextStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${previousStatus} to ${newStatus}`,
          validOptions: validNextStatuses,
        },
        { status: 422 }
      );
    }

    // Execute status-specific logic
    switch (newStatus) {
      case 'call_done':
        if (!callDuration || callDuration <= 0) {
          return NextResponse.json(
            { error: 'Call duration required for call_done status' },
            { status: 400 }
          );
        }
        if (!notes) {
          return NextResponse.json(
            { error: 'Call notes required' },
            { status: 400 }
          );
        }
        inquiry.callDoneDate = new Date();
        inquiry.callDuration = callDuration;
        inquiry.callNotes = notes;
        inquiry.followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
        inquiry.followUpReminder = true;
        break;

      case 'visit_scheduled':
        if (!visitDate || !visitTime) {
          return NextResponse.json(
            { error: 'Visit date and time required' },
            { status: 400 }
          );
        }
        const scheduledDate = new Date(visitDate);
        if (scheduledDate < new Date()) {
          return NextResponse.json(
            { error: 'Visit date cannot be in the past' },
            { status: 400 }
          );
        }
        inquiry.visitScheduledDate = scheduledDate;
        inquiry.visitScheduledTime = visitTime;
        inquiry.visitNotes = notes || '';
        // TODO: Send notification to tenant and owner
        break;

      case 'closed_booked':
        // TODO: Create booking record
        inquiry.bookingCreatedId = new ObjectId(); // Placeholder
        inquiry.closureReason = 'booked';
        break;

      case 'closed_not_interested':
        inquiry.closureReason = notes || 'not_interested';
        inquiry.followUpDate = null;
        break;
    }

    // Update inquiry status
    inquiry.status = newStatus;

    // Add to status history
    if (!inquiry.statusHistory) {
      inquiry.statusHistory = [];
    }
    const adminId = '000000000000000000000000';
    inquiry.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: adminId,
      notes,
    });

    await inquiry.save();

    // Create status history record
    const statusHistory: LeadStatusHistory = {
      inquiryId: new ObjectId(params.id),
      previousStatus,
      newStatus,
      changedBy: new ObjectId(adminId),
      changedAt: new Date(),
      notes,
      followUpDue: followUpDate ? new Date(followUpDate) : undefined,
      reminderSent: false,
    };

    await db.collection('lead_status_history').insertOne(statusHistory);

    // Create audit log
    await db.collection('admin_audit_logs').insertOne({
      adminId: new ObjectId(adminId),
      action: 'lead_status_changed',
      entityType: 'inquiry',
      entityId: new ObjectId(params.id),
      changes: [
        {
          field: 'status',
          oldValue: previousStatus,
          newValue: newStatus,
        },
      ],
      reason: notes,
      createdAt: new Date(),
    });

    logger.info('Lead status updated:', {
      inquiryId: params.id,
      from: previousStatus,
      to: newStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead status updated successfully',
      data: {
        inquiryId: inquiry._id,
        previousStatus,
        newStatus,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logger.error('[Lead Status Update] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
