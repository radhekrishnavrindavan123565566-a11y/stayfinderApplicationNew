import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = requireAuth(req);
    if (!auth) {
      return errorResponse("Unauthorized", 401);
    }
    const user = await User.findById(auth.userId).populate("wishlist", "title images price location");
    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
