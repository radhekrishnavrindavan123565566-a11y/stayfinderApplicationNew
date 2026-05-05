import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// Seasonal demand multipliers for UP rental market
const SEASONAL_DEMAND: Record<number, { label: string; multiplier: number; reason: string }> = {
  1:  { label: "January",   multiplier: 0.85, reason: "Post-holiday slowdown" },
  2:  { label: "February",  multiplier: 0.90, reason: "Steady demand" },
  3:  { label: "March",     multiplier: 1.10, reason: "Academic year start — student rush" },
  4:  { label: "April",     multiplier: 1.20, reason: "Peak admission season" },
  5:  { label: "May",       multiplier: 1.15, reason: "Summer internship relocations" },
  6:  { label: "June",      multiplier: 1.25, reason: "New academic year — highest demand" },
  7:  { label: "July",      multiplier: 1.20, reason: "College admissions peak" },
  8:  { label: "August",    multiplier: 1.10, reason: "Late admissions" },
  9:  { label: "September", multiplier: 0.95, reason: "Settled tenants, lower churn" },
  10: { label: "October",   multiplier: 0.90, reason: "Festival season — some vacancies" },
  11: { label: "November",  multiplier: 0.85, reason: "Pre-winter slowdown" },
  12: { label: "December",  multiplier: 0.80, reason: "Holiday season — lowest demand" },
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req); // must be logged in to access market forecasts
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Lucknow";
    const propertyType = searchParams.get("type") || "apartment";

    // Historical booking data — last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const historicalBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, status: { $in: ["approved", "completed"] } } },
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $match: {
          "property.location.city": { $regex: city, $options: "i" },
          "property.propertyType": propertyType,
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          bookings: { $sum: 1 },
          avgPrice: { $avg: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Current market stats
    const totalListings = await Property.countDocuments({
      "location.city": { $regex: city, $options: "i" },
      propertyType,
      isAvailable: true,
    });

    const avgPrice = await Property.aggregate([
      { $match: { "location.city": { $regex: city, $options: "i" }, propertyType, isAvailable: true } },
      { $group: { _id: null, avg: { $avg: "$price" } } },
    ]);

    // Build 6-month forecast
    const now = new Date();
    const forecast = Array.from({ length: 6 }, (_, i) => {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = forecastDate.getMonth() + 1;
      const seasonal = SEASONAL_DEMAND[month];

      // Find historical data for this month
      const historical = historicalBookings.find(
        (h: { _id: { month: number } }) => h._id.month === month
      );
      const baseBookings = historical?.bookings || Math.round(totalListings * 0.3);
      const predictedBookings = Math.round(baseBookings * seasonal.multiplier);
      const demandScore = Math.min(100, Math.round(seasonal.multiplier * 70));

      return {
        month: seasonal.label,
        year: forecastDate.getFullYear(),
        predictedBookings,
        demandScore,
        demandLevel: demandScore >= 80 ? "Very High" : demandScore >= 65 ? "High" : demandScore >= 50 ? "Medium" : "Low",
        seasonalFactor: seasonal.multiplier,
        reason: seasonal.reason,
        recommendedAction: seasonal.multiplier >= 1.1
          ? "🔥 Increase price by 10-15% — high demand period"
          : seasonal.multiplier >= 0.95
          ? "✅ Maintain current price"
          : "💡 Consider offering discounts to attract tenants",
      };
    });

    // AI narrative if available
    let aiInsight = "";
    if (isOpenAIConfigured()) {
      const openai = getOpenAI();
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a real estate market analyst for Uttar Pradesh, India. Provide a brief 2-sentence market insight.",
          },
          {
            role: "user",
            content: `City: ${city}, Property type: ${propertyType}, Total listings: ${totalListings}, Avg price: ₹${Math.round(avgPrice[0]?.avg || 0)}/month. Next peak month: ${forecast.reduce((a, b) => a.demandScore > b.demandScore ? a : b).month}. Provide market insight.`,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      });
      aiInsight = res.choices[0].message.content?.trim() || "";
    }

    return successResponse({
      city,
      propertyType,
      currentStats: {
        totalListings,
        avgPrice: Math.round(avgPrice[0]?.avg || 0),
        historicalBookings: historicalBookings.length,
      },
      forecast,
      peakMonth: forecast.reduce((a, b) => a.demandScore > b.demandScore ? a : b),
      aiInsight,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
