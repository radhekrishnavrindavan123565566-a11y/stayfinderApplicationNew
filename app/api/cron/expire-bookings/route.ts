import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs every hour — auto-cancels pending bookings older than 48h
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const stale = await Booking.find({
      status: "pending",
      createdAt: { $lt: cutoff },
    })
      .populate("tenantId", "username email")
      .populate("propertyId", "title")
      .lean();

    let cancelled = 0;
    for (const booking of stale) {
      await Booking.findByIdAndUpdate(booking._id, { status: "cancelled" });

      const tenant = booking.tenantId as { username: string; email: string };
      const property = booking.propertyId as { title: string };
      if (tenant?.email) {
        await sendEmail(
          tenant.email,
          "Booking Request Expired",
          `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#f43f5e;">Booking Expired ⏰</h2>
            <p>Hi <strong>${tenant.username}</strong>,</p>
            <p>Your booking request for <strong>${property.title}</strong> has been automatically cancelled as the owner did not respond within 48 hours.</p>
            <p style="color:#71717a;font-size:13px;">You can browse other properties and submit a new request.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">Browse Properties</a>
          </div>`
        );
      }
      cancelled++;
    }

    console.log(`[CRON] expire-bookings: cancelled ${cancelled} stale bookings`);
    return successResponse({ cancelled });
  } catch (error) {
    return handleApiError(error);
  }
}
