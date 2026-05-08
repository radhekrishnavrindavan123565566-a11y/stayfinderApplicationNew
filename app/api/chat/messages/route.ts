import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 30;

    if (!conversationId) return errorResponse("conversationId is required");

    const [uid1, uid2] = conversationId.split("_");
    if (uid1 !== user.userId && uid2 !== user.userId) return errorResponse("Forbidden", 403);

    const total = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .populate("senderId", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Mark delivered/seen
    await Message.updateMany(
      { conversationId, receiverId: user.userId, status: { $in: ["sent", "delivered"] } },
      { status: "seen", read: true }
    );

    return successResponse({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
