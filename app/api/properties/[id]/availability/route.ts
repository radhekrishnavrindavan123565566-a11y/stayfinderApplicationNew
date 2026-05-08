import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// GET: return blocked dates + booked date ranges + demand heatmap
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const property = await Property.findById(id).select("blockedDates").lean();
    if (!property) return errorResponse("Property not found", 404);

    const bookings = await Booking.find({
      propertyId: id,
      status: { $in: ["pending", "approved"] },
    }).select("startDate endDate status").lean();

    // Compute demand heatmap for next 90 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ninetyDaysOut = new Date(today);
    ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);

    // Count how many bookings overlap each date in the next 90 days
    const countMap: Record<string, number> = {};
    for (let d = new Date(today); d <= ninetyDaysOut; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      countMap[key] = 0;
    }

    for (const booking of bookings) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      for (let d = new Date(Math.max(start.getTime(), today.getTime())); d <= end && d <= ninetyDaysOut; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (key in countMap) countMap[key]++;
      }
    }

    const counts = Object.values(countMap);
    const avgCount = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

    const demandHeatmap: Record<string, "low" | "medium" | "high"> = {};
    for (const [date, count] of Object.entries(countMap)) {
      let level: "low" | "medium" | "high";
      if (avgCount === 0) {
        level = count >= 3 ? "high" : count >= 2 ? "medium" : "low";
      } else {
        level = count > avgCount * 3 ? "high" : count > avgCount * 1.5 ? "medium" : "low";
      }
      // Only include medium and high to keep response small
      if (level !== "low") demandHeatmap[date] = level;
    }

    return successResponse({
      blockedDates: property.blockedDates || [],
      bookings: bookings.map((b) => ({ startDate: b.startDate, endDate: b.endDate, status: b.status })),
      demandHeatmap,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH: owner blocks/unblocks dates
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;
    const { dates, action } = await req.json(); // action: "block" | "unblock"

    if (!dates || !Array.isArray(dates)) return errorResponse("dates array is required");

    const property = await Property.findOne({ _id: id, ownerId: user.userId });
    if (!property) return errorResponse("Property not found or not yours", 404);

    const parsedDates = dates.map((d: string) => new Date(d));

    if (action === "unblock") {
      property.blockedDates = property.blockedDates.filter(
        (d: Date) => !parsedDates.some((pd) => pd.toDateString() === d.toDateString())
      );
    } else {
      const existing = new Set(property.blockedDates.map((d: Date) => d.toDateString()));
      parsedDates.forEach((d) => { if (!existing.has(d.toDateString())) property.blockedDates.push(d); });
    }

    await property.save();
    return successResponse({ blockedDates: property.blockedDates });
  } catch (error) {
    return handleApiError(error);
  }
}
