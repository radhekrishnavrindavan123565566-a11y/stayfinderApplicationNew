import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentAgreement from "@/models/RentAgreement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { id } = await params;
    const agreement = await RentAgreement.findById(id)
      .populate("propertyId", "title location price images")
      .populate("tenantId", "username email avatar")
      .populate("ownerId", "username email avatar");
    if (!agreement) return errorResponse("Agreement not found", 404);
    if (
      agreement.tenantId._id.toString() !== user.userId &&
      agreement.ownerId._id.toString() !== user.userId
    ) return errorResponse("Forbidden", 403);
    return successResponse({ agreement });
  } catch (e) { return handleApiError(e); }
}
