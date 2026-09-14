import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { mockInquiries } from '@/lib/mockData';

/**
 * GET /api/admin/inquiries
 * Get paginated list of inquiries with filtering and sorting
 * Returns mock data if database connection fails
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search');

    // Build filter
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { 'tenant.name': { $regex: search, $options: 'i' } },
        { 'tenant.phone': { $regex: search, $options: 'i' } },
        { 'property.title': { $regex: search, $options: 'i' } },
      ];
    }

    // Import models
    const { default: Inquiry } = await import('@/models/Inquiry');
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');

    // Get total count
    const total = await Inquiry.countDocuments(filter);

    // Build sort object
    let sortObj: Record<string, any> = { createdAt: -1 };
    switch (sortBy) {
      case 'status':
        sortObj = { status: 1, createdAt: -1 };
        break;
      case 'priority':
        sortObj = { priority: -1, createdAt: -1 };
        break;
      case 'dueDate':
        sortObj = { followUpDate: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Fetch inquiries with pagination
    const inquiries = await Inquiry.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id tenantId propertyId ownerId status priority inquiryDate createdAt followUpDate'
      )
      .lean();

    // Fetch related user and property details
    const tenantIds = inquiries.map((i: any) => i.tenantId);
    const propertyIds = inquiries.map((i: any) => i.propertyId);
    const ownerIds = inquiries.map((i: any) => i.ownerId);

    const tenants = await User.find({ _id: { $in: tenantIds } })
      .select('_id username phone')
      .lean();
    const properties = await Property.find({ _id: { $in: propertyIds } })
      .select('_id title')
      .lean();
    const owners = await User.find({ _id: { $in: ownerIds } })
      .select('_id username')
      .lean();

    const tenantMap = new Map(tenants.map((t: any) => [t._id.toString(), t]));
    const propertyMap = new Map(properties.map((p: any) => [p._id.toString(), p]));
    const ownerMap = new Map(owners.map((o: any) => [o._id.toString(), o]));

    // Format response
    const formattedInquiries = inquiries.map((inquiry: any) => {
      const tenant = tenantMap.get(inquiry.tenantId.toString());
      const property = propertyMap.get(inquiry.propertyId.toString());
      const owner = ownerMap.get(inquiry.ownerId.toString());

      return {
        _id: inquiry._id.toString(),
        tenantId: inquiry.tenantId.toString(),
        tenantName: tenant?.username || 'Unknown',
        tenantPhone: tenant?.phone || 'N/A',
        propertyId: inquiry.propertyId.toString(),
        propertyTitle: property?.title || 'Unknown',
        ownerId: inquiry.ownerId.toString(),
        ownerName: owner?.username || 'Unknown',
        inquiryDate: inquiry.inquiryDate || inquiry.createdAt,
        inquiryTime: inquiry.createdAt
          ? new Date(inquiry.createdAt).toLocaleTimeString()
          : '00:00',
        status: inquiry.status || 'new_lead',
        statusHistory: [],
        visitScheduledDate: undefined,
        visitScheduledTime: undefined,
        visitNotes: undefined,
        callDoneDate: undefined,
        callDuration: undefined,
        callNotes: undefined,
        conversationLink: undefined,
        closureReason: undefined,
        bookingCreatedId: undefined,
        source: inquiry.source || 'app',
        followUpDate: inquiry.followUpDate,
        followUpReminder: false,
        priority: inquiry.priority || 'medium',
        tags: [],
      };
    });

    return NextResponse.json({
      leads: formattedInquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('[Admin Inquiries] Error:', error);
    logger.warn('[Admin Inquiries] Using mock data due to database error');
    
    // Return mock data as fallback
    return NextResponse.json({
      leads: mockInquiries,
      total: mockInquiries.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    }, { status: 200 });
  }
}
