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
    const { receiverId, content, type = "text", mediaUrl, propertyId } = await req.json();

    if (!receiverId) return errorResponse("receiverId is required");
    if (!content && !mediaUrl) return errorResponse("content or mediaUrl is required");

    const ids = [user.userId, receiverId].sort();
    const conversationId = ids.join("_");

    const message = await Message.create({
      conversationId,
      senderId: user.userId,
      receiverId,
      propertyId: propertyId || undefined,
      content: content || "",
      type,
      mediaUrl,
      status: "sent",
    });

    const populated = await message.populate("senderId", "username avatar");
    const msgObj = populated.toObject();

    // Emit to receiver in real-time
    emit(receiverId, "message:new", { message: msgObj });
    // Emit delivered status back to sender
    emit(user.userId, "message:status", { messageId: message._id.toString(), status: "delivered" });

    return successResponse({ message: msgObj }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
