import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { emit } from "@/lib/chatEvents";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { conversationId } = await req.json();
    if (!conversationId) return errorResponse("conversationId required");

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
      const senderIds = [...new Set(updated.map((m) => m.senderId.toString()))];
      senderIds.forEach((senderId) => {
        emit(senderId, "message:seen", { conversationId });
      });
    }

    // Delete message notifications for this conversation so bell clears
    await Notification.deleteMany({
      userId: user.userId,
      type: "message",
      link: `/chat?conversation=${conversationId}`,
    });

    // Tell the client to remove these notifications from the store
    emit(user.userId, "notification:clear_conversation", { conversationId });

    return successResponse({ updated: updated.length });
  } catch (e) {
    return handleApiError(e);
  }
}
