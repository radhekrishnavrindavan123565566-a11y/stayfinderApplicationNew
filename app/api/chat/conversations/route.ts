import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const userId = new mongoose.Types.ObjectId(user.userId);

    // Get latest message per conversation
    const convos = await Message.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const conversations = await Promise.all(
      convos.map(async (c) => {
        const [uid1, uid2] = c._id.split("_");
        const otherUserId = uid1 === user.userId ? uid2 : uid1;
        const otherUser = await User.findById(otherUserId).select("username avatar").lean();
        return {
          conversationId: c._id,
          otherUser,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
        };
      })
    );

    return successResponse({ conversations });
  } catch (error) {
    return handleApiError(error);
  }
}
