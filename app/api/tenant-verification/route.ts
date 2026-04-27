import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TenantVerification from "@/models/TenantVerification";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    let verification = await TenantVerification.findOne({ userId: user.userId });

    if (!verification) {
      verification = await TenantVerification.create({
        userId: user.userId,
        documents: [],
        backgroundCheck: { status: "pending" },
        policeVerification: { status: "not_requested" },
        overallStatus: "incomplete",
      });
    }

    return successResponse({ verification });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { documentType, fileUrl } = await req.json();

    const verification = await TenantVerification.findOneAndUpdate(
      { userId: user.userId },
      {
        $push: {
          documents: {
            type: documentType,
            fileUrl,
            verified: false,
            uploadedAt: new Date(),
          },
        },
        $set: { overallStatus: "pending" },
      },
      { new: true, upsert: true }
    );

    return successResponse({ verification }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
