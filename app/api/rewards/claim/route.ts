import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserReward from "@/models/UserReward";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, errorResponse } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { achievementType } = await req.json();

    const reward = await UserReward.findOne({ userId: user.userId });
    if (!reward) {
      return errorResponse("Reward profile not found", 404);
    }

    let pointsEarned = 0;
    let badge = null;

    switch (achievementType) {
      case "profile_complete":
        if (!reward.achievements.profileCompleted) {
          pointsEarned = 100;
          reward.achievements.profileCompleted = true;
          badge = {
            id: "profile_master",
            name: "Profile Master",
            description: "Completed your profile 100%",
            icon: "👤",
            category: "social" as const,
          };
        }
        break;
      case "first_booking":
        if (!reward.achievements.firstBooking) {
          pointsEarned = 200;
          reward.achievements.firstBooking = true;
          badge = {
            id: "first_home",
            name: "First Home",
            description: "Made your first booking",
            icon: "🏠",
            category: "tenant" as const,
          };
        }
        break;
      case "identity_verified":
        if (!reward.achievements.identityVerified) {
          pointsEarned = 150;
          reward.achievements.identityVerified = true;
          badge = {
            id: "verified_user",
            name: "Verified User",
            description: "Identity verified successfully",
            icon: "✓",
            category: "social" as const,
          };
        }
        break;
      default:
        return errorResponse("Invalid achievement type", 400);
    }

    if (pointsEarned > 0) {
      reward.points += pointsEarned;
      reward.level = Math.floor(reward.points / 500) + 1;
      
      if (badge) {
        reward.badges.push({ ...badge, earnedAt: new Date() });
      }

      await reward.save();

      return successResponse({
        message: "Achievement unlocked!",
        pointsEarned,
        badge,
        newLevel: reward.level,
        totalPoints: reward.points,
      });
    }

    return errorResponse("Achievement already claimed", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
