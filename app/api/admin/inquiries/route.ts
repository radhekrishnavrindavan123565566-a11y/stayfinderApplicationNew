import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';
import Property from '@/models/Property';

export async function GET(request: NextRequest) {
  try {
    const admin = requireRole(request, ['admin']);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '15'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { 'tenantId.username': { $regex: search, $options: 'i' } },
        { 'tenantId.phone': { $regex: search, $options: 'i' } },
        { 'propertyId.title': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .populate('tenantId', 'username phone email')
      .populate('propertyId', 'title')
      .populate('ownerId', 'username phone')
      .sort({ inquiryDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      inquiries,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Inquiries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
