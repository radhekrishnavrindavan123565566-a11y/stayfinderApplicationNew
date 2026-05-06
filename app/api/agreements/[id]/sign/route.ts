import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentAgreement from "@/models/RentAgreement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { verifyOtp } from "@/lib/otpStore";
import { addAgreementJob } from "@/lib/queue/queues";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { id } = await params;
    const { signature, otp, email } = await req.json();
    
    if (!signature) return errorResponse("Signature required");
    if (!otp) return errorResponse("OTP required", 400);
    if (!email) return errorResponse("Email required", 400);

    // Verify OTP
    const otpResult = verifyOtp(email, otp);
    if (!otpResult.valid) {
      return errorResponse(otpResult.reason || "Invalid OTP", 401);
    }

    const agreement = await RentAgreement.findById(id);
    if (!agreement) return errorResponse("Agreement not found", 404);

    const isTenant = agreement.tenantId.toString() === user.userId;
    const isOwner = agreement.ownerId.toString() === user.userId;
    if (!isTenant && !isOwner) return errorResponse("Forbidden", 403);

    // Enforce status machine: tenant signs when pending_tenant, owner when pending_owner
    if (isTenant) {
      if (agreement.status !== "pending_tenant") {
        return errorResponse("Not your turn to sign", 409);
      }
      if (agreement.tenantSignature) {
        return errorResponse("Already signed", 409);
      }
      agreement.tenantSignature = signature;
      agreement.tenantSignedAt = new Date();
      agreement.status = agreement.ownerSignature ? "fully_signed" : "pending_owner";
    } else {
      if (agreement.status !== "pending_owner") {
        return errorResponse("Not your turn to sign", 409);
      }
      if (agreement.ownerSignature) {
        return errorResponse("Already signed", 409);
      }
      agreement.ownerSignature = signature;
      agreement.ownerSignedAt = new Date();
      agreement.status = agreement.tenantSignature ? "fully_signed" : "pending_tenant";
    }

    await agreement.save();
    
    // Queue background job to send notification emails
    await addAgreementJob({
      agreementId: agreement._id.toString(),
      action: 'sign',
      userId: user.userId,
    });
    
    return successResponse({ agreement });
  } catch (e) { return handleApiError(e); }
}
