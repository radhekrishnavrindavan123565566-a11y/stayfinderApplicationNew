import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import TypingEvent from "@/models/TypingEvent";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { receiverId, conversationId, isTyping } = await req.json();

    if (isTyping) {
      // Upsert typing indicator with 4-second TTL
      await TypingEvent.findOneAndUpdate(
        { conversationId, senderId: user.userId },
        {
          conversationId,
          senderId: user.userId,
          receiverId,
          isTyping: true,
          expiresAt: new Date(Date.now() + 4000),
        },
        { upsert: true, new: true }
      );
    } else {
      await TypingEvent.deleteOne({ conversationId, senderId: user.userId });
    }

    return successResponse({});
  } catch (e) {
    return handleApiError(e);
  }
}
