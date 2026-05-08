import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

// GET — check which properties qualify for auto price drop
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    const ownerId = new mongoose.Types.ObjectId(user.userId);

    const properties = await Property.find({ ownerId, isAvailable: true }).lean();
    const now = new Date();
    const threshold = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

    const results = await Promise.all(
      properties.map(async (p) => {
        // Last approved/pending booking end date
        const lastBooking = await Booking.findOne({
          propertyId: p._id,
          status: { $in: ["approved", "completed"] },
        })
          .sort({ endDate: -1 })
          .select("endDate")
          .lean();

        const lastActivity = lastBooking
          ? new Date((lastBooking as { endDate: Date }).endDate)
          : new Date((p as { createdAt: Date }).createdAt);

        const vacantDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        const qualifies = vacantDays >= 15;
        const suggestedDrop = qualifies ? Math.round(p.price * 0.1) : 0; // 10% drop
        const suggestedPrice = qualifies ? p.price - suggestedDrop : p.price;

        return {
          _id: p._id,
          title: p.title,
          currentPrice: p.price,
          vacantDays,
          qualifies,
          suggestedPrice,
          suggestedDrop,
          dropPercent: 10,
        };
      })
    );

    return successResponse({ properties: results, qualifying: results.filter((r) => r.qualifies).length });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — apply auto price drop to qualifying properties
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    if (!user) return errorResponse("Forbidden", 403);
    const { propertyIds, dropPercent = 10 } = await req.json();

    const ownerId = new mongoose.Types.ObjectId(user.userId);
    const updated: { id: string; oldPrice: number; newPrice: number }[] = [];

    for (const id of propertyIds) {
      const property = await Property.findOne({ _id: id, ownerId });
      if (!property) continue;

      const oldPrice = property.price;
      const newPrice = Math.round(oldPrice * (1 - dropPercent / 100));
      await Property.findByIdAndUpdate(id, { $set: { price: newPrice } });
      updated.push({ id, oldPrice, newPrice });
    }

    return successResponse({ updated, count: updated.length });
  } catch (error) {
    return handleApiError(error);
  }
}
