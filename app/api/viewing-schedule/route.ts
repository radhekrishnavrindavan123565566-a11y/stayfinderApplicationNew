import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ViewingSchedule from "@/models/ViewingSchedule";
import Property from "@/models/Property";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, errorResponse } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "tenant";

    const query = role === "tenant" ? { tenantId: user.userId } : { ownerId: user.userId };

    const schedules = await ViewingSchedule.find(query)
      .populate("propertyId", "title location images")
      .populate("tenantId", "username email")
      .populate("ownerId", "username email")
      .sort({ scheduledDate: 1 })
      .lean();

    return successResponse({ schedules });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { propertyId, scheduledDate, timeSlot, viewingType, tenantNotes } = await req.json();

    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse("Property not found", 404);
    }

    // Check if slot is already booked
    const existing = await ViewingSchedule.findOne({
      propertyId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return errorResponse("This time slot is already booked", 400);
    }

    const schedule = await ViewingSchedule.create({
      propertyId,
      tenantId: user.userId,
      ownerId: property.ownerId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      viewingType,
      tenantNotes,
      status: "pending",
    });

    // Notify owner
    await Notification.create({
      userId: property.ownerId,
      type: "viewing_request",
      title: "New Viewing Request",
      message: `Someone wants to view your property on ${new Date(scheduledDate).toLocaleDateString()} at ${timeSlot}`,
      link: `/dashboard/viewings/${schedule._id}`,
    });

    return successResponse({ schedule }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
