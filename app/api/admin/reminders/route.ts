/**
 * Smart Reminder System
 * Sends role-based reminders to all relevant users:
 * - Tenant: Rent due on 5th of month
 * - Owner: Agreement expiring in 7 days
 * - Admin: Pending property verifications
 */
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";
import { emit } from "@/lib/chatEvents";
import { addDays, format } from "date-fns";

async function sendNotif(userId: string, type: "booking" | "payment" | "system", title: string, body: string, link: string) {
  const notif = await Notification.create({ userId, type, title, body, link });
  emit(userId, "notification:new", { notification: notif.toObject() });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["admin"]);
    if (!user) return errorResponse("Forbidden", 403);

    const { type } = await req.json(); // "tenant_rent" | "owner_agreement" | "admin_verification" | "all"
    const now = new Date();
    const results: Record<string, number> = {};

    // ── 1. Tenant Rent Reminders ─────────────────────────────────────────
    if (type === "tenant_rent" || type === "all") {
      const activeBookings = await Booking.find({
        status: "approved",
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).populate("propertyId", "title price").lean();

      let count = 0;
      for (const b of activeBookings) {
        const prop = b.propertyId as { title: string; price: number };
        await sendNotif(
          b.tenantId.toString(),
          "payment",
          "🏠 Bhai, 5 tarikh hai — Rent Pay Karo!",
          `${prop.title} ka rent ₹${prop.price.toLocaleString("en-IN")} abhi bhi pending hai. Aaj hi pay karo!`,
          "/dashboard/rent-tracker"
        );
        count++;
      }
      results.tenant_rent = count;
    }

    // ── 2. Owner Agreement Expiry Reminders ──────────────────────────────
    if (type === "owner_agreement" || type === "all") {
      const in7Days = addDays(now, 7);
      const expiringBookings = await Booking.find({
        status: "approved",
        endDate: { $gte: now, $lte: in7Days },
      }).populate("propertyId", "title").lean();

      let count = 0;
      for (const b of expiringBookings) {
        const prop = b.propertyId as { title: string };
        const expDate = format(new Date(b.endDate), "dd MMM yyyy");
        await sendNotif(
          b.ownerId.toString(),
          "system",
          "📄 Agreement Expire Ho Raha Hai!",
          `${prop.title} ka agreement ${expDate} ko expire ho raha hai. Abhi renew kar lo.`,
          "/agreements"
        );
        // Also notify tenant
        await sendNotif(
          b.tenantId.toString(),
          "system",
          "📄 Aapka Agreement Expire Ho Raha Hai",
          `${prop.title} ka agreement ${expDate} ko khatam ho raha hai. Owner se baat karo.`,
          "/dashboard/bookings"
        );
        count++;
      }
      results.owner_agreement = count;
    }

    // ── 3. Admin — Pending Verifications ────────────────────────────────
    if (type === "admin_verification" || type === "all") {
      const pendingProps = await Property.countDocuments({ isAvailable: true, ownerVerified: false });
      const admins = await User.find({ role: "admin" }).select("_id").lean();
      for (const admin of admins) {
        if (pendingProps > 0) {
          await sendNotif(
            admin._id.toString(),
            "system",
            `🔔 ${pendingProps} Nayi Property Verification Pending`,
            `${pendingProps} properties verification ke liye wait kar rahi hain. Admin panel check karo.`,
            "/admin"
          );
        }
      }
      results.admin_verification = admins.length;
    }

    return successResponse({ results, message: "Reminders sent successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
