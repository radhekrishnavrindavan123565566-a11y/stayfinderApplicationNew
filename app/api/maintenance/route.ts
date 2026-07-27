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
    
    // Parse FormData for file uploads
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string || "other";
    const priority = formData.get("priority") as string || "medium";
    
    if (!title || !description) {
      return errorResponse("title and description are required");
    }

    // Get current booking for tenant - find latest booking
    const booking = await Booking.findOne({ 
      tenantId: user.userId,
      status: { $in: ["confirmed", "active"] }
    }).sort({ createdAt: -1 });

    if (!booking) return errorResponse("No active booking found", 404);

    const request = await MaintenanceRequest.create({
      bookingId: booking._id,
      propertyId: booking.propertyId,
      tenantId: user.userId,
      ownerId: booking.ownerId,
      title,
      description,
      category,
      priority,
      images: [],
    });

    return successResponse({ request }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
