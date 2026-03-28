import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const PLATFORM_COMMISSION = 0.1; // 10%

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "tenant";

    const query = role === "owner" ? { ownerId: user.userId } : { tenantId: user.userId };
    const bookings = await Booking.find(query)
      .populate("propertyId", "title images location price")
      .populate("tenantId", "username avatar email")
      .populate("ownerId", "username avatar email")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ bookings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { propertyId, startDate, endDate, message } = await req.json();

    if (!propertyId || !startDate || !endDate) return errorResponse("propertyId, startDate, endDate are required");

    const property = await Property.findById(propertyId);
    if (!property) return errorResponse("Property not found", 404);
    if (!property.isAvailable) return errorResponse("Property is not available");

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return errorResponse("endDate must be after startDate");

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      propertyId,
      status: { $in: ["pending", "approved"] },
      $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
    });
    if (conflict) return errorResponse("Property is already booked for these dates");

    // Check blocked dates
    const blockedConflict = property.blockedDates?.some((d: Date) => {
      const blocked = new Date(d);
      return blocked >= start && blocked <= end;
    });
    if (blockedConflict) return errorResponse("Some dates are blocked by the owner");

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = property.price * nights;
    const platformFee = Math.round(totalPrice * PLATFORM_COMMISSION * 100) / 100;
    const landlordEarning = totalPrice - platformFee;

    const booking = await Booking.create({
      propertyId,
      tenantId: user.userId,
      ownerId: property.ownerId,
      startDate: start,
      endDate: end,
      totalPrice,
      nights,
      platformFee,
      landlordEarning,
      escrowStatus: "none",
      cancellationPolicy: property.cancellationPolicy,
      instantBooking: property.instantBooking,
      status: property.instantBooking ? "approved" : "pending",
      message,
    });

    // Notify owner
    await Notification.create({
      userId: property.ownerId,
      type: "booking",
      title: "New Booking Request",
      body: `You have a new booking request for ${property.title}`,
      data: { bookingId: booking._id.toString(), propertyId: propertyId.toString() },
      link: `/dashboard/bookings`,
    });

    return successResponse({ booking }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
