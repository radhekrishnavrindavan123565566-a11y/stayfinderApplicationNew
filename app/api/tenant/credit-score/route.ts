import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

/**
 * Tenant Credit Score (0–100)
 * Factors:
 *  - Payment history (40pts): % of bookings with paid status
 *  - Booking completion (20pts): completed vs cancelled ratio
 *  - Owner reviews (20pts): average rating from owners
 *  - Profile completeness (10pts): verified, avatar, etc.
 *  - Account age (10pts): older = more trusted
 */
async function calculateScore(userId: string): Promise<{
  score: number;
  breakdown: Record<string, number>;
  label: string;
}> {
  const uid = new mongoose.Types.ObjectId(userId);

  const [bookings, reviews, user] = await Promise.all([
    Booking.find({ tenantId: uid }).lean(),
    Review.find({ userId: uid }).lean(),
    User.findById(uid).lean(),
  ]);

  // 1. Payment history (40pts)
  const paidBookings = bookings.filter((b) => b.paymentStatus === "paid").length;
  const paymentScore = bookings.length > 0
    ? Math.round((paidBookings / bookings.length) * 40)
    : 20; // neutral if no history

  // 2. Booking completion (20pts)
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const total = completed + cancelled;
  const completionScore = total > 0
    ? Math.round((completed / total) * 20)
    : 10;

  // 3. Owner reviews (20pts)
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r as { rating: number }).rating, 0) / reviews.length
    : 3; // neutral
  const reviewScore = Math.round((avgRating / 5) * 20);

  // 4. Profile completeness (10pts)
  const u = user as { tenantVerified?: boolean; avatar?: string; profileCompleteness?: number } | null;
  let profileScore = 0;
  if (u?.tenantVerified) profileScore += 5;
  if (u?.avatar) profileScore += 3;
  if ((u?.profileCompleteness ?? 0) >= 80) profileScore += 2;

  // 5. Account age (10pts)
  const createdAt = (user as { createdAt?: Date } | null)?.createdAt;
  const ageMonths = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;
  const ageScore = Math.min(10, Math.floor(ageMonths / 3)); // 1pt per 3 months, max 10

  const score = paymentScore + completionScore + reviewScore + profileScore + ageScore;

  const label =
    score >= 80 ? "Excellent" :
    score >= 65 ? "Good" :
    score >= 50 ? "Fair" :
    score >= 35 ? "Poor" : "Very Poor";

  return {
    score,
    breakdown: {
      paymentHistory: paymentScore,
      bookingCompletion: completionScore,
      ownerReviews: reviewScore,
      profileCompleteness: profileScore,
      accountAge: ageScore,
    },
    label,
  };
}

// GET own credit score
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const result = await calculateScore(user.userId);

    // Cache score on user document
    await User.findByIdAndUpdate(user.userId, {
      $set: { creditScore: result.score, creditScoreUpdatedAt: new Date() },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
