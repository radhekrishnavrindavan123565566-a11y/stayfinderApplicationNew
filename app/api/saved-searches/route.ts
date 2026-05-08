import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const searches = await SavedSearch.find({ userId: user.userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ searches });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { name, filters, alertEnabled, alertFrequency } = await req.json();

    const search = await SavedSearch.create({
      userId: user.userId,
      name,
      filters,
      alertEnabled: alertEnabled !== false,
      alertFrequency: alertFrequency || "daily",
      matchCount: 0,
    });

    return successResponse({ search }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
