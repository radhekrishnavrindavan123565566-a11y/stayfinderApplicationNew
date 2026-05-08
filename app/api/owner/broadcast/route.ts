import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import Property from "@/models/Property";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    const { propertyId, message, channel = "in-app" } = await req.json();

    if (!message?.trim()) return errorResponse("Message is required");

    const ownerId = new mongoose.Types.ObjectId(user.userId);

    // Get all unique tenants who ever booked this owner's properties
    const query: Record<string, unknown> = { ownerId };
    if (propertyId) query.propertyId = new mongoose.Types.ObjectId(propertyId);

    const bookings = await Booking.find(query)
      .select("tenantId propertyId")
      .populate("tenantId", "username email phone")
      .populate("propertyId", "title")
      .lean();

    // Deduplicate tenants
    const seen = new Set<string>();
    const tenants: { _id: string; username: string; email: string }[] = [];
    for (const b of bookings) {
      const t = b.tenantId as { _id: mongoose.Types.ObjectId; username: string; email: string };
      const id = t._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        tenants.push({ _id: id, username: t.username, email: t.email });
      }
    }

    if (tenants.length === 0) return errorResponse("No past tenants found to broadcast to");

    // Get owner's property for context
    const property = propertyId
      ? await Property.findById(propertyId).select("title").lean()
      : null;

    const propertyTitle = (property as { title?: string })?.title || "your property";

    // Send in-app notification + chat message to each tenant
    const notifications = tenants.map((t) => ({
      userId: new mongoose.Types.ObjectId(t._id),
      type: "system" as const,
      title: `Update from your landlord`,
      body: message,
      link: `/chat`,
      read: false,
    }));

    await Notification.insertMany(notifications);

    // Also send as chat messages so tenants see it in their inbox
    const ids = [user.userId, tenants[0]?._id].sort();
    const chatMessages = tenants.map((t) => {
      const convIds = [user.userId, t._id].sort();
      return {
        conversationId: convIds.join("_"),
        senderId: new mongoose.Types.ObjectId(user.userId),
        receiverId: new mongoose.Types.ObjectId(t._id),
        content: `📢 Broadcast from landlord (${propertyTitle}):\n\n${message}`,
        type: "text",
        status: "sent",
        reactions: [],
      };
    });

    await Message.insertMany(chatMessages);

    return successResponse({
      sent: tenants.length,
      tenants: tenants.map((t) => ({ id: t._id, username: t.username, email: t.email })),
      channel,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET — fetch list of past tenants for this owner
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const ownerId = new mongoose.Types.ObjectId(user.userId);
    const query: Record<string, unknown> = { ownerId };
    if (propertyId) query.propertyId = new mongoose.Types.ObjectId(propertyId);

    const bookings = await Booking.find(query)
      .select("tenantId propertyId status createdAt")
      .populate("tenantId", "username email avatar")
      .populate("propertyId", "title")
      .lean();

    const seen = new Set<string>();
    const tenants: unknown[] = [];
    for (const b of bookings) {
      const t = b.tenantId as { _id: mongoose.Types.ObjectId; username: string; email: string; avatar?: string };
      const id = t._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        tenants.push({
          _id: id,
          username: t.username,
          email: t.email,
          avatar: t.avatar,
          lastBooking: b.createdAt,
          property: (b.propertyId as { title?: string })?.title,
        });
      }
    }

    return successResponse({ tenants, total: tenants.length });
  } catch (error) {
    return handleApiError(error);
  }
}
