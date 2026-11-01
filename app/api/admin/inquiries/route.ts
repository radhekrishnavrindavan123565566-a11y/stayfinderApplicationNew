import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const admin = requireRole(request, ['admin']);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page     = Math.max(1, parseInt(searchParams.get('page')     || '1'));
    const limit    = Math.min(50, parseInt(searchParams.get('limit')   || '15'));
    const search   = searchParams.get('search')   || '';
    const status   = searchParams.get('status')   || '';
    const priority = searchParams.get('priority') || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status)   query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { 'tenantId.username': { $regex: search, $options: 'i' } },
        { 'tenantId.phone':    { $regex: search, $options: 'i' } },
        { 'propertyId.title':  { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // ── Run count + fetch in parallel ─────────────────────────────────────────
    const [total, inquiries] = await Promise.all([
      Inquiry.countDocuments(query),
      Inquiry.find(query)
        .populate('tenantId',  'username phone email')
        .populate('propertyId', 'title location price')
        .populate('ownerId',   'username phone')
        .sort({ inquiryDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

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
