import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { username, avatar, verificationDoc, phone } = await req.json();

    const updates: Record<string, unknown> = {};
    if (username?.trim()) updates.username = username.trim();
    if (avatar) updates.avatar = avatar;
    if (phone?.trim()) updates.phone = phone.trim();

    // Owner verification
    if (verificationDoc && user.role === "owner") {
      updates.verificationDoc = verificationDoc;
      updates.ownerVerified = false;
    }

    const updated = await User.findByIdAndUpdate(user.userId, updates, { new: true }).select("-password");
    if (!updated) return errorResponse("User not found", 404);

    return successResponse({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
