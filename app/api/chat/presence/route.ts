import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { heartbeat, getOnlineUsers } from "@/lib/chatEvents";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// POST — client heartbeat to mark self as online
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    heartbeat(user.userId);
    return successResponse({ online: true });
  } catch (e) {
    return handleApiError(e);
  }
}

// GET — check online status of a list of users
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const ids = req.nextUrl.searchParams.get("ids")?.split(",") || [];
    return successResponse({ status: getOnlineUsers(ids) });
  } catch (e) {
    return handleApiError(e);
  }
}
