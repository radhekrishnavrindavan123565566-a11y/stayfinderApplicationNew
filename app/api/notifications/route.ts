import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const notifications = await Notification.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: user.userId, read: false });
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    await Notification.updateMany({ userId: user.userId, read: false }, { read: true });
    return successResponse({ message: "All notifications marked as read" });
  } catch (error) {
    return handleApiError(error);
  }
}
