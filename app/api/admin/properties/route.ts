import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logger } from '@/lib/logger';
import { mockProperties } from '@/lib/mockData';

/**
 * GET /api/admin/properties
 * Get paginated list of properties with filtering and sorting
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
    const city = searchParams.get('city');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search');

    // Build filter
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    // Import Property model
    const { default: Property } = await import('@/models/Property');
    const { default: User } = await import('@/models/User');

    // Get total count
    const total = await Property.countDocuments(filter);

    // Build sort object
    let sortObj: Record<string, any> = { createdAt: -1 };
    switch (sortBy) {
      case 'views':
        sortObj = { views: -1 };
        break;
      case 'price':
        sortObj = { price: 1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Fetch properties with pagination
    const properties = await Property.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '_id title description price bedrooms bathrooms location ownerId status images isVerified viewCount averageRating totalReviews createdAt updatedAt'
      )
      .lean();

    // Fetch owner details
    const ownerIds = properties.map((p: any) => p.ownerId);
    const owners = await User.find({ _id: { $in: ownerIds } })
      .select('_id username email')
      .lean();

    const ownerMap = new Map(owners.map((o: any) => [o._id.toString(), o]));

    // Format response
    const formattedProperties = properties.map((property: any) => {
      const owner = ownerMap.get(property.ownerId.toString());
      return {
        _id: property._id.toString(),
        title: property.title,
        location: property.location || { address: '', city: '', state: '' },
        propertyType: property.propertyType || 'Apartment',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        price: property.price || 0,
        ownerId: property.ownerId.toString(),
        ownerName: owner?.username || 'Unknown',
        status: property.status || 'pending',
        images: property.images || [],
        isVerified: property.isVerified || false,
        viewCount: property.viewCount || 0,
        averageRating: property.averageRating || 0,
        totalReviews: property.totalReviews || 0,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    });

    return NextResponse.json({
      properties: formattedProperties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('[Admin Properties] Error:', error);
    logger.warn('[Admin Properties] Using mock data due to database error');
    
    // Return mock data as fallback
    return NextResponse.json({
      properties: mockProperties,
      total: mockProperties.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    }, { status: 200 });
  }
}
