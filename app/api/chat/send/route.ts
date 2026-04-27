import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import User from "@/models/User";
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

    // Emit message to receiver in real-time
    emit(receiverId, "message:new", { message: msgObj });
    // Emit delivered status back to sender
    emit(user.userId, "message:status", { messageId: message._id.toString(), status: "delivered" });

    // Create a notification for the receiver
    const sender = await User.findById(user.userId).select("username").lean();
    const senderName = (sender as { username?: string })?.username || "Someone";
    const notifBody = type === "image" ? "📷 Sent an image" : (content?.slice(0, 60) || "New message");

    const notif = await Notification.create({
      userId: receiverId,
      type: "message",
      title: `New message from ${senderName}`,
      body: notifBody,
      link: `/chat?conversation=${conversationId}`,
      data: { conversationId, senderId: user.userId },
    });

    // Emit notification to receiver in real-time via SSE
    emit(receiverId, "notification:new", { notification: notif.toObject() });

    // Update owner response rate if receiver is an owner
    const receiver = await User.findById(receiverId).select("role responseRate avgResponseTimeHours").lean();
    if (receiver && (receiver as { role: string }).role === "owner") {
      // Find the first message in this conversation sent TO the owner
      const firstInquiry = await Message.findOne({
        conversationId,
        receiverId,
        senderId: { $ne: receiverId },
      }).sort({ createdAt: 1 }).lean();

      if (firstInquiry) {
        const responseTimeMs = Date.now() - new Date((firstInquiry as { createdAt: Date }).createdAt).getTime();
        const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
        // Rolling average
        const prev = (receiver as { avgResponseTimeHours?: number }).avgResponseTimeHours || responseTimeHours;
        const newAvg = Math.round((prev * 0.7 + responseTimeHours * 0.3) * 10) / 10;
        await User.findByIdAndUpdate(receiverId, {
          $set: { avgResponseTimeHours: newAvg, responseRate: 95 }, // simplified rate
        });
      }
    }

    return successResponse({ message: msgObj }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
