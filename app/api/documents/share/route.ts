import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DocumentShare from "@/models/DocumentShare";
import RentalDocument from "@/models/RentalDocument";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import crypto from "crypto";

// POST /api/documents/share - Create a document share link
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const body = await req.json();
    const { documentIds, expiryHours } = body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return errorResponse("Document IDs are required");
    }

    // Verify all documents belong to the user
    const documents = await RentalDocument.find({
      _id: { $in: documentIds },
      userId: user.userId,
    });

    if (documents.length !== documentIds.length) {
      return errorResponse("Some documents not found or unauthorized", 404);
    }

    // Generate secure token
    const shareToken = crypto.randomBytes(16).toString("hex");

    // Calculate expiry
    const hours = expiryHours || 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Create share
    const share = await DocumentShare.create({
      userId: user.userId,
      documentIds,
      shareToken,
      expiresAt,
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/documents/shared/${shareToken}`;

    return successResponse({ share: { ...share.toObject(), shareUrl } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/documents/share - Get all active shares for user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const shares = await DocumentShare.find({
      userId: user.userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .populate("documentIds")
      .sort({ createdAt: -1 })
      .lean();

    const sharesWithUrls = shares.map((share) => ({
      ...share,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/documents/shared/${share.shareToken}`,
    }));

    return successResponse({ shares: sharesWithUrls });
  } catch (error) {
    return handleApiError(error);
  }
}
