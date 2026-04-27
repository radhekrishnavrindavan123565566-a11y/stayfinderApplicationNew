import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MoveInChecklist from "@/models/MoveInChecklist";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { emit } from "@/lib/chatEvents";

// Default checklist items
const DEFAULT_ITEMS = [
  // Walls & Ceiling
  { id: "walls", label: "Walls — no cracks or stains", category: "Structure" },
  { id: "ceiling", label: "Ceiling — no leaks or damage", category: "Structure" },
  { id: "floor", label: "Floor — clean and undamaged", category: "Structure" },
  { id: "doors", label: "Doors & locks working", category: "Structure" },
  { id: "windows", label: "Windows — glass intact, latches work", category: "Structure" },
  // Electrical
  { id: "lights", label: "All lights working", category: "Electrical" },
  { id: "fans", label: "Fans working", category: "Electrical" },
  { id: "ac", label: "AC working (if applicable)", category: "Electrical" },
  { id: "sockets", label: "Power sockets functional", category: "Electrical" },
  // Plumbing
  { id: "taps", label: "Taps — no leaks", category: "Plumbing" },
  { id: "toilet", label: "Toilet flush working", category: "Plumbing" },
  { id: "geyser", label: "Geyser / water heater working", category: "Plumbing" },
  { id: "drainage", label: "Drainage — no blockage", category: "Plumbing" },
  // Appliances
  { id: "fridge", label: "Refrigerator working (if provided)", category: "Appliances" },
  { id: "washing", label: "Washing machine working (if provided)", category: "Appliances" },
  { id: "gas", label: "Gas stove / cylinder present", category: "Appliances" },
  // Furniture
  { id: "bed", label: "Bed frame — no damage", category: "Furniture" },
  { id: "mattress", label: "Mattress — clean condition", category: "Furniture" },
  { id: "wardrobe", label: "Wardrobe — doors & locks OK", category: "Furniture" },
  { id: "table", label: "Table & chairs present", category: "Furniture" },
  // Keys & Access
  { id: "keys", label: "Keys handed over", category: "Keys & Access" },
  { id: "parking", label: "Parking space allocated (if applicable)", category: "Keys & Access" },
];

// GET — fetch checklist for a booking
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) return errorResponse("bookingId required");

    let checklist = await MoveInChecklist.findOne({ bookingId })
      .populate("tenantId", "username avatar")
      .populate("ownerId", "username avatar")
      .populate("propertyId", "title")
      .lean();

    // Auto-create if not exists
    if (!checklist) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return errorResponse("Booking not found", 404);
      if (booking.tenantId.toString() !== user.userId && booking.ownerId.toString() !== user.userId) {
        return errorResponse("Forbidden", 403);
      }
      const newChecklist = await MoveInChecklist.create({
        bookingId,
        propertyId: booking.propertyId,
        tenantId: booking.tenantId,
        ownerId: booking.ownerId,
        items: DEFAULT_ITEMS.map((item) => ({ ...item, tenantStatus: "pending", ownerStatus: "pending", photos: [] })),
        depositAmount: booking.totalPrice,
      });
      checklist = await MoveInChecklist.findById(newChecklist._id)
        .populate("tenantId", "username avatar")
        .populate("ownerId", "username avatar")
        .populate("propertyId", "title")
        .lean();
    }

    return successResponse({ checklist });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH — update item statuses and sign
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { bookingId, items, action } = await req.json();
    if (!bookingId) return errorResponse("bookingId required");

    const checklist = await MoveInChecklist.findOne({ bookingId });
    if (!checklist) return errorResponse("Checklist not found", 404);

    const isTenant = checklist.tenantId.toString() === user.userId;
    const isOwner = checklist.ownerId.toString() === user.userId;
    if (!isTenant && !isOwner) return errorResponse("Forbidden", 403);

    // Update item statuses
    if (items) {
      for (const update of items) {
        const item = checklist.items.find((i: { id: string }) => i.id === update.id);
        if (!item) continue;
        if (isTenant) {
          item.tenantStatus = update.status;
          item.tenantNote = update.note;
        } else {
          item.ownerStatus = update.status;
          item.ownerNote = update.note;
        }
        if (update.photos) item.photos = update.photos;
      }
    }

    // Sign action
    if (action === "sign") {
      if (isTenant) {
        checklist.tenantSignedAt = new Date();
        checklist.status = checklist.ownerSignedAt ? "completed" : "tenant_signed";
      } else {
        checklist.ownerSignedAt = new Date();
        checklist.status = checklist.tenantSignedAt ? "completed" : "owner_signed";
      }

      // Notify the other party
      const notifyUserId = isTenant ? checklist.ownerId.toString() : checklist.tenantId.toString();
      const notif = await Notification.create({
        userId: notifyUserId,
        type: "system",
        title: checklist.status === "completed" ? "✅ Move-in Checklist Complete" : "📋 Checklist Signed",
        body: checklist.status === "completed"
          ? "Both parties have signed the move-in checklist."
          : `${isTenant ? "Tenant" : "Owner"} has signed the move-in checklist. Your turn!`,
        link: `/dashboard/checklist?bookingId=${bookingId}`,
      });
      emit(notifyUserId, "notification:new", { notification: notif.toObject() });
    }

    await checklist.save();
    return successResponse({ checklist });
  } catch (error) {
    return handleApiError(error);
  }
}
