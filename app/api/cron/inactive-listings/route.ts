import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";`nimport { getAppUrl } from "@/lib/appUrl";
import Property from "@/models/Property";
import { sendEmail } from "@/lib/mailer";
import { validateCronSecret } from "@/lib/cronSecret";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// Runs weekly — alerts owners if property has 0 views in 30 days
export async function GET(req: NextRequest) {
  const authError = validateCronSecret(req);
  if (authError) return authError;

  try {
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Properties available but with very low views, created more than 30 days ago
    const inactive = await Property.find({
      isAvailable: true,
      viewCount: { $lt: 5 },
      createdAt: { $lt: thirtyDaysAgo },
    })
      .populate("ownerId", "username email")
      .lean();

    let notified = 0;
    for (const property of inactive) {
      const owner = property.ownerId as unknown as { username: string; email: string };
      if (!owner?.email) continue;

      await sendEmail(
        owner.email,
        `Your listing "${property.title}" needs attention`,
        `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
          <h2 style="color:#f43f5e;">Low Visibility Alert 📊</h2>
          <p>Hi <strong>${owner.username}</strong>,</p>
          <p>Your listing <strong>${property.title}</strong> in ${property.location.city} has received fewer than 5 views in the last 30 days.</p>
          <p style="color:#71717a;font-size:13px;">Here are some tips to improve visibility:</p>
          <ul style="color:#52525b;font-size:13px;line-height:1.8;">
            <li>Add more high-quality photos</li>
            <li>Update your description with keywords</li>
            <li>Reduce price slightly to appear in more searches</li>
            <li>Boost your listing for featured placement</li>
          </ul>
          <a href="${getAppUrl()}/dashboard/properties/${property._id}/edit" style="display:inline-block;background:#f43f5e;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">Improve Listing</a>
        </div>`
      );
      notified++;
    }

    console.log(`[CRON] inactive-listings: notified ${notified} owners`);
    return successResponse({ notified, total: inactive.length });
  } catch (error) {
    return handleApiError(error);
  }
}

