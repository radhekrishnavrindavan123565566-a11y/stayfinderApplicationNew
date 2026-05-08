import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;
    const { reply } = await req.json();

    if (!reply?.trim()) return errorResponse("Reply text is required");

    const review = await Review.findById(id).populate("propertyId", "ownerId");
    if (!review) return errorResponse("Review not found", 404);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = review.propertyId as any;
    if (property.ownerId?.toString() !== user.userId) return errorResponse("Forbidden", 403);

    review.ownerReply = reply.trim();
    review.ownerRepliedAt = new Date();
    await review.save();

    return successResponse({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
