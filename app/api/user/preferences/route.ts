import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPreferences from "@/models/UserPreferences";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    let prefs = await UserPreferences.findOne({ userId: user.userId });
    if (!prefs) {
      prefs = await UserPreferences.create({
        userId: user.userId,
        budget: { min: 0, max: 0 },
        preferredBedrooms: 1,
        preferredAmenities: [],
        preferredCities: [],
        tenantType: "professional",
      });
    }
    return successResponse({ preferences: prefs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await req.json();
    const { budget, preferredBedrooms, preferredAmenities, preferredCities, tenantType } = body;

    const update: Record<string, unknown> = {};
    if (budget !== undefined) update.budget = budget;
    if (preferredBedrooms !== undefined) update.preferredBedrooms = preferredBedrooms;
    if (preferredAmenities !== undefined) update.preferredAmenities = preferredAmenities;
    if (preferredCities !== undefined) update.preferredCities = preferredCities;
    if (tenantType !== undefined) update.tenantType = tenantType;

    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: user.userId },
      { $set: update },
      { upsert: true, new: true }
    );
    return successResponse({ preferences: prefs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { savedSearch } = await req.json();
    if (!savedSearch) return successResponse({});
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: user.userId },
      { $push: { savedSearches: savedSearch } },
      { upsert: true, new: true }
    );
    return successResponse({ preferences: prefs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (body.savedSearches !== undefined) update.savedSearches = body.savedSearches;
    if (body.budget !== undefined) update.budget = body.budget;
    if (body.preferredBedrooms !== undefined) update.preferredBedrooms = body.preferredBedrooms;
    if (body.preferredAmenities !== undefined) update.preferredAmenities = body.preferredAmenities;
    if (body.preferredCities !== undefined) update.preferredCities = body.preferredCities;
    if (body.tenantType !== undefined) update.tenantType = body.tenantType;
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: user.userId },
      { $set: update },
      { upsert: true, new: true }
    );
    return successResponse({ preferences: prefs });
  } catch (error) {
    return handleApiError(error);
  }
}
