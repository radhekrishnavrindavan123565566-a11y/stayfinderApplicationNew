import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserReward from "@/models/UserReward";
import User from "@/models/User";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const period = searchParams.get("period") || "all"; // all, month, week

    let dateFilter = {};
    if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { updatedAt: { $gte: monthAgo } };
    } else if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { updatedAt: { $gte: weekAgo } };
    }

    const rewards = await UserReward.find(dateFilter)
      .sort({ points: -1 })
      .limit(50)
      .populate("userId", "username avatar email")
      .lean();

    // Filter by city if provided
    let leaderboard = rewards;
    if (city) {
      // Would need to join with user location data
      leaderboard = rewards; // Simplified for now
    }

    return successResponse({ leaderboard });
  } catch (error) {
    return handleApiError(error);
  }
}
