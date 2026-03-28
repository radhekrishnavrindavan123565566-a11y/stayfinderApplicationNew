import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatAction from "@/models/ChatAction";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { id } = await params;
    const { response } = await req.json(); // "accepted" | "rejected"
    if (!["accepted", "rejected"].includes(response)) return errorResponse("Invalid response");
    const action = await ChatAction.findById(id);
    if (!action) return errorResponse("Action not found", 404);
    if (action.receiverId.toString() !== user.userId) return errorResponse("Forbidden", 403);
    if (action.status !== "pending") return errorResponse("Action already resolved");
    if (action.expiresAt < new Date()) {
      action.status = "expired";
      await action.save();
      return errorResponse("Action has expired");
    }
    action.status = response;
    await action.save();
    return successResponse({ action });
  } catch (e) { return handleApiError(e); }
}
