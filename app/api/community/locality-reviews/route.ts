import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LocalityReview from "@/models/LocalityReview";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req); // must be logged in to browse locality reviews
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    if (!city || !locality) return errorResponse("city and locality required");

    const reviews = await LocalityReview.find({ city, locality })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .limit(20);

    // Aggregate averages
    const avg: Record<string, number> = reviews.reduce(
      (acc: Record<string, number>, r) => {
        acc.safety += r.ratings.safety;
        acc.connectivity += r.ratings.connectivity;
        acc.amenities += r.ratings.amenities;
        acc.cleanliness += r.ratings.cleanliness;
        acc.overall += r.ratings.overall;
        return acc;
      },
      { safety: 0, connectivity: 0, amenities: 0, cleanliness: 0, overall: 0 }
    );
    const count = reviews.length;
    const averages = count > 0
      ? Object.fromEntries(Object.entries(avg).map(([k, v]) => [k, Math.round(((v as number) / count) * 10) / 10]))
      : null;

    return successResponse({ reviews, averages, count });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { city, locality, ratings, comment } = await req.json();
    if (!city || !locality || !ratings) return errorResponse("Missing required fields");

    // One review per user per locality
    const existing = await LocalityReview.findOne({ userId: user.userId, city, locality });
    if (existing) {
      Object.assign(existing, { ratings, comment });
      await existing.save();
      return successResponse({ review: existing });
    }

    const review = await LocalityReview.create({ userId: user.userId, city, locality, ratings, comment });
    return successResponse({ review }, 201);
  } catch (e) { return handleApiError(e); }
}
