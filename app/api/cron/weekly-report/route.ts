import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs every Monday at 8 AM — sends weekly stats to all owners
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get all owners
    const owners = await User.find({ role: "owner" }).lean();
    let sent = 0;

    for (const owner of owners) {
      const properties = await Property.find({ ownerId: owner._id }).lean();
      if (properties.length === 0) continue;

      const propertyIds = properties.map((p) => p._id);

      // This week's bookings
      const weekBookings = await Booking.find({
        ownerId: owner._id,
        createdAt: { $gte: weekAgo },
      }).lean();

      const approved  = weekBookings.filter((b) => b.status === "approved").length;
      const pending   = weekBookings.filter((b) => b.status === "pending").length;
      const totalViews = properties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const earnings  = weekBookings
        .filter((b) => b.status === "approved")
        .reduce((sum, b) => sum + (b.landlordEarning || 0), 0);

      // Build property rows
      const propertyRows = properties.map((p) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;">${p.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;text-align:center;">${p.viewCount || 0}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;text-align:center;">${p.isAvailable ? "✅ Active" : "⏸ Inactive"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;text-align:right;">₹${p.price.toLocaleString("en-IN")}/mo</td>
        </tr>`).join("");

      await sendEmail(
        owner.email,
        `📊 Your Weekly Nestora Report — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`,
        `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
          <div style="background:linear-gradient(135deg,#f43f5e,#fb923c);padding:24px;border-radius:12px;margin-bottom:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;">Weekly Report</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Hi ${owner.username} — here's your week at a glance</p>
          </div>

          <!-- Stats -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">New Bookings</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#f43f5e;">${weekBookings.length}</p>
            </div>
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Approved</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#16a34a;">${approved}</p>
            </div>
            <div style="background:#fffbeb;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Total Views</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#d97706;">${totalViews}</p>
            </div>
            <div style="background:#f0f9ff;border-radius:12px;padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">Earnings</p>
              <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#0284c7;">₹${earnings.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <!-- Properties table -->
          <h3 style="font-size:14px;color:#18181b;margin-bottom:8px;">Your Properties</h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #f4f4f5;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#71717a;text-transform:uppercase;">Property</th>
                <th style="padding:8px 12px;text-align:center;font-size:11px;color:#71717a;text-transform:uppercase;">Views</th>
                <th style="padding:8px 12px;text-align:center;font-size:11px;color:#71717a;text-transform:uppercase;">Status</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;color:#71717a;text-transform:uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>${propertyRows}</tbody>
          </table>

          ${pending > 0 ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-top:16px;font-size:13px;color:#92400e;">⏳ You have <strong>${pending} pending booking request${pending !== 1 ? "s" : ""}</strong> waiting for your response.</div>` : ""}

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics" style="display:block;background:#f43f5e;color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:20px;text-align:center;">View Full Analytics →</a>

          <p style="margin-top:20px;color:#a1a1aa;font-size:11px;text-align:center;">© ${new Date().getFullYear()} Nestora · Unsubscribe from weekly reports in your profile settings</p>
        </div>`
      );
      sent++;
    }

    console.log(`[CRON] weekly-report: sent ${sent} reports`);
    return successResponse({ sent, totalOwners: owners.length });
  } catch (error) {
    return handleApiError(error);
  }
}
