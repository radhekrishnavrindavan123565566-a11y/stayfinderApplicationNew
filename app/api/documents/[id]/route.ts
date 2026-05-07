import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentalDocument from "@/models/RentalDocument";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// GET /api/documents/[id] - Get a specific document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;

    const document = await RentalDocument.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!document) return errorResponse("Document not found", 404);

    return successResponse({ document });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;

    const document = await RentalDocument.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!document) return errorResponse("Document not found", 404);

    // Update user storage
    const userDoc = await User.findById(user.userId);
    if (userDoc) {
      userDoc.documentStorageUsed = Math.max(
        0,
        (userDoc.documentStorageUsed || 0) - document.fileSize
      );
      await userDoc.save();
    }

    await document.deleteOne();

    return successResponse({ message: "Document deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/documents/[id] - Update document (e.g., expiry date)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;

    const body = await req.json();
    const { expiryDate, verificationStatus } = body;

    const document = await RentalDocument.findOne({
      _id: id,
      userId: user.userId,
    });

    if (!document) return errorResponse("Document not found", 404);

    if (expiryDate !== undefined) {
      document.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    }

    if (verificationStatus) {
      document.verificationStatus = verificationStatus;
    }

    await document.save();

    return successResponse({ document });
  } catch (error) {
    return handleApiError(error);
  }
}
