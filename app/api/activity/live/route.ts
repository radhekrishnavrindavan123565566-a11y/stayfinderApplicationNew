import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PropertyActivity from "@/models/PropertyActivity";
import Property from "@/models/Property";
import User from "@/models/User";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get recent activity
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

    // Get aggregated stats
    const stats = await PropertyActivity.aggregate([
      { $match: { createdAt: { $gte: fiveMinutesAgo } } },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
        },
      },
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

    const activity = await PropertyActivity.create({
      propertyId,
      activityType,
      metadata,
    });

    // Update property view count if it's a view
    if (activityType === "view") {
      await Property.findByIdAndUpdate(propertyId, { $inc: { viewCount: 1 } });
    }

    return successResponse({ activity }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
