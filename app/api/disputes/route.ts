import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dispute from "@/models/Dispute";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    // Admin sees all disputes, users see their own
    const query = user.role === "admin" ? {} : { raisedBy: user.userId };
    const disputes = await Dispute.find(query)
      .populate("bookingId", "startDate endDate propertyId")
      .populate("raisedBy", "username email")
      .sort({ createdAt: -1 });
    return successResponse({ disputes });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { bookingId, reason, description, evidence } = await req.json();
    if (!bookingId || !reason || !description) return errorResponse("Missing required fields");

    const existing = await Dispute.findOne({ bookingId, raisedBy: user.userId });
    if (existing) return errorResponse("You already raised a dispute for this booking");

    const dispute = await Dispute.create({
      bookingId,
      raisedBy: user.userId,
      reason,
      description,
      evidence: evidence || [],
    });
    return successResponse({ dispute }, 201);
  } catch (e) { return handleApiError(e); }
}
