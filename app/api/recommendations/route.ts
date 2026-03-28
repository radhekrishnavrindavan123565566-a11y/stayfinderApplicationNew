import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Get user's booking history to find preferred cities/types
    const pastBookings = await Booking.find({ tenantId: userId })
      .populate("propertyId", "location propertyType price")
      .limit(10)
      .lean();

    const preferredCities = new Set<string>();
    const preferredTypes = new Set<string>();
    let avgBudget = 0;
    let budgetCount = 0;

    for (const b of pastBookings) {
      const prop = b.propertyId as { location?: { city?: string }; propertyType?: string; price?: number } | null;
      if (prop?.location?.city) preferredCities.add(prop.location.city);
      if (prop?.propertyType) preferredTypes.add(prop.propertyType);
      if (prop?.price) { avgBudget += prop.price; budgetCount++; }
    }

    if (budgetCount > 0) avgBudget = avgBudget / budgetCount;

    // Build recommendation query
    const query: Record<string, unknown> = { isAvailable: true };

    if (preferredCities.size > 0) {
      query["location.city"] = { $in: Array.from(preferredCities) };
    }
    if (preferredTypes.size > 0) {
      query.propertyType = { $in: Array.from(preferredTypes) };
    }
    if (avgBudget > 0) {
      query.price = { $lte: avgBudget * 1.5 };
    }

    let recommendations = await Property.find(query)
      .sort({ isBoosted: -1, averageRating: -1 })
      .limit(limit)
      .lean();

    // Fallback: if not enough results, fill with top-rated
    if (recommendations.length < limit) {
      const existingIds = recommendations.map((p) => p._id);
      const fallback = await Property.find({
        isAvailable: true,
        _id: { $nin: existingIds },
      })
        .sort({ isBoosted: -1, averageRating: -1 })
        .limit(limit - recommendations.length)
        .lean();
      recommendations = [...recommendations, ...fallback];
    }

    return successResponse({ recommendations, basedOn: { cities: Array.from(preferredCities), types: Array.from(preferredTypes) } });
  } catch (error) {
    return handleApiError(error);
  }
}
