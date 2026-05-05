import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getCityStats } from "@/lib/cityStats";

/**
 * GET  — compute & return price intelligence for a property (public)
 * POST — compute & persist price intelligence to the property document (owner/admin)
 */

async function computePriceIntelligence(propertyId: string) {
  const property = await Property.findById(propertyId).lean();
  if (!property) return null;

  const city = property.location?.city;
  const stats = await getCityStats(city);

  const avg = stats.avgPrice;
  const fairMin = Math.round(avg * 0.75);
  const fairMax = Math.round(avg * 1.25);

  let pricePosition: string;
  let percentageDiff: number;

  if (avg > 0) {
    percentageDiff = Math.round(((property.price - avg) / avg) * 100);
    if (property.price < avg * 0.85) pricePosition = "below_average";
    else if (property.price > avg * 1.15) pricePosition = "above_average";
    else pricePosition = "fair";
  } else {
    percentageDiff = 0;
    pricePosition = "fair";
  }

  return {
    cityAvgPrice: avg,
    medianPrice: stats.medianPrice,
    fairPriceRange: { min: fairMin, max: fairMax },
    pricePosition,
    percentageDiff,
    trend: stats.trend,
    totalListingsInCity: stats.totalListings,
    lastUpdated: new Date(),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const intelligence = await computePriceIntelligence(id);
    if (!intelligence) return errorResponse("Property not found", 404);

    return successResponse({ priceIntelligence: intelligence });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    const { id } = await params;

    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);

    const isOwner = property.ownerId.toString() === user?.userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) return errorResponse("Forbidden", 403);

    const intelligence = await computePriceIntelligence(id);
    if (!intelligence) return errorResponse("Could not compute price intelligence");

    property.priceIntelligence = intelligence;
    await property.save();

    return successResponse({ priceIntelligence: intelligence });
  } catch (error) {
    return handleApiError(error);
  }
}
