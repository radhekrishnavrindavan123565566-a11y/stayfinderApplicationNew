import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { connectDB } from "@/lib/mongodb";
import { assessFraudRisk, computeProfileCompleteness } from "@/lib/trust";
import { IUser } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const caller = requireAuth(req);
    if (!caller) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return errorResponse("userId is required", 400);

    await connectDB();
    const User = (await import("@/models/User")).default;
    const user = await User.findById(userId).lean<IUser & { _id: string }>();
    if (!user) return errorResponse("User not found", 404);

    const profileCompleteness = computeProfileCompleteness(user);
    const badges: string[] = (user as IUser).trustBadges ?? [];

    const isAdmin = caller.role === "admin";
    const fraudResult = await assessFraudRisk(userId);

    if (isAdmin) {
      return successResponse({
        level: fraudResult.level,
        signals: fraudResult.signals,
        profileCompleteness,
        badges,
      });
    }

    return successResponse({
      level: fraudResult.level,
      profileCompleteness,
      badges,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
