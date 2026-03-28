import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { emit } from "@/lib/chatEvents";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { conversationId } = await req.json();
    if (!conversationId) return errorResponse("conversationId required");

    // Find messages sent to me that are unread
    const updated = await Message.find({
      conversationId,
      receiverId: user.userId,
      status: { $ne: "seen" },
    }).select("_id senderId");

    if (updated.length > 0) {
      await Message.updateMany(
        { conversationId, receiverId: user.userId, status: { $ne: "seen" } },
        { status: "seen", read: true }
      );
      // Notify each sender their messages were seen
      const senderIds = [...new Set(updated.map((m) => m.senderId.toString()))];
      senderIds.forEach((senderId) => {
        emit(senderId, "message:seen", { conversationId });
      });
    }

    return successResponse({ updated: updated.length });
  } catch (e) {
    return handleApiError(e);
  }
}
