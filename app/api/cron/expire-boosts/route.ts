import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";`nimport { getAppUrl } from "@/lib/appUrl";
import Property from "@/models/Property";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs every hour — deactivates expired property boosts
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const now = new Date();

    const expired = await Property.find({
      isBoosted: true,
      boostExpiresAt: { $lt: now },
    })
      .populate("ownerId", "username email")
      .lean();

    let deactivated = 0;
    for (const property of expired) {
      await Property.findByIdAndUpdate(property._id, {
        isBoosted: false,
        $unset: { boostExpiresAt: 1 },
      });

      const owner = property.ownerId as unknown as { username: string; email: string };
      if (owner?.email) {
        await sendEmail(
          owner.email,
          `Your boost for "${property.title}" has expired`,
          `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#f43f5e;">Boost Expired 🚀</h2>
            <p>Hi <strong>${owner.username}</strong>,</p>
            <p>The featured boost for <strong>${property.title}</strong> has expired. Your listing is no longer highlighted at the top of search results.</p>
            <p style="color:#71717a;font-size:13px;">Boost again to get more visibility and bookings.</p>
            <a href="${getAppUrl()}/dashboard/properties" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">Boost Again</a>
          </div>`
        );
      }
      deactivated++;
    }

    console.log(`[CRON] expire-boosts: deactivated ${deactivated} boosts`);
    return successResponse({ deactivated });
  } catch (error) {
    return handleApiError(error);
  }
}

