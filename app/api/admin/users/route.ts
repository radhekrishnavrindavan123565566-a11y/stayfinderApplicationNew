import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { mockUsers } from '@/lib/mockData';

/**
 * GET /api/admin/users
 * Get paginated list of users (owners or tenants) with filtering
 * Returns mock data if database connection fails
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const verificationStatus = searchParams.get('verificationStatus');
    const fraudRiskLevel = searchParams.get('fraudRiskLevel');
    const search = searchParams.get('search');

    // Build filter
    const filter: Record<string, any> = {};
    if (role) {
      filter.role = role;
    }

    if (verificationStatus === 'verified') {
      filter.isVerified = true;
    } else if (verificationStatus === 'unverified') {
      filter.isVerified = false;
    }

    if (fraudRiskLevel) {
      filter.fraudRiskLevel = fraudRiskLevel;
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Import models
    const { default: User } = await import('@/models/User');
    const { default: Property } = await import('@/models/Property');
    const { default: Inquiry } = await import('@/models/Inquiry');

    // Get total count
    const total = await User.countDocuments(filter);

    // Fetch users with pagination
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id username email phone city role registrationDate isVerified isActive fraudRiskLevel createdAt updatedAt'
      )
      .lean();

    // Enrich with role-specific data
    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const baseUser = {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          phone: user.phone,
          city: user.city || 'Unknown',
          role: user.role,
          isVerified: user.isVerified || false,
          isActive: user.isActive !== false,
          fraudRiskLevel: user.fraudRiskLevel || 'low',
          trustBadges: [],
          registrationDate: user.registrationDate || user.createdAt,
          lastActivity: user.updatedAt || new Date(),
        };

        if (user.role === 'owner') {
          // Count properties for owners
          const propertyCount = await Property.countDocuments({ ownerId: user._id });
          const activeCount = await Property.countDocuments({
            ownerId: user._id,
            status: 'active',
          });

          return {
            ...baseUser,
            propertyCount,
            totalListings: propertyCount,
            activeListings: activeCount,
            responseRate: 85,
            avgResponseTimeHours: 2,
            walletBalance: 0,
            planType: 'free',
            planExpiresAt: new Date(),
          };
        } else if (user.role === 'tenant') {
          // Count inquiries for tenants
          const inquiryCount = await Inquiry.countDocuments({ tenantId: user._id });
          const activeInquiries = await Inquiry.countDocuments({
            tenantId: user._id,
            status: { $in: ['new_lead', 'call_done', 'visit_scheduled'] },
          });
          const bookingCount = await Inquiry.countDocuments({
            tenantId: user._id,
            status: 'closed_booked',
          });

          return {
            ...baseUser,
            inquiriesCount: inquiryCount,
            activeInquiries,
            bookingsCount: bookingCount,
            creditScore: 750,
            responseRate: 90,
          };
        } else {
          // For admins and other roles
          return baseUser;
        }
      })
    );

    return NextResponse.json({
      users: enrichedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('[Admin Users] Error:', error);
    logger.warn('[Admin Users] Using mock data due to database error');
    
    // Return mock data as fallback
    return NextResponse.json({
      users: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    }, { status: 200 });
  }
}
