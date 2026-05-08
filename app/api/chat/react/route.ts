import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { emit } from "@/lib/chatEvents";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { messageId, emoji } = await req.json();
    if (!messageId || !emoji) return errorResponse("messageId and emoji are required");

    const message = await Message.findById(messageId);
    if (!message) return errorResponse("Message not found", 404);

    const existingIdx = message.reactions.findIndex(
      (r: { userId: { toString: () => string } }) => r.userId.toString() === user.userId
    );

    if (existingIdx >= 0) {
      if (message.reactions[existingIdx].emoji === emoji) {
        // Toggle off — remove reaction
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions[existingIdx].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId: user.userId, emoji });
    }

    await message.save();

    // Broadcast reaction update to the other participant in real-time
    const otherId =
      message.senderId.toString() === user.userId
        ? message.receiverId.toString()
        : message.senderId.toString();

    const reactionPayload = {
      messageId,
      conversationId: message.conversationId,
      reactions: message.reactions,
    };

    emit(otherId, "message:reaction", reactionPayload);
    // Also update sender's own view (other tabs)
    emit(user.userId, "message:reaction", reactionPayload);

    return successResponse({ reactions: message.reactions });
  } catch (error) {
    return handleApiError(error);
  }
}
