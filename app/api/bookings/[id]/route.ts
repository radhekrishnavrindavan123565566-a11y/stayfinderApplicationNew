import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    const booking = await Booking.findById(id)
      .populate("propertyId", "title images price location cancellationPolicy")
      .populate("tenantId", "username avatar email")
      .populate("ownerId", "username avatar email");
    if (!booking) return errorResponse("Booking not found", 404);
    const isOwner = booking.ownerId._id?.toString() === user.userId;
    const isTenant = booking.tenantId._id?.toString() === user.userId;
    if (!isOwner && !isTenant && user.role !== "admin") return errorResponse("Forbidden", 403);
    return successResponse({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    const { status } = await req.json();
    const booking = await Booking.findById(id).populate("propertyId", "title");
    if (!booking) return errorResponse("Booking not found", 404);

    const isOwner = booking.ownerId.toString() === user.userId;
    const isTenant = booking.tenantId.toString() === user.userId;

    if (["approved", "rejected"].includes(status) && !isOwner && user.role !== "admin") {
      return errorResponse("Only the owner can approve or reject bookings", 403);
    }
    if (status === "cancelled" && !isTenant && !isOwner && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const prevStatus = booking.status;
    booking.status = status;

    // Escrow: when approved, set to holding
    if (status === "approved" && booking.paymentStatus === "paid") {
      booking.escrowStatus = "holding";
    }

    // Cancellation refund logic
    if (status === "cancelled" && booking.paymentStatus === "paid") {
      const now = new Date();
      const daysUntilStart = Math.ceil((booking.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const policy = booking.cancellationPolicy;

      let refundPct = 0;
      if (policy === "flexible" && daysUntilStart >= 1) refundPct = 100;
      else if (policy === "moderate" && daysUntilStart >= 5) refundPct = 100;
      else if (policy === "moderate" && daysUntilStart >= 1) refundPct = 50;
      else if (policy === "strict" && daysUntilStart >= 7) refundPct = 50;

      if (refundPct > 0) {
        booking.paymentStatus = "refunded";
        booking.escrowStatus = "refunded";
      }
    }

    await booking.save();

    // Notifications
    const propertyTitle = (booking.propertyId as { title?: string })?.title || "your property";
    if (status === "approved") {
      await Notification.create({
        userId: booking.tenantId,
        type: "booking",
        title: "Booking Approved",
        body: `Your booking for "${propertyTitle}" has been approved!`,
        link: "/dashboard/bookings",
      });
    } else if (status === "rejected") {
      await Notification.create({
        userId: booking.tenantId,
        type: "booking",
        title: "Booking Rejected",
        body: `Your booking for "${propertyTitle}" was not approved.`,
        link: "/dashboard/bookings",
      });
    } else if (status === "cancelled" && prevStatus !== "cancelled") {
      await Notification.create({
        userId: booking.ownerId,
        type: "booking",
        title: "Booking Cancelled",
        body: `A booking for "${propertyTitle}" has been cancelled.`,
        link: "/dashboard/bookings",
      });
    }

    return successResponse({ booking });
  } catch (error) {
    return handleApiError(error);
  }
}
