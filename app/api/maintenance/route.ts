import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MaintenanceRequest from "@/models/MaintenanceRequest";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get("role") || "tenant";

    // Enforce: owners can only see their own maintenance, tenants see their own
    // Admins can query either side
    const effectiveRole =
      user.role === "admin"
        ? requestedRole
        : user.role === "owner"
        ? "owner"
        : "tenant";

    const query =
      effectiveRole === "owner"
        ? { ownerId: user.userId }
        : { tenantId: user.userId };

    const requests = await MaintenanceRequest.find(query)
      .populate("propertyId", "title images")
      .populate("tenantId", "username avatar")
      .sort({ createdAt: -1 });

    return successResponse({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { bookingId, title, description, category, priority, images } = await req.json();

    if (!bookingId || !title || !description) {
      return errorResponse("bookingId, title and description are required");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.tenantId.toString() !== user.userId) return errorResponse("Forbidden", 403);

    const request = await MaintenanceRequest.create({
      bookingId,
      propertyId: booking.propertyId,
      tenantId: user.userId,
      ownerId: booking.ownerId,
      title,
      description,
      category: category || "other",
      priority: priority || "medium",
      images: images || [],
    });

    return successResponse({ request }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
