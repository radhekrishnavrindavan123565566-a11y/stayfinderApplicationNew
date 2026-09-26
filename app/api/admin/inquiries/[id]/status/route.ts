import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = requireRole(request, ['admin']);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = [
      'new_lead',
      'call_done',
      'visit_scheduled',
      'visit_completed',
      'closed_booked',
      'closed_not_interested',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      params.id,
      {
        status,
        lastUpdate: new Date(),
      },
      { new: true }
    )
      .populate('tenantId', 'username phone email')
      .populate('propertyId', 'title')
      .populate('ownerId', 'username phone');

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
