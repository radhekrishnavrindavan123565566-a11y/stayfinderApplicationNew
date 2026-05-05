import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RoommateProfile from "@/models/RoommateProfile";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// GET — list roommate profiles with matching score
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const maxBudget = searchParams.get("maxBudget");
    const gender = searchParams.get("gender");
    const occupation = searchParams.get("occupation");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };
    if (city) query.city = { $regex: city, $options: "i" };
    if (maxBudget) query["budget.min"] = { $lte: parseInt(maxBudget) };
    if (gender && gender !== "any") query.lookingFor = { $in: [gender, "any"] };
    if (occupation) query.occupation = occupation;

    const profiles = await RoommateProfile.find(query)
      .populate("userId", "username avatar createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return successResponse({ profiles, total: profiles.length });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — create or update own profile (tenants only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    if (user.role === "owner") {
      return errorResponse("Property owners cannot create a roommate profile. Only tenants can look for roommates.", 403);
    }

    const body = await req.json();

    if (!body.city || !body.budget?.min || !body.budget?.max || !body.moveInDate || !body.gender) {
      return errorResponse("city, budget, moveInDate and gender are required");
    }

    const profile = await RoommateProfile.findOneAndUpdate(
      { userId: user.userId },
      { ...body, userId: user.userId, isActive: true },
      { upsert: true, new: true, runValidators: true }
    );

    return successResponse({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — deactivate profile
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    await RoommateProfile.findOneAndUpdate({ userId: user.userId }, { isActive: false });
    return successResponse({ message: "Profile deactivated" });
  } catch (error) {
    return handleApiError(error);
  }
}
