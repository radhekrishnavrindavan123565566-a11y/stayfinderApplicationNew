import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;
    const { status, ownerNote } = await req.json();

    const request = await MaintenanceRequest.findById(id);
    if (!request) return errorResponse("Request not found", 404);
    if (request.ownerId.toString() !== user.userId && request.tenantId.toString() !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    if (status) request.status = status;
    if (ownerNote !== undefined) request.ownerNote = ownerNote;
    if (status === "resolved") request.resolvedAt = new Date();
    await request.save();

    return successResponse({ request });
  } catch (error) {
    return handleApiError(error);
  }
}
