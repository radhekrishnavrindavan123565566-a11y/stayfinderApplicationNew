import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

/**
 * Fetch multiple properties by IDs
 * GET /api/properties/bulk?ids=id1,id2,id3
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids")?.split(",") || [];

    if (ids.length === 0) {
      return errorResponse("No IDs provided");
    }

    // Maximum 10 properties per request
    if (ids.length > 10) {
      return errorResponse("Maximum 10 properties per request");
    }

    const properties = await Property.find({ _id: { $in: ids } })
      .populate("ownerId", "username avatar email")
      .lean();

    if (properties.length === 0) {
      return errorResponse("No properties found", 404);
    }

    return successResponse({ properties, count: properties.length });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST endpoint for creating comparison
 * POST /api/properties/bulk
 * Body: { propertyIds: string[], name: string }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { propertyIds } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return errorResponse("propertyIds array is required");
    }

    if (propertyIds.length > 10) {
      return errorResponse("Maximum 10 properties per comparison");
    }

    const properties = await Property.find({ _id: { $in: propertyIds } })
      .populate("ownerId", "username avatar email")
      .lean();

    if (properties.length === 0) {
      return errorResponse("No properties found", 404);
    }

    // Return comparison data
    const comparisonData = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      amenities: p.amenities,
      location: p.location,
      averageRating: p.averageRating,
      images: p.images,
      propertyType: p.propertyType,
    }));

    return successResponse({
      comparison: comparisonData,
      count: comparisonData.length,
      createdAt: new Date(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
