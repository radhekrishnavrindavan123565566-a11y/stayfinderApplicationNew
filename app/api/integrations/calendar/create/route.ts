import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth";
import { createBookingEvent, isCalendarConfigured } from "@/lib/integrations/calendar";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import { z } from "zod";

const createCalendarEventSchema = z.object({
  bookingId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
  includeLink: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    if (!isCalendarConfigured()) {
      return errorResponse("Calendar integration not configured", 503);
    }

    await connectDB();

    const body = await req.json();
    const parsed = createCalendarEventSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { bookingId, title, description, attendees, includeLink } = parsed.data;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate("propertyId")
      .populate("tenantId");

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // Verify user owns the booking or property
    if (booking.tenantId._id.toString() !== user.userId && booking.ownerId.toString() !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    const property = booking.propertyId;
    const eventTitle = title || `Viewing: ${property.title}`;
    const eventDescription =
      description ||
      `
Property Viewing
Address: ${property.location.address}
Contact: ${booking.tenantId.phone || "N/A"}
${includeLink ? `\nBooking Link: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}` : ""}
`.trim();

    const calendarEvent = await createBookingEvent({
      title: eventTitle,
      description: eventDescription,
      startTime: new Date(booking.startDate),
      endTime: new Date(booking.endDate),
      attendees: attendees || [booking.tenantId.email, booking.ownerId.email],
      location: property.location.address,
    });

    // Store calendar event ID in booking
    booking.calendarEventId = calendarEvent.eventId;
    await booking.save();

    return successResponse(
      {
        success: true,
        calendarEvent,
        message: "Calendar event created successfully",
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
