import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import RentPayment from "@/models/RentPayment";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { getAppUrl } from "@/lib/appUrl";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Single cron endpoint — runs all automations
// Vercel Hobby allows only 1 cron job, so we combine everything here
// Schedule: every day at 9 AM UTC

export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  const results: Record<string, unknown> = {};
  const appUrl = getAppUrl();

  try {
    await connectDB();
    const now = new Date();

    // ── 1. Rent Reminders (3 days before due) ────────────────────────────────
    try {
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const upcoming = await RentPayment.find({
        status: "pending",
        dueDate: { $gte: now, $lte: in3Days },
      }).populate("tenantId", "username email").populate("propertyId", "title location").lean();

      let remindersSent = 0;
      for (const payment of upcoming) {
        const tenant = payment.tenantId as { username: string; email: string };
        const property = payment.propertyId as { title: string; location: { city: string } };
        if (!tenant?.email) continue;
        const dueDate = new Date(payment.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" });
        await sendEmail(tenant.email,
          `Rent Due Reminder — ₹${payment.amount.toLocaleString("en-IN")} due ${dueDate}`,
          `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#f43f5e;">Rent Reminder 🏠</h2>
            <p>Hi <strong>${tenant.username}</strong>, your rent of <strong>₹${payment.amount.toLocaleString("en-IN")}</strong> for <strong>${property?.title}</strong> is due in 3 days (${dueDate}).</p>
            <a href="${appUrl}/dashboard/rent-tracker" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">View Payment</a>
          </div>`
        ).catch(() => {});
        remindersSent++;
      }
      results.rentReminders = { sent: remindersSent };
    } catch (e) { results.rentReminders = { error: String(e) }; }

    // ── 2. Expire Stale Bookings (pending > 48h) ─────────────────────────────
    try {
      const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const stale = await Booking.find({ status: "pending", createdAt: { $lt: cutoff } })
        .populate("tenantId", "username email").populate("propertyId", "title").lean();

      let cancelled = 0;
      for (const booking of stale) {
        await Booking.findByIdAndUpdate(booking._id, { status: "cancelled" });
        const tenant = booking.tenantId as { username: string; email: string };
        const property = booking.propertyId as { title: string };
        if (tenant?.email) {
          await sendEmail(tenant.email, "Booking Request Expired",
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#f43f5e;">Booking Expired ⏰</h2>
              <p>Hi <strong>${tenant.username}</strong>, your booking for <strong>${property?.title}</strong> was auto-cancelled as the owner didn't respond within 48 hours.</p>
              <a href="${appUrl}/properties" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">Browse Properties</a>
            </div>`
          ).catch(() => {});
        }
        cancelled++;
      }
      results.expireBookings = { cancelled };
    } catch (e) { results.expireBookings = { error: String(e) }; }

    // ── 3. Mark Late Payments ────────────────────────────────────────────────
    try {
      const overdue = await RentPayment.find({ status: "pending", dueDate: { $lt: now } })
        .populate("tenantId", "username email").populate("ownerId", "username email")
        .populate("propertyId", "title").lean();

      let marked = 0;
      for (const payment of overdue) {
        await RentPayment.findByIdAndUpdate(payment._id, { status: "late" });
        const tenant = payment.tenantId as { username: string; email: string };
        const owner  = payment.ownerId  as { username: string; email: string };
        const property = payment.propertyId as { title: string };
        const daysLate = Math.floor((now.getTime() - new Date(payment.dueDate).getTime()) / 86400000);
        if (tenant?.email) {
          await sendEmail(tenant.email, `⚠️ Rent Overdue — ${daysLate} day(s) late`,
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#ef4444;">Rent Overdue ⚠️</h2>
              <p>Hi <strong>${tenant.username}</strong>, your rent of <strong>₹${payment.amount.toLocaleString("en-IN")}</strong> for <strong>${property?.title}</strong> is <strong>${daysLate} day(s) overdue</strong>.</p>
              <a href="${appUrl}/dashboard/rent-tracker" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">Pay Now</a>
            </div>`
          ).catch(() => {});
        }
        if (owner?.email) {
          await sendEmail(owner.email, `Tenant rent overdue — ${property?.title}`,
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#f43f5e;">Payment Alert 🔔</h2>
              <p>Hi <strong>${owner.username}</strong>, tenant <strong>${tenant?.username}</strong> is <strong>${daysLate} day(s) late</strong> on ₹${payment.amount.toLocaleString("en-IN")} for <strong>${property?.title}</strong>.</p>
              <a href="${appUrl}/dashboard/rent-tracker" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">View Details</a>
            </div>`
          ).catch(() => {});
        }
        marked++;
      }
      results.latePayments = { marked };
    } catch (e) { results.latePayments = { error: String(e) }; }

    // ── 4. Expire Property Boosts ────────────────────────────────────────────
    try {
      const expired = await Property.find({ isBoosted: true, boostExpiresAt: { $lt: now } })
        .populate("ownerId", "username email").lean();

      let deactivated = 0;
      for (const property of expired) {
        await Property.findByIdAndUpdate(property._id, { isBoosted: false, $unset: { boostExpiresAt: 1 } });
        const owner = property.ownerId as unknown as { username: string; email: string };
        if (owner?.email) {
          await sendEmail(owner.email, `Your boost for "${property.title}" has expired`,
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#f43f5e;">Boost Expired 🚀</h2>
              <p>Hi <strong>${owner.username}</strong>, the featured boost for <strong>${property.title}</strong> has expired.</p>
              <a href="${appUrl}/dashboard/properties" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">Boost Again</a>
            </div>`
          ).catch(() => {});
        }
        deactivated++;
      }
      results.expireBoosts = { deactivated };
    } catch (e) { results.expireBoosts = { error: String(e) }; }

    // ── 5. Inactive Listing Alerts (weekly — only on Mondays) ────────────────
    try {
      if (now.getDay() === 1) { // Monday only
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const inactive = await Property.find({
          isAvailable: true, viewCount: { $lt: 5 }, createdAt: { $lt: thirtyDaysAgo },
        }).populate("ownerId", "username email").lean();

        let notified = 0;
        for (const property of inactive) {
          const owner = property.ownerId as unknown as { username: string; email: string };
          if (!owner?.email) continue;
          await sendEmail(owner.email, `Your listing "${property.title}" needs attention`,
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <h2 style="color:#f43f5e;">Low Visibility Alert 📊</h2>
              <p>Hi <strong>${owner.username}</strong>, <strong>${property.title}</strong> has fewer than 5 views in 30 days. Add more photos, update the description, or boost your listing.</p>
              <a href="${appUrl}/dashboard/properties/${property._id}/edit" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:12px;">Improve Listing</a>
            </div>`
          ).catch(() => {});
          notified++;
        }
        results.inactiveListings = { notified };
      } else {
        results.inactiveListings = { skipped: "runs on Mondays only" };
      }
    } catch (e) { results.inactiveListings = { error: String(e) }; }

    // ── 6. Weekly Owner Report (Mondays only) ────────────────────────────────
    try {
      if (now.getDay() === 1) {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const owners = await User.find({ role: "owner" }).lean();
        let sent = 0;
        for (const owner of owners) {
          const properties = await Property.find({ ownerId: owner._id }).lean();
          if (!properties.length) continue;
          const weekBookings = await Booking.find({ ownerId: owner._id, createdAt: { $gte: weekAgo } }).lean();
          const totalViews = properties.reduce((s, p) => s + (p.viewCount || 0), 0);
          const earnings = weekBookings.filter(b => b.status === "approved").reduce((s, b) => s + (b.landlordEarning || 0), 0);
          await sendEmail(owner.email,
            `📊 Weekly Nestora Report — ${now.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`,
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
              <div style="background:linear-gradient(135deg,#f43f5e,#fb923c);padding:20px;border-radius:12px;margin-bottom:20px;text-align:center;">
                <h2 style="margin:0;color:#fff;">Weekly Report</h2>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Hi ${owner.username}</p>
              </div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;background:#fef2f2;border-radius:8px;text-align:center;"><p style="margin:0;font-size:11px;color:#71717a;">Bookings</p><p style="margin:0;font-size:24px;font-weight:900;color:#f43f5e;">${weekBookings.length}</p></td>
                <td style="width:8px;"></td>
                <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;"><p style="margin:0;font-size:11px;color:#71717a;">Views</p><p style="margin:0;font-size:24px;font-weight:900;color:#16a34a;">${totalViews}</p></td>
                <td style="width:8px;"></td>
                <td style="padding:8px;background:#f0f9ff;border-radius:8px;text-align:center;"><p style="margin:0;font-size:11px;color:#71717a;">Earnings</p><p style="margin:0;font-size:24px;font-weight:900;color:#0284c7;">₹${earnings.toLocaleString("en-IN")}</p></td></tr>
              </table>
              <a href="${appUrl}/dashboard/analytics" style="display:block;background:#f43f5e;color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:20px;text-align:center;">View Full Analytics →</a>
            </div>`
          ).catch(() => {});
          sent++;
        }
        results.weeklyReport = { sent };
      } else {
        results.weeklyReport = { skipped: "runs on Mondays only" };
      }
    } catch (e) { results.weeklyReport = { error: String(e) }; }

    console.log("[CRON run-all]", JSON.stringify(results));
    return successResponse({ ran: new Date().toISOString(), results });
  } catch (error) {
    return handleApiError(error);
  }
}
