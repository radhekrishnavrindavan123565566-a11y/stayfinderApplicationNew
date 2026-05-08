import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = requireAuth(req);
    if (!auth) throw new Error("Unauthorized");
    const user = await User.findById(auth.userId).populate("wishlist", "title images price location");
    if (!user) throw new Error("Not Found");
    return successResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
