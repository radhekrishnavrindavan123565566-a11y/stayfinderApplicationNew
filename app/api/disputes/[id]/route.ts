import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dispute from "@/models/Dispute";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    await connectDB();
    const { id } = await params;
    const dispute = await Dispute.findById(id).populate("bookingId").populate("raisedBy", "username email");
    if (!dispute) return errorResponse("Dispute not found", 404);
    if (dispute.raisedBy._id.toString() !== user.userId && user.role !== "admin") return errorResponse("Forbidden", 403);
    return successResponse({ dispute });
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireRole(req, ["admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    await connectDB();
    const { id } = await params;
    const { status, adminNotes, resolution } = await req.json();
    const dispute = await Dispute.findById(id);
    if (!dispute) return errorResponse("Dispute not found", 404);
    if (status) dispute.status = status;
    if (adminNotes) dispute.adminNotes = adminNotes;
    if (resolution) {
      dispute.resolution = resolution;
      dispute.resolvedAt = new Date();
    }
    await dispute.save();
    return successResponse({ dispute });
  } catch (e) { return handleApiError(e); }
}
