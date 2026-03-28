import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentAgreement from "@/models/RentAgreement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { id } = await params;
    const { signature } = await req.json();
    if (!signature) return errorResponse("Signature required");

    const agreement = await RentAgreement.findById(id);
    if (!agreement) return errorResponse("Agreement not found", 404);

    const isTenant = agreement.tenantId.toString() === user.userId;
    const isOwner = agreement.ownerId.toString() === user.userId;
    if (!isTenant && !isOwner) return errorResponse("Forbidden", 403);

    if (isTenant) {
      agreement.tenantSignature = signature;
      agreement.tenantSignedAt = new Date();
      agreement.status = agreement.ownerSignature ? "fully_signed" : "pending_owner";
    } else {
      agreement.ownerSignature = signature;
      agreement.ownerSignedAt = new Date();
      agreement.status = agreement.tenantSignature ? "fully_signed" : "pending_tenant";
    }

    await agreement.save();
    return successResponse({ agreement });
  } catch (e) { return handleApiError(e); }
}
