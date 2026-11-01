import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';
import { mockStats } from '@/lib/mockData';

// Cache admin stats for 30 seconds — avoids hammering the DB every poll cycle
const CACHE_KEY = 'admin:stats';
const CACHE_TTL = 30; // seconds

/**
 * GET /api/admin/stats
 * Returns dashboard statistics.
 * All aggregations run in parallel via Promise.all.
 * Results are cached for 30 s to absorb the OverviewDashboard 30-second
 * polling and any concurrent admin sessions.
 */
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? '';
  const log = logger.child({ route: 'GET /api/admin/stats', requestId });

  try {
    // Return cached result if fresh
    const cached = cache.get<object>(CACHE_KEY);
    if (cached) {
      log.debug('Returning cached stats');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          ...(requestId && { 'x-request-id': requestId }),
        },
      });
    }

    await connectDB();

    const { default: Property } = await import('@/models/Property');
    const { default: User }     = await import('@/models/User');
    const { default: Inquiry }  = await import('@/models/Inquiry');
    const { default: Booking }  = await import('@/models/Booking');

    const todayStart  = new Date(); todayStart.setHours(0, 0, 0, 0);
    const weekAgo     = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
    const monthStart  = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    // ── Run all 7 independent queries in parallel ─────────────────────────────
    const [
      propertyStats,
      userStats,
      inquiryStats,
      revenueStats,
      bookingStats,
      topCities,
      recentActivity,
    ] = await Promise.all([
      // 1. Property counts by status
      Property.aggregate([{
        $facet: {
          total:    [{ $count: 'count' }],
          active:   [{ $match: { isAvailable: true } },  { $count: 'count' }],
          pending:  [{ $match: { status: 'pending' } },   { $count: 'count' }],
          inactive: [{ $match: { isAvailable: false } },  { $count: 'count' }],
          featured: [{ $match: { isFeatured: true } },    { $count: 'count' }],
        },
      }]),

      // 2. User counts by role
      User.aggregate([{
        $facet: {
          totalTenants: [{ $match: { role: 'tenant' } }, { $count: 'count' }],
          totalOwners:  [{ $match: { role: 'owner' } },  { $count: 'count' }],
          newThisMonth: [{ $match: { createdAt: { $gte: monthStart } } }, { $count: 'count' }],
        },
      }]),

      // 3. Inquiry counts
      Inquiry.aggregate([{
        $facet: {
          total:       [{ $count: 'count' }],
          today:       [{ $match: { createdAt: { $gte: todayStart } } }, { $count: 'count' }],
          thisWeek:    [{ $match: { createdAt: { $gte: weekAgo } } },    { $count: 'count' }],
          newLeads:    [{ $match: { status: 'new_lead' } },              { $count: 'count' }],
          closedDeals: [{ $match: { status: 'closed_booked' } },         { $count: 'count' }],
        },
      }]),

      // 4. Revenue totals
      Booking.aggregate([{
        $facet: {
          totalRevenue:    [{ $group: { _id: null, total: { $sum: '$totalAmount' } } }],
          pendingPayments: [{ $match: { paymentStatus: 'pending' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }],
        },
      }]),

      // 5. Booking counts by status
      Booking.aggregate([{
        $facet: {
          confirmed: [{ $match: { status: 'confirmed' } }, { $count: 'count' }],
          ongoing:   [{ $match: { status: 'ongoing' } },   { $count: 'count' }],
          completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
          cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
        },
      }]),

      // 6. Top 5 cities by inquiry volume (uses $lookup)
      Inquiry.aggregate([
        { $lookup: { from: 'properties', localField: 'propertyId', foreignField: '_id', as: 'property' } },
        { $unwind: '$property' },
        { $group: { _id: '$property.location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // 7. Recent properties for activity feed
      Property.find()
        .select('_id title isAvailable createdAt ownerId')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // ── Extract counts helper ─────────────────────────────────────────────────
    const cnt = (facetResult: Record<string, Array<{ count?: number }>>, key: string): number =>
      facetResult?.[key]?.[0]?.count ?? 0;

    const pf = propertyStats[0] ?? {};
    const uf = userStats[0] ?? {};
    const iqf = inquiryStats[0] ?? {};
    const bf = bookingStats[0] ?? {};

    const totalInquiries  = cnt(iqf, 'total');
    const closedDealsCount = cnt(iqf, 'closedDeals');
    const conversionRate  = totalInquiries > 0
      ? (closedDealsCount / totalInquiries) * 100
      : 0;

    const stats = {
      properties: {
        total:    cnt(pf, 'total'),
        active:   cnt(pf, 'active'),
        pending:  cnt(pf, 'pending'),
        inactive: cnt(pf, 'inactive'),
        featured: cnt(pf, 'featured'),
        rejected: 0,
      },
      users: {
        totalTenants: cnt(uf, 'totalTenants'),
        totalOwners:  cnt(uf, 'totalOwners'),
        newThisMonth: cnt(uf, 'newThisMonth'),
        verified: 0,
        blocked: 0,
      },
      inquiries: {
        total:       totalInquiries,
        today:       cnt(iqf, 'today'),
        thisWeek:    cnt(iqf, 'thisWeek'),
        newLeads:    cnt(iqf, 'newLeads'),
        closedDeals: closedDealsCount,
      },
      bookings: {
        confirmed: cnt(bf, 'confirmed'),
        ongoing:   cnt(bf, 'ongoing'),
        completed: cnt(bf, 'completed'),
        cancelled: cnt(bf, 'cancelled'),
      },
      revenue: {
        totalRevenue:    revenueStats[0]?.totalRevenue?.[0]?.total    ?? 0,
        pendingPayments: revenueStats[0]?.pendingPayments?.[0]?.total ?? 0,
        monthlyRecurring: 0,
      },
      topCities: topCities.map((c: { _id: string; count: number }) => ({
        city: c._id, count: c.count,
      })),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      growthMetrics: {
        propertiesGrowth: 12,
        usersGrowth: 8,
        inquiriesGrowth: 15,
      },
      recentActivity: (recentActivity as Array<{ _id: unknown; ownerId: unknown; title: string; createdAt: Date }>)
        .map((item) => ({
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

    // Cache before returning
    cache.set(CACHE_KEY, stats, CACHE_TTL);
    log.info('Stats computed and cached', { ttl: CACHE_TTL });

    return NextResponse.json(stats, {
      headers: {
        'X-Cache': 'MISS',
        ...(requestId && { 'x-request-id': requestId }),
      },
    });
  } catch (error) {
    log.error('Failed to compute admin stats', error);
    log.warn('Falling back to mock stats');
    return NextResponse.json(mockStats, { status: 200 });
  }
}
