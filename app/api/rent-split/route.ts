import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentSplit from "@/models/RentSplit";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, errorResponse } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { bookingId, splits, month, dueDate } = await req.json();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    if (booking.tenantId.toString() !== user.userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Validate splits add up to 100%
    const totalPercentage = splits.reduce((sum: number, s: { percentage: number }) => sum + s.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return errorResponse("Split percentages must add up to 100%", 400);
    }

    const rentSplit = await RentSplit.create({
      bookingId,
      propertyId: booking.propertyId,
      primaryTenantId: user.userId,
      totalRent: booking.totalPrice,
      splits: splits.map((s: { name: string; email: string; percentage: number }) => ({
        ...s,
        amount: (booking.totalPrice * s.percentage) / 100,
        status: "pending",
      })),
      month,
      dueDate,
      status: "partial",
    });

    return successResponse({ rentSplit }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    const query: { primaryTenantId: string; bookingId?: string } = {
      primaryTenantId: user.userId,
    };
    if (bookingId) query.bookingId = bookingId;

    const rentSplits = await RentSplit.find(query)
      .sort({ createdAt: -1 })
      .populate("bookingId")
      .populate("propertyId")
      .lean();

    return successResponse({ rentSplits });
  } catch (error) {
    return handleApiError(error);
  }
}
