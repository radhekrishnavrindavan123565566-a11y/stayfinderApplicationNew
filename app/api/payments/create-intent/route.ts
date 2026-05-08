import { NextRequest } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-02-25.clover" });

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { bookingId } = await req.json();
    if (!bookingId) return errorResponse("bookingId is required");

    const booking = await Booking.findById(bookingId).populate("propertyId", "title");
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.tenantId.toString() !== user.userId) return errorResponse("Forbidden", 403);
    if (booking.paymentStatus === "paid") return errorResponse("Already paid");

    const propertyTitle = (booking.propertyId as { title?: string })?.title || "Property";

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        platformFee: booking.platformFee.toString(),
        landlordEarning: booking.landlordEarning.toString(),
      },
      description: `Booking for ${propertyTitle} — Platform fee: $${booking.platformFee}, Owner earns: $${booking.landlordEarning}`,
    });

    booking.paymentIntentId = paymentIntent.id;
    booking.paymentStatus = "paid";
    booking.escrowStatus = "holding"; // funds held in escrow until check-in confirmed
    await booking.save();

    // Notify owner that payment is in escrow
    await Notification.create({
      userId: booking.ownerId,
      type: "payment",
      title: "Payment Received (Escrow)",
      body: `Payment of $${booking.totalPrice} for "${propertyTitle}" is held in escrow. It will be released after tenant confirms check-in.`,
      link: "/dashboard/bookings",
    });

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        totalPrice: booking.totalPrice,
        platformFee: booking.platformFee,
        landlordEarning: booking.landlordEarning,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
