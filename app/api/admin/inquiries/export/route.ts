import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ObjectId } from 'mongodb';

/**
 * POST /api/admin/inquiries/export
 * Export inquiries/leads to CSV or XLSX
 * Requires: Admin role
 * Note: Auth check should be done in middleware
 */
export async function POST(request: NextRequest) {
  try {
    const adminId = '000000000000000000000000';

    const { filters, format } = await request.json();

    // Validate format
    if (!['csv', 'xlsx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or xlsx' },
        { status: 400 }
      );
    }

    await connectDB();

    const { default: Inquiry } = await import('@/models/Inquiry');
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');
    const db = (await connectDB()).connection.db;

    // Build query from filters
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.source) query.source = filters.source;

    if (filters.dateRange) {
      query.createdAt = {
        $gte: new Date(filters.dateRange.from),
        $lte: new Date(filters.dateRange.to),
      };
    }

    if (filters.searchQuery) {
      query.$or = [
        { tenantName: { $regex: filters.searchQuery, $options: 'i' } },
        { propertyTitle: { $regex: filters.searchQuery, $options: 'i' } },
      ];
    }

    // Fetch inquiries
    const inquiries = await Inquiry.find(query).lean();

    if (inquiries.length === 0) {
      return NextResponse.json(
        { error: 'No inquiries match the specified filters' },
        { status: 404 }
      );
    }

    // Prepare export data
    const exportData = inquiries.map((inquiry: any) => ({
      inquiryId: inquiry._id.toString(),
      tenantName: inquiry.tenantName,
      tenantPhone: inquiry.tenantPhone,
      propertyTitle: inquiry.propertyTitle,
      ownerName: inquiry.ownerName,
      status: inquiry.status,
      inquiryDate: new Date(inquiry.createdAt).toLocaleDateString(),
      visitScheduledDate: inquiry.visitScheduledDate
        ? new Date(inquiry.visitScheduledDate).toLocaleDateString()
        : '',
      source: inquiry.source,
      priority: inquiry.priority,
      followUpDue: inquiry.followUpDate
        ? new Date(inquiry.followUpDate).toLocaleDateString()
        : '',
      callNotes: inquiry.callNotes || '',
      conversationLink: inquiry.conversationLink || '',
    }));

    // Generate CSV
    if (format === 'csv') {
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: any) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape quotes and wrap in quotes if contains comma
              return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(',')
        ),
      ].join('\n');

      // Create audit log
      await db.collection('admin_audit_logs').insertOne({
        adminId: new ObjectId(adminId),
        action: 'lead_exported',
        entityType: 'inquiry',
        entityId: new ObjectId(),
        metadata: {
          recordCount: exportData.length,
          format: 'csv',
          filters,
        },
        createdAt: new Date(),
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads_export_${Date.now()}.csv"`,
        },
      });
    }

    // For XLSX, we need to use a library or return JSON for client-side generation
    // For now, return JSON that can be processed client-side
    await db.collection('admin_audit_logs').insertOne({
      adminId: new ObjectId(adminId),
      action: 'lead_exported',
      entityType: 'inquiry',
      entityId: new ObjectId(),
      metadata: {
        recordCount: exportData.length,
        format: 'xlsx',
        filters,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: exportData,
      format: 'xlsx',
      fileName: `leads_export_${Date.now()}.xlsx`,
      recordCount: exportData.length,
    });
  } catch (error) {
    logger.error('[Leads Export] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
