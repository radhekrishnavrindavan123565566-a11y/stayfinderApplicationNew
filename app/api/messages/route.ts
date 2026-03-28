import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return errorResponse("conversationId is required");

    const [uid1, uid2] = conversationId.split("_");
    if (uid1 !== user.userId && uid2 !== user.userId) return errorResponse("Forbidden", 403);

    const messages = await Message.find({ conversationId })
      .populate("senderId", "username avatar")
      .sort({ createdAt: 1 });

    await Message.updateMany({ conversationId, receiverId: user.userId, read: false }, { read: true });
    return successResponse({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { receiverId, propertyId, content } = await req.json();
    if (!receiverId || !content) return errorResponse("receiverId and content are required");

    const ids = [user.userId, receiverId].sort();
    const conversationId = ids.join("_");

    const message = await Message.create({
      conversationId,
      senderId: user.userId,
      receiverId,
      propertyId,
      content,
    });

    return successResponse({ message }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
