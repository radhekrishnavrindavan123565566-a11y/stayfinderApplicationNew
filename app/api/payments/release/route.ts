import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { bookingId } = await req.json();
    if (!bookingId) return errorResponse("bookingId is required");

    const booking = await Booking.findById(bookingId).populate("propertyId", "title");
    if (!booking) return errorResponse("Booking not found", 404);

    // Only tenant or admin can confirm check-in / release
    if (booking.tenantId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    if (booking.escrowStatus !== "holding") return errorResponse("Escrow is not in holding state");

    booking.escrowStatus = "released";
    booking.checkInConfirmed = true;
    booking.status = "completed";
    await booking.save();

    // Create transaction record
    await Transaction.create({
      bookingId: booking._id,
      tenantId: booking.tenantId,
      ownerId: booking.ownerId,
      propertyId: booking.propertyId,
      totalAmount: booking.totalPrice,
      platformFee: booking.platformFee,
      landlordAmount: booking.landlordEarning,
      status: "completed",
      paymentIntentId: booking.paymentIntentId,
      type: "booking",
    });

    // Notify owner
    await Notification.create({
      userId: booking.ownerId,
      type: "payment",
      title: "Payment Released",
      body: `Payment of $${booking.landlordEarning} has been released to your account`,
      link: "/dashboard/analytics",
    });

    return successResponse({ message: "Escrow released successfully", booking });
  } catch (error) {
    return handleApiError(error);
  }
}
