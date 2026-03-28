import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ["admin"]);
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { propertyId } = body as { propertyId?: string };

    const query = propertyId ? { _id: propertyId } : {};
    const properties = await Property.find(query).lean();

    if (properties.length === 0) {
      return errorResponse("No properties found", 404);
    }

    let updated = 0;

    for (const property of properties) {
      const city = property.location?.city;
      if (!city) continue;

      // Compute city average price
      const agg = await Property.aggregate([
        { $match: { "location.city": city } },
        { $group: { _id: null, avg: { $avg: "$price" } } },
      ]);

      const cityAvgPrice: number = agg[0]?.avg ?? property.price;
      const fairPriceRange = { min: cityAvgPrice * 0.8, max: cityAvgPrice * 1.2 };

      let pricePosition: string;
      if (property.price < fairPriceRange.min) {
        pricePosition = "below_average";
      } else if (property.price > fairPriceRange.max) {
        pricePosition = "above_average";
      } else {
        pricePosition = "average";
      }

      const percentageDiff = Math.round(((property.price - cityAvgPrice) / cityAvgPrice) * 100);

      const currentMonth = format(new Date(), "yyyy-MM");
      const existingTrend: { month: string; avgPrice: number }[] =
        (property.priceIntelligence?.trend as { month: string; avgPrice: number }[]) ?? [];

      // Replace or append current month
      const trendWithoutCurrent = existingTrend.filter((t) => t.month !== currentMonth);
      const newTrend = [...trendWithoutCurrent, { month: currentMonth, avgPrice: cityAvgPrice }]
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      await Property.findByIdAndUpdate(property._id, {
        priceIntelligence: {
          cityAvgPrice,
          fairPriceRange,
          pricePosition,
          percentageDiff,
          trend: newTrend,
          lastUpdated: new Date(),
        },
      });

      updated++;
    }

    return successResponse({ updated });
  } catch (error) {
    return handleApiError(error);
  }
}
