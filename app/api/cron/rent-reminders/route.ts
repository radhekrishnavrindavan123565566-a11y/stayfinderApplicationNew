import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";`nimport { getAppUrl } from "@/lib/appUrl";
import RentPayment from "@/models/RentPayment";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs daily at 9 AM — sends reminder 3 days before due date
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find pending payments due in next 3 days
    const upcoming = await RentPayment.find({
      status: "pending",
      dueDate: { $gte: now, $lte: in3Days },
    })
      .populate("tenantId", "username email")
      .populate("propertyId", "title location")
      .lean();

    let sent = 0;
    for (const payment of upcoming) {
      const tenant = payment.tenantId as { username: string; email: string };
      const property = payment.propertyId as { title: string; location: { city: string } };
      if (!tenant?.email) continue;

      const dueDate = new Date(payment.dueDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });

      await sendEmail(
        tenant.email,
        `Rent Due Reminder — ₹${payment.amount.toLocaleString("en-IN")} due on ${dueDate}`,
        `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
          <h2 style="color:#f43f5e;margin-bottom:8px;">Rent Reminder 🏠</h2>
          <p>Hi <strong>${tenant.username}</strong>,</p>
          <p>Your rent for <strong>${property.title}</strong> (${property.location?.city}) is due in <strong>3 days</strong>.</p>
          <div style="background:#fef2f2;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
            <p style="margin:0;font-size:13px;color:#71717a;">Amount Due</p>
            <p style="margin:4px 0 0;font-size:32px;font-weight:900;color:#f43f5e;">₹${payment.amount.toLocaleString("en-IN")}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#71717a;">Due: ${dueDate}</p>
          </div>
          <p style="color:#71717a;font-size:13px;">Please ensure timely payment to avoid late fees.</p>
          <a href="${getAppUrl()}/dashboard/rent-tracker" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">View Payment</a>
        </div>`
      );
      sent++;
    }

    console.log(`[CRON] rent-reminders: sent ${sent} reminders`);
    return successResponse({ sent, total: upcoming.length });
  } catch (error) {
    return handleApiError(error);
  }
}

