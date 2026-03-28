import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ServiceBooking from "@/models/ServiceBooking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const bookings = await ServiceBooking.find({ tenantId: user.userId })
      .populate("serviceId")
      .populate("bookingId", "startDate endDate")
      .sort({ createdAt: -1 });
    return successResponse({ bookings });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { bookingId, serviceId, scheduledDate, notes } = await req.json();
    if (!bookingId || !serviceId || !scheduledDate) return errorResponse("Missing required fields");

    const EcosystemService = (await import("@/models/EcosystemService")).default;
    const service = await EcosystemService.findById(serviceId);
    if (!service) return errorResponse("Service not found", 404);

    const booking = await ServiceBooking.create({
      bookingId,
      serviceId,
      tenantId: user.userId,
      scheduledDate: new Date(scheduledDate),
      totalPrice: service.price,
      notes,
    });
    return successResponse({ booking }, 201);
  } catch (e) { return handleApiError(e); }
}
