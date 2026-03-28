import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatAction from "@/models/ChatAction";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return errorResponse("conversationId required");
    const actions = await ChatAction.find({ conversationId, status: "pending" })
      .populate("initiatorId", "username avatar")
      .populate("receiverId", "username avatar")
      .sort({ createdAt: -1 });
    return successResponse({ actions });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const body = await req.json();
    const { conversationId, receiverId, type, payload } = body;
    if (!conversationId || !receiverId || !type) return errorResponse("Missing required fields");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const action = await ChatAction.create({
      conversationId,
      initiatorId: user.userId,
      receiverId,
      type,
      payload,
      expiresAt,
    });
    return successResponse({ action }, 201);
  } catch (e) { return handleApiError(e); }
}
