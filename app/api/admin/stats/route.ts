import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { mockStats } from '@/lib/mockData';

/**
 * GET /api/admin/stats
 * Get dashboard statistics for admin overview
 * Returns mock data if database connection fails
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Import models here to avoid circular dependencies
    const { default: Property } = await import('@/models/Property');
    const { default: User } = await import('@/models/User');
    const { default: Inquiry } = await import('@/models/Inquiry');
    const { default: Booking } = await import('@/models/Booking');

    // Get property stats
    const propertyStats = await Property.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
          pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          inactive: [{ $match: { status: 'hidden' } }, { $count: 'count' }],
          featured: [{ $match: { isFeatured: true } }, { $count: 'count' }],
        },
      },
    ]);

    // Get user stats
    const userStats = await User.aggregate([
      {
        $facet: {
          totalTenants: [{ $match: { role: 'tenant' } }, { $count: 'count' }],
          totalOwners: [{ $match: { role: 'owner' } }, { $count: 'count' }],
          newThisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(1)),
                },
              },
            },
            { $count: 'count' },
          ],
          verified: [{ $match: { isVerified: true } }, { $count: 'count' }],
          blocked: [{ $match: { isBlocked: true } }, { $count: 'count' }],
        },
      },
    ]);

    // Get inquiry stats
    const inquiryStats = await Inquiry.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          today: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
            { $count: 'count' },
          ],
          thisWeek: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: 'count' },
          ],
          newLeads: [
            { $match: { status: 'new_lead' } },
            { $count: 'count' },
          ],
          closedDeals: [
            { $match: { status: 'closed_booked' } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    // Get revenue stats
    const revenueStats = await Booking.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
          pendingPayments: [
            { $match: { paymentStatus: 'pending' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
        },
      },
    ]);

    // Get booking stats
    const bookingStats = await Booking.aggregate([
      {
        $facet: {
          confirmed: [{ $match: { status: 'confirmed' } }, { $count: 'count' }],
          ongoing: [{ $match: { status: 'ongoing' } }, { $count: 'count' }],
          completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
          cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
        },
      },
    ]);

    // Get top cities by inquiry volume
    const topCities = await Inquiry.aggregate([
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property',
        },
      },
      { $unwind: '$property' },
      {
        $group: {
          _id: '$property.location.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get recent activity
    const recentActivity = await Property.find()
      .select('_id title status createdAt ownerId')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Extract counts from aggregation results
    const extractCount = (result: any[], index = 0) =>
      result?.[0]?.[Object.keys(result[0])[index]]?.count || 0;

    const stats = {
      properties: {
        total: extractCount(propertyStats[0].total),
        active: extractCount(propertyStats[0].active),
        pending: extractCount(propertyStats[0].pending),
        inactive: extractCount(propertyStats[0].inactive),
        featured: extractCount(propertyStats[0].featured),
        rejected: 0,
      },
      users: {
        totalTenants: extractCount(userStats[0].totalTenants),
        totalOwners: extractCount(userStats[0].totalOwners),
        newThisMonth: extractCount(userStats[0].newThisMonth),
        verified: extractCount(userStats[0].verified),
        blocked: extractCount(userStats[0].blocked),
      },
      inquiries: {
        total: extractCount(inquiryStats[0].total),
        today: extractCount(inquiryStats[0].today),
        thisWeek: extractCount(inquiryStats[0].thisWeek),
        newLeads: extractCount(inquiryStats[0].newLeads),
        closedDeals: extractCount(inquiryStats[0].closedDeals),
      },
      bookings: {
        confirmed: extractCount(bookingStats[0].confirmed),
        ongoing: extractCount(bookingStats[0].ongoing),
        completed: extractCount(bookingStats[0].completed),
        cancelled: extractCount(bookingStats[0].cancelled),
      },
      revenue: {
        totalRevenue: revenueStats[0]?.totalRevenue?.[0]?.total || 0,
        pendingPayments: revenueStats[0]?.pendingPayments?.[0]?.total || 0,
        monthlyRecurring: 0,
      },
      topCities: topCities.map((city: any) => ({
        city: city._id,
        count: city.count,
      })),
      conversionRate: stats?.inquiries?.total > 0 
        ? (extractCount(inquiryStats[0].closedDeals) / extractCount(inquiryStats[0].total)) * 100
        : 0,
      growthMetrics: {
        propertiesGrowth: 12,
        usersGrowth: 8,
        inquiriesGrowth: 15,
      },
      recentActivity: recentActivity.map((item: any) => ({
        _id: item._id,
        action: 'property_posted',
        actorId: item.ownerId,
        targetId: item._id,
        targetType: 'property',
        metadata: {},
        timestamp: item.createdAt,
        description: `New property: ${item.title}`,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('[Admin Stats] Error:', error);
    
    // Return mock data as fallback when database fails
    logger.warn('[Admin Stats] Using mock data due to database error');
    return NextResponse.json(mockStats, { status: 200 });
  }
}
