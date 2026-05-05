import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// Fallback seasonal multipliers — used only when DB has < 3 months of data
const FALLBACK_SEASONAL: Record<number, { label: string; multiplier: number; reason: string }> = {
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

const MONTH_LABELS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req);
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Lucknow";
    const propertyType = searchParams.get("type") || "apartment";

    // Historical booking data — last 24 months for better seasonal signal
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const historicalBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: twoYearsAgo }, status: { $in: ["approved", "completed"] } } },
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
          _id: { month: { $month: "$createdAt" } },
          bookings: { $sum: 1 },
          avgPrice: { $avg: "$totalPrice" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Compute real seasonal multipliers from DB data
    const totalBookings = historicalBookings.reduce((s: number, h: { bookings: number }) => s + h.bookings, 0);
    const avgMonthlyBookings = totalBookings / Math.max(historicalBookings.length, 1);

    // Build month → multiplier map from real data
    const realMultipliers: Record<number, number> = {};
    for (const h of historicalBookings as { _id: { month: number }; bookings: number }[]) {
      realMultipliers[h._id.month] = avgMonthlyBookings > 0
        ? h.bookings / avgMonthlyBookings
        : 1;
    }

    // Use real data if we have ≥ 3 months, otherwise fall back
    const useRealData = historicalBookings.length >= 3;

    // Current market stats
    const totalListings = await Property.countDocuments({
      "location.city": { $regex: city, $options: "i" },
      propertyType,
      isAvailable: true,
    });

    const avgPriceAgg = await Property.aggregate([
      { $match: { "location.city": { $regex: city, $options: "i" }, propertyType, isAvailable: true } },
      { $group: { _id: null, avg: { $avg: "$price" } } },
    ]);
    const currentAvgPrice = Math.round(avgPriceAgg[0]?.avg || 0);

    // Build 6-month forecast
    const now = new Date();
    const forecast = Array.from({ length: 6 }, (_, i) => {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = forecastDate.getMonth() + 1;

      let multiplier: number;
      let reason: string;

      if (useRealData && realMultipliers[month] !== undefined) {
        multiplier = Math.max(0.5, Math.min(2.0, realMultipliers[month]));
        reason = multiplier >= 1.1
          ? `Historically ${Math.round((multiplier - 1) * 100)}% above average in ${MONTH_LABELS[month]}`
          : multiplier <= 0.9
          ? `Historically ${Math.round((1 - multiplier) * 100)}% below average in ${MONTH_LABELS[month]}`
          : `Steady demand in ${MONTH_LABELS[month]}`;
      } else {
        const fallback = FALLBACK_SEASONAL[month];
        multiplier = fallback.multiplier;
        reason = fallback.reason;
      }

      const historical = (historicalBookings as { _id: { month: number }; bookings: number }[])
        .find(h => h._id.month === month);
      const baseBookings = historical?.bookings || Math.round(totalListings * 0.3);
      const predictedBookings = Math.round(baseBookings * multiplier);
      const demandScore = Math.min(100, Math.round(multiplier * 70));

      return {
        month: MONTH_LABELS[month],
        year: forecastDate.getFullYear(),
        predictedBookings,
        demandScore,
        demandLevel: demandScore >= 80 ? "Very High" : demandScore >= 65 ? "High" : demandScore >= 50 ? "Medium" : "Low",
        seasonalFactor: Math.round(multiplier * 100) / 100,
        reason,
        dataSource: useRealData ? "real_bookings" : "seasonal_estimate",
        recommendedAction: multiplier >= 1.1
          ? "🔥 Increase price by 10-15% — high demand period"
          : multiplier >= 0.95
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
            content: "You are a real estate market analyst for Uttar Pradesh, India. Provide a brief 2-sentence market insight based on the data.",
          },
          {
            role: "user",
            content: `City: ${city}, Property type: ${propertyType}, Total listings: ${totalListings}, Avg price: ₹${currentAvgPrice}/month. Historical months of data: ${historicalBookings.length}. Next peak month: ${forecast.reduce((a, b) => a.demandScore > b.demandScore ? a : b).month}. Data source: ${useRealData ? "real booking history" : "seasonal estimates"}.`,
          },
        ],
        max_tokens: 120,
        temperature: 0.5,
      });
      aiInsight = res.choices[0].message.content?.trim() || "";
    }

    return successResponse({
      city,
      propertyType,
      currentStats: {
        totalListings,
        avgPrice: currentAvgPrice,
        historicalMonths: historicalBookings.length,
        dataSource: useRealData ? "real_bookings" : "seasonal_estimate",
      },
      forecast,
      peakMonth: forecast.reduce((a, b) => a.demandScore > b.demandScore ? a : b),
      aiInsight,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
