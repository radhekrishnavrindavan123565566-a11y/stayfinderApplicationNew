import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentAgreement from "@/models/RentAgreement";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { generateAgreementText } from "@/lib/agreementTemplate";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    await connectDB();
    const agreements = await RentAgreement.find({
      $or: [{ tenantId: user.userId }, { ownerId: user.userId }],
    })
      .populate("propertyId", "title location")
      .populate("tenantId", "username email")
      .populate("ownerId", "username email")
      .sort({ createdAt: -1 });
    return successResponse({ agreements });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    await connectDB();
    const { bookingId } = await req.json();
    if (!bookingId) return errorResponse("bookingId required");

    const booking = await Booking.findById(bookingId)
      .populate("propertyId", "title location price")
      .populate("tenantId", "username email")
      .populate("ownerId", "username email");

    if (!booking) return errorResponse("Booking not found", 404);
    if (
      booking.ownerId._id.toString() !== user.userId &&
      booking.tenantId._id.toString() !== user.userId
    ) return errorResponse("Forbidden", 403);

    // Check if agreement already exists
    const existing = await RentAgreement.findOne({ bookingId });
    if (existing) return successResponse({ agreement: existing });

    const agreementText = generateAgreementText({
      agreementId: bookingId,
      tenantName: booking.tenantId.username,
      ownerName: booking.ownerId.username,
      propertyTitle: booking.propertyId.title,
      propertyAddress: `${booking.propertyId.location?.address || ""}, ${booking.propertyId.location?.city || ""}`,
      monthlyRent: booking.propertyId.price,
      startDate: format(new Date(booking.startDate), "MMM d, yyyy"),
      endDate: format(new Date(booking.endDate), "MMM d, yyyy"),
    });

    const agreement = await RentAgreement.create({
      bookingId,
      propertyId: booking.propertyId._id,
      tenantId: booking.tenantId._id,
      ownerId: booking.ownerId._id,
      agreementText,
      status: "pending_tenant",
      validFrom: booking.startDate,
      validUntil: booking.endDate,
    });

    return successResponse({ agreement }, 201);
  } catch (e) { return handleApiError(e); }
}
