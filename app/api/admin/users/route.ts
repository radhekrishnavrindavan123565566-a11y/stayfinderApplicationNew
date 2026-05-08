import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    const users = await User.find().sort({ createdAt: -1 });
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
