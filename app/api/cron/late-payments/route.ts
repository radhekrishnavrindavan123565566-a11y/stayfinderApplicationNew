import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentPayment from "@/models/RentPayment";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs daily at 10 AM — marks overdue payments as late and notifies
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const now = new Date();

    // Find pending payments past due date
    const overdue = await RentPayment.find({
      status: "pending",
      dueDate: { $lt: now },
    })
      .populate("tenantId", "username email")
      .populate("ownerId", "username email")
      .populate("propertyId", "title location")
      .lean();

    let marked = 0;
    for (const payment of overdue) {
      await RentPayment.findByIdAndUpdate(payment._id, { status: "late" });

      const tenant = payment.tenantId as { username: string; email: string };
      const owner  = payment.ownerId  as { username: string; email: string };
      const property = payment.propertyId as { title: string; location: { city: string } };

      const daysLate = Math.floor((now.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24));

      // Notify tenant
      if (tenant?.email) {
        await sendEmail(
          tenant.email,
          `⚠️ Rent Overdue — ₹${payment.amount.toLocaleString("en-IN")} (${daysLate} day${daysLate !== 1 ? "s" : ""} late)`,
          `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#ef4444;">Rent Overdue ⚠️</h2>
            <p>Hi <strong>${tenant.username}</strong>,</p>
            <p>Your rent of <strong>₹${payment.amount.toLocaleString("en-IN")}</strong> for <strong>${property.title}</strong> is <strong>${daysLate} day${daysLate !== 1 ? "s" : ""} overdue</strong>.</p>
            <p style="color:#71717a;font-size:13px;">Please pay immediately to avoid further issues with your tenancy.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rent-tracker" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">Pay Now</a>
          </div>`
        );
      }

      // Notify owner
      if (owner?.email) {
        await sendEmail(
          owner.email,
          `Tenant rent overdue — ${property.title}`,
          `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#f43f5e;">Payment Alert 🔔</h2>
            <p>Hi <strong>${owner.username}</strong>,</p>
            <p>Tenant <strong>${tenant.username}</strong> has not paid rent of <strong>₹${payment.amount.toLocaleString("en-IN")}</strong> for <strong>${property.title}</strong>. It is <strong>${daysLate} day${daysLate !== 1 ? "s" : ""} overdue</strong>.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rent-tracker" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">View Details</a>
          </div>`
        );
      }
      marked++;
    }

    console.log(`[CRON] late-payments: marked ${marked} payments as late`);
    return successResponse({ marked });
  } catch (error) {
    return handleApiError(error);
  }
}
