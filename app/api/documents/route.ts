import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentalDocument from "@/models/RentalDocument";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// GET /api/documents - Get all documents for authenticated user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const documents = await RentalDocument.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Check for expired documents
    const now = new Date();
    const updatedDocs = documents.map((doc) => ({
      ...doc,
      isExpired: doc.expiryDate ? new Date(doc.expiryDate) < now : false,
    }));

    return successResponse({ documents: updatedDocs });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/documents - Upload a new document
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const body = await req.json();
    const { documentType, fileName, fileUrl, fileSize, expiryDate } = body;

    if (!documentType || !fileName || !fileUrl || !fileSize) {
      return errorResponse("Missing required fields: documentType, fileName, fileUrl, fileSize");
    }

    // Check storage limit (50 MB)
    const userDoc = await User.findById(user.userId);
    if (!userDoc) return errorResponse("User not found", 404);

    const MAX_STORAGE = 50 * 1024 * 1024; // 50 MB in bytes
    if ((userDoc.documentStorageUsed || 0) + fileSize > MAX_STORAGE) {
      return errorResponse("Storage limit exceeded. Maximum 50 MB allowed.");
    }

    // Create document
    const document = await RentalDocument.create({
      userId: user.userId,
      documentType,
      fileName,
      fileUrl,
      fileSize,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    // Update user storage
    userDoc.documentStorageUsed = (userDoc.documentStorageUsed || 0) + fileSize;
    await userDoc.save();

    return successResponse({ document }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
