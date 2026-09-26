import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

// Simple XLSX generation (using format compatible with Excel)
function generateExcel(inquiries: any[]) {
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

  const rows = inquiries.map((inquiry) => [
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

  // Create TSV format (tab-separated values) that Excel can open
  const content = [
    headers.join('\t'),
    ...rows.map((row) => row.join('\t')),
  ].join('\n');

  return content;
}

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

    const excelContent = generateExcel(inquiries);

    return new NextResponse(excelContent, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="inquiries-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export Excel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
