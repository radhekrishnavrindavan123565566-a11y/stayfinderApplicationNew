import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;

    const property = await Property.findById(id).lean();
    if (!property) return errorResponse("Property not found", 404);

    const isOwner = property.ownerId.toString() === user.userId;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) return errorResponse("Forbidden", 403);

    const city = property.location?.city;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // City demand score
    const [cityBookingsCount, cityPropertiesCount] = await Promise.all([
      Booking.countDocuments({ status: { $in: ["approved", "completed"] }, createdAt: { $gte: thirtyDaysAgo } }).then(async () => {
        const cityProps = await Property.find({ "location.city": city }).select("_id").lean();
        const cityPropIds = cityProps.map((p) => p._id);
        return Booking.countDocuments({ propertyId: { $in: cityPropIds }, status: { $in: ["approved", "completed"] }, createdAt: { $gte: thirtyDaysAgo } });
      }),
      Property.countDocuments({ "location.city": city }),
    ]);
    const cityDemandScore = Math.min(100, Math.round((cityBookingsCount / Math.max(1, cityPropertiesCount)) * 10));

    // Peak months from this property's bookings
    const allBookings = await Booking.find({ propertyId: id, status: { $in: ["approved", "completed"] } }).select("startDate").lean();
    const monthCounts: Record<number, number> = {};
    for (const b of allBookings) {
      const m = new Date(b.startDate).getMonth();
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    }
    const peakMonths = Object.entries(monthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m]) => MONTH_NAMES[parseInt(m)]);

    const bestListingTime = peakMonths.length > 0
      ? `List in ${MONTH_NAMES[(MONTH_NAMES.indexOf(peakMonths[0]) - 1 + 12) % 12]} for peak season`
      : "List now to start getting bookings";

    // Competitor count
    const competitorCount = await Property.countDocuments({
      "location.city": city,
      propertyType: property.propertyType,
      _id: { $ne: property._id },
    });

    // Occupancy rates
    const cityProps = await Property.find({ "location.city": city }).select("_id").lean();
    const cityPropIds = cityProps.map((p) => p._id);
    const cityBookings90 = await Booking.find({
      propertyId: { $in: cityPropIds },
      status: { $in: ["approved", "completed"] },
      startDate: { $gte: ninetyDaysAgo },
    }).select("startDate endDate").lean();

    let cityTotalBookedDays = 0;
    for (const b of cityBookings90) {
      const days = Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24));
      cityTotalBookedDays += Math.max(0, days);
    }
    const avgOccupancyRate = Math.min(100, Math.round(cityTotalBookedDays / Math.max(1, cityPropertiesCount * 90) * 100));

    const ownerBookings90 = await Booking.find({
      propertyId: id,
      status: { $in: ["approved", "completed"] },
      startDate: { $gte: ninetyDaysAgo },
    }).select("startDate endDate").lean();
    let ownerBookedDays = 0;
    for (const b of ownerBookings90) {
      const days = Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24));
      ownerBookedDays += Math.max(0, days);
    }
    const ownerOccupancyRate = Math.min(100, Math.round(ownerBookedDays / 90 * 100));

    // Wishlist count
    const wishlistsThisWeek = await User.countDocuments({ wishlist: property._id });

    return successResponse({
      cityDemandScore,
      peakMonths,
      bestListingTime,
      competitorCount,
      avgOccupancyRate,
      ownerOccupancyRate,
      viewsThisWeek: (property as { viewCount?: number }).viewCount ?? 0,
      wishlistsThisWeek,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
