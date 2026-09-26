import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

export async function GET(request: NextRequest) {
  try {
    const admin = requireRole(request, ['admin']);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const search = searchParams.get('search') || '';

    let query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { 'tenantId.username': { $regex: search, $options: 'i' } },
        { 'tenantId.phone': { $regex: search, $options: 'i' } },
        { 'propertyId.title': { $regex: search, $options: 'i' } },
      ];
    }

    const inquiries = await Inquiry.find(query)
      .populate('tenantId', 'username phone email')
      .populate('propertyId', 'title')
      .populate('ownerId', 'username phone')
      .lean();

    // Generate CSV
    const headers = [
      'Tenant Name',
      'Tenant Phone',
      'Tenant Email',
      'Property',
      'Owner Name',
      'Owner Phone',
      'Status',
      'Priority',
      'Inquiry Date',
      'Last Updated',
    ];

    const rows = inquiries.map((inquiry: any) => [
      inquiry.tenantId?.username || '',
      inquiry.tenantId?.phone || '',
      inquiry.tenantId?.email || '',
      inquiry.propertyId?.title || '',
      inquiry.ownerId?.username || '',
      inquiry.ownerId?.phone || '',
      inquiry.status || '',
      inquiry.priority || '',
      new Date(inquiry.inquiryDate).toLocaleDateString(),
      new Date(inquiry.lastUpdate).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="inquiries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
