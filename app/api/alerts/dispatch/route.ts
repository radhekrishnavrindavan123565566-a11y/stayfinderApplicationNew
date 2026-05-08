import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserPreferences from "@/models/UserPreferences";
import Property from "@/models/Property";
import Notification from "@/models/Notification";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// Called by cron/webhook when new properties are listed
// Restricted to admin or internal cron calls only
export async function POST(req: NextRequest) {
  try {
    // Allow either admin auth OR a valid cron secret header
    const cronSecret = req.headers.get("x-cron-secret");
    const validCronSecret =
      cronSecret && cronSecret === process.env.CRON_SECRET;

    if (!validCronSecret) {
      // Fall back to admin role check
      const user = requireRole(req, ["admin"]);
      if (!user) return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const { propertyId } = await req.json();
    const property = await Property.findById(propertyId);
    if (!property) return successResponse({ dispatched: 0 });

    // Find users with matching saved searches that have alerts enabled
    const prefs = await UserPreferences.find({
      "savedSearches.alertEnabled": true,
    });

    let dispatched = 0;
    for (const pref of prefs) {
      for (const search of pref.savedSearches || []) {
        if (!search.alertEnabled) continue;
        const f = search.filters;
        const matches =
          (!f.city || property.location?.city?.toLowerCase().includes(f.city.toLowerCase())) &&
          (!f.maxPrice || property.price <= f.maxPrice) &&
          (!f.minPrice || property.price >= f.minPrice) &&
          (!f.bedrooms || property.bedrooms >= f.bedrooms) &&
          (!f.propertyType || property.propertyType === f.propertyType);

        if (matches) {
          await Notification.create({
            userId: pref.userId,
            type: "system",
            title: "New match for your saved search",
            body: `"${property.title}" in ${property.location?.city} matches your saved search criteria`,
            data: { propertyId: String(property._id) },
            link: `/properties/${property._id}`,
          });
          dispatched++;
          break; // one notification per user per property
        }
      }
    }

    return successResponse({ dispatched });
  } catch (e) { return handleApiError(e); }
}
