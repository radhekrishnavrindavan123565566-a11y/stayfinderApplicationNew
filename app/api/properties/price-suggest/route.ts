import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const propertyType = searchParams.get("type");

    if (!city) return errorResponse("city is required");

    const query: Record<string, unknown> = { "location.city": { $regex: city, $options: "i" }, isAvailable: true };
    if (propertyType) query.propertyType = propertyType;

    const similar = await Property.find(query).select("price averageRating").limit(20).lean();

    if (similar.length === 0) {
      return successResponse({ suggested: null, message: "Not enough data for this location" });
    }

    const prices = similar.map((p) => p.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];

    // Weight by rating — higher rated properties command higher prices
    const topRated = similar.filter((p) => p.averageRating >= 4);
    const premiumAvg = topRated.length > 0
      ? topRated.reduce((a, b) => a + b.price, 0) / topRated.length
      : avg;

    const suggested = Math.round((median + premiumAvg) / 2);

    return successResponse({
      suggested,
      range: { min: Math.round(min), max: Math.round(max) },
      avg: Math.round(avg),
      median: Math.round(median),
      sampleSize: similar.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
