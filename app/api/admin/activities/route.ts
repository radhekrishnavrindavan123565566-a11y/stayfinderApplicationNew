import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { adminStore } from '@/lib/adminStore';

interface Activity {
  _id: string;
  type: 'property_posted' | 'inquiry_received' | 'booking_created' | 'payment_received' | 'user_joined' | 'review_posted' | 'dispute_raised';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

// In-memory activity log
let activities: Activity[] = [];

/**
 * GET /api/admin/activities
 * Get paginated list of activities
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const timeRange = searchParams.get('timeRange') || '';

    // Filter activities
    let filtered = [...activities];

    // Search filter
    if (search) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (type && type !== 'all') {
      filtered = filtered.filter((a) => a.type === type);
    }

    // Time range filter
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter((a) => {
        const activityTime = new Date(a.timestamp);
        const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);

        if (timeRange === 'today') return diffInHours < 24;
        if (timeRange === 'week') return diffInHours < 7 * 24;
        if (timeRange === 'month') return diffInHours < 30 * 24;
        return true;
      });
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      activities: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  } catch (error) {
    logger.error('[Admin Activities GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/activities
 * Log a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const newActivity: Activity = {
      _id: Date.now().toString(),
      type: body.type,
      title: body.title,
      description: body.description || '',
      metadata: body.metadata || {},
      timestamp: body.timestamp || new Date().toISOString(),
      severity: body.severity || 'low',
    };

    activities.unshift(newActivity);

    // Keep only last 1000 activities in memory
    if (activities.length > 1000) {
      activities = activities.slice(0, 1000);
    }

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    logger.error('[Admin Activities POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/activities
 * Clear all activities (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    activities = [];
    return NextResponse.json(
      { message: 'All activities cleared' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('[Admin Activities DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to clear activities' },
      { status: 500 }
    );
  }
}
