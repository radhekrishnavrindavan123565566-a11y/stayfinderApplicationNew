/**
 * Rent Reminder API
 * POST /api/rent-reminders — trigger reminders for all active bookings (call on 1st of month via cron)
 * Can also be triggered manually from admin panel
 */
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import RentPayment from "@/models/RentPayment";
import Notification from "@/models/Notification";
import { requireRole } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";
import { emit } from "@/lib/chatEvents";
import { format, startOfMonth } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // Allow admin or internal cron (no auth header = cron secret check)
    const authHeader = req.headers.get("authorization");
    const cronSecret = req.headers.get("x-cron-secret");

    if (!authHeader && cronSecret !== process.env.CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (authHeader) requireRole(req, ["admin"]);

    const now = new Date();
    const currentMonth = format(startOfMonth(now), "yyyy-MM");

    // Find all active approved bookings
    const activeBookings = await Booking.find({
      status: "approved",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("propertyId", "title price")
      .populate("tenantId", "username")
      .lean();

    let reminded = 0;

    for (const booking of activeBookings) {
      const property = booking.propertyId as { title: string; price: number };
      const tenant = booking.tenantId as { _id: string; username: string };

      // Check if payment entry exists for this month
      const payment = await RentPayment.findOne({
        bookingId: booking._id,
        month: currentMonth,
      });

      if (!payment) {
        // Create payment entry
        await RentPayment.create({
          bookingId: booking._id,
          propertyId: booking.propertyId,
          tenantId: booking.tenantId,
          ownerId: booking.ownerId,
          amount: property.price,
          month: currentMonth,
          dueDate: startOfMonth(now),
          status: "pending",
        });
      }

      // Send reminder notification to tenant
      const notif = await Notification.create({
        userId: booking.tenantId,
        type: "payment",
        title: "🏠 Rent Due This Month",
        body: `Your rent of ₹${property.price.toLocaleString("en-IN")} for ${property.title} is due for ${format(now, "MMMM yyyy")}.`,
        link: "/dashboard/rent-tracker",
      });

      // Push via SSE if tenant is online
      emit(tenant._id.toString(), "notification:new", { notification: notif.toObject() });
      reminded++;
    }

    return successResponse({ reminded, month: currentMonth });
  } catch (error) {
    return handleApiError(error);
  }
}
