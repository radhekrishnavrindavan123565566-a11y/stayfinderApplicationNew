import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SavedSearch from "@/models/SavedSearch";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const searches = await SavedSearch.find({ userId: user.userId, isActive: true })
      .sort({ createdAt: -1 }).lean();
    return successResponse({ searches });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { name, filters } = await req.json();
    if (!name?.trim()) return errorResponse("Name is required");
    if (!filters || Object.keys(filters).length === 0) return errorResponse("At least one filter is required");

    const search = await SavedSearch.create({ userId: user.userId, name, filters });
    return successResponse({ search }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("id is required");
    await SavedSearch.findOneAndUpdate({ _id: id, userId: user.userId }, { isActive: false });
    return successResponse({ message: "Deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
