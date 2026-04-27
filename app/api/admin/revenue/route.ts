import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    
    if (user.role !== "admin") {
      return errorResponse("Admin access required", 403);
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // all, month, week, today

    let dateFilter = {};
    const now = new Date();
    
    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (period === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === "month") {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    // Calculate total platform revenue
    const revenueStats = await Transaction.aggregate([
      { $match: { status: "completed", ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$platformFee" },
          totalTransactions: { $sum: 1 },
          totalGrossVolume: { $sum: "$totalAmount" },
          totalLandlordPayouts: { $sum: "$landlordAmount" },
        },
      },
    ]);

    const stats = revenueStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      totalGrossVolume: 0,
      totalLandlordPayouts: 0,
    };

    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: "completed", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$platformFee" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Pending escrow (money held but not yet released)
    const pendingEscrow = await Booking.aggregate([
      { $match: { escrowStatus: "holding", paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalHeld: { $sum: "$totalPrice" },
          platformFeeHeld: { $sum: "$platformFee" },
          count: { $sum: 1 },
        },
      },
    ]);

    const escrowStats = pendingEscrow[0] || {
      totalHeld: 0,
      platformFeeHeld: 0,
      count: 0,
    };

    return successResponse({
      period,
      revenue: {
        total: stats.totalRevenue,
        transactions: stats.totalTransactions,
        grossVolume: stats.totalGrossVolume,
        landlordPayouts: stats.totalLandlordPayouts,
        averageCommission: stats.totalTransactions > 0 
          ? (stats.totalRevenue / stats.totalGrossVolume * 100).toFixed(2) + "%"
          : "0%",
      },
      escrow: {
        totalHeld: escrowStats.totalHeld,
        platformFeeHeld: escrowStats.platformFeeHeld,
        pendingBookings: escrowStats.count,
      },
      monthlyRevenue,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
