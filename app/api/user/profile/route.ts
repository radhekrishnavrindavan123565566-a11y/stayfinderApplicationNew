import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { username, avatar, verificationDoc } = await req.json();

    const updates: Record<string, unknown> = {};
    if (username?.trim()) updates.username = username.trim();
    if (avatar) updates.avatar = avatar;

    // Owner verification: if doc uploaded, mark as pending verification
    if (verificationDoc && user.role === "owner") {
      updates.verificationDoc = verificationDoc;
      updates.ownerVerified = false; // admin must approve
    }

    const updated = await User.findByIdAndUpdate(user.userId, updates, { new: true }).select("-password");
    if (!updated) return errorResponse("User not found", 404);

    return successResponse({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
