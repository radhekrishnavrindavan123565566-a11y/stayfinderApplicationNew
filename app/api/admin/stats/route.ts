import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireRole } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);

    const [totalUsers, ownerCount, tenantCount, totalProperties, totalBookings, revenueAgg, userGrowth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "tenant" }),
      Property.countDocuments(),
      Booking.countDocuments(),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, platformFees: { $sum: "$platformFee" } } },
      ]),
      User.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const platformRevenue = revenueAgg[0]?.platformFees || 0;

    const bookingStats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentBookings = await Booking.find()
      .populate("propertyId", "title")
      .populate("tenantId", "username")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("propertyId tenantId totalPrice status escrowStatus paymentStatus createdAt")
      .lean();

    const recentUsers = await User.find()
      .select("username email role createdAt avatar")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const boostedProperties = await Property.countDocuments({ isBoosted: true });

    return successResponse({
      totalUsers,
      ownerCount,
      tenantCount,
      totalProperties,
      totalBookings,
      revenue,
      platformRevenue,
      boostedProperties,
      bookingStats: bookingStats.reduce((acc: Record<string, number>, s) => { acc[s._id] = s.count; return acc; }, {}),
      userGrowth,
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
