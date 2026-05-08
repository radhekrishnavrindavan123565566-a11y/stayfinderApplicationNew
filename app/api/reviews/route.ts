import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    if (!propertyId) return errorResponse("propertyId is required");
    const reviews = await Review.find({ propertyId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    return successResponse({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error!.issues[0].message);

    const { propertyId, bookingId, rating, comment } = parsed.data;

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.tenantId.toString() !== user.userId) return errorResponse("Forbidden", 403);
    if (booking.status !== "completed" && booking.status !== "approved") {
      return errorResponse("You can only review after a completed stay");
    }

    const existing = await Review.findOne({ propertyId, userId: user.userId });
    if (existing) return errorResponse("You have already reviewed this property");

    const review = await Review.create({ propertyId, userId: user.userId, bookingId, rating, comment });

    // Update property average rating
    const allReviews = await Review.find({ propertyId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Property.findByIdAndUpdate(propertyId, { averageRating: avg, totalReviews: allReviews.length });

    return successResponse({ review }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
