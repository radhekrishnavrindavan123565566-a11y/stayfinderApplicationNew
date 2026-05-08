import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return errorResponse("Notification not found", 404);
    return successResponse({ notification: notif });
  } catch (error) {
    return handleApiError(error);
  }
}
