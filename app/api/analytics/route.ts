import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { errorResponse, successResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (user.role !== "owner" && user.role !== "admin") return errorResponse("Forbidden", 403);

    const ownerId = new mongoose.Types.ObjectId(user.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Total earnings
    const earningsAgg = await Transaction.aggregate([
      { $match: { ownerId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$landlordAmount" }, platformFees: { $sum: "$platformFee" } } },
    ]);

    // Monthly earnings (last 6 months)
    const monthlyEarnings = await Transaction.aggregate([
      { $match: { ownerId, status: "completed", createdAt: { $gte: last6Months } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          earnings: { $sum: "$landlordAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Booking stats
    const bookingStats = await Booking.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Properties
    const properties = await Property.find({ ownerId }).select("title averageRating totalReviews isAvailable isBoosted").lean();

    // Occupancy rate (approved bookings this month / total days)
    const approvedThisMonth = await Booking.countDocuments({
      ownerId,
      status: "approved",
      startDate: { $gte: startOfMonth },
    });

    const totalProperties = properties.length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const occupancyRate = totalProperties > 0 ? Math.min(100, (approvedThisMonth / (totalProperties * daysInMonth)) * 100) : 0;

    return successResponse({
      totalEarnings: earningsAgg[0]?.total || 0,
      platformFees: earningsAgg[0]?.platformFees || 0,
      monthlyEarnings,
      bookingStats: bookingStats.reduce((acc: Record<string, number>, s) => { acc[s._id] = s.count; return acc; }, {}),
      properties,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalProperties,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
