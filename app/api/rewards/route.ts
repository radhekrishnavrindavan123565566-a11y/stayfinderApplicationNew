import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserReward from "@/models/UserReward";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    let reward = await UserReward.findOne({ userId: user.userId });
    
    if (!reward) {
      // Create initial reward profile
      const referralCode = `NEST${user.userId.toString().slice(-6).toUpperCase()}`;
      reward = await UserReward.create({
        userId: user.userId,
        referralCode,
        points: 0,
        level: 1,
      });
    }

    return successResponse({ reward });
  } catch (error) {
    return handleApiError(error);
  }
}
