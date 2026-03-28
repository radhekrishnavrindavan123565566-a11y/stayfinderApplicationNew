import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatAction from "@/models/ChatAction";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Called by cron or admin to expire old actions
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const result = await ChatAction.updateMany(
      { status: "pending", expiresAt: { $lt: new Date() } },
      { $set: { status: "expired" } }
    );
    return successResponse({ expired: result.modifiedCount });
  } catch (e) { return handleApiError(e); }
}
