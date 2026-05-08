import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PropertyActivity from "@/models/PropertyActivity";
import Property from "@/models/Property";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Public read is intentional for live activity ticker on homepage
    // but we rate-limit by only returning last 5 minutes of data
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // cap at 50

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const query: { createdAt: { $gte: Date }; propertyId?: string } = {
      createdAt: { $gte: fiveMinutesAgo },
    };
    if (propertyId) query.propertyId = propertyId;

    const activities = await PropertyActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("propertyId", "title location")
      .populate("userId", "username")
      .lean();

    const stats = await PropertyActivity.aggregate([
      { $match: { createdAt: { $gte: fiveMinutesAgo } } },
      { $group: { _id: "$activityType", count: { $sum: 1 } } },
    ]);

    return successResponse({ activities, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { propertyId, activityType, metadata } = await req.json();

    // Only allow known activity types to prevent data pollution
    const ALLOWED_TYPES = ["view", "wishlist", "booking_started", "share"];
    if (!activityType || !ALLOWED_TYPES.includes(activityType)) {
      const { errorResponse } = await import("@/lib/apiResponse");
      return errorResponse("Invalid activityType", 400);
    }
    if (!propertyId) {
      const { errorResponse } = await import("@/lib/apiResponse");
      return errorResponse("propertyId is required", 400);
    }

    // Attach userId if authenticated (optional — anonymous views are allowed)
    const user = authenticateRequest(req);

    const activity = await PropertyActivity.create({
      propertyId,
      activityType,
      metadata,
      ...(user ? { userId: user.userId } : {}),
    });

    if (activityType === "view") {
      await Property.findByIdAndUpdate(propertyId, { $inc: { viewCount: 1 } });
    }

    return successResponse({ activity }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
