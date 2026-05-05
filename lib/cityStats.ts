/**
 * Centralized city statistics computed from real DB data.
 * Used by fraud-detection, auto-tag, match-score, price-intelligence.
 * Falls back to sensible defaults if DB has insufficient data.
 */
import Property from "@/models/Property";

const FALLBACK_PRICES: Record<string, number> = {
  lucknow: 8000, prayagraj: 6000, kanpur: 5500, varanasi: 5000,
  noida: 12000, agra: 5000, meerut: 5500, ghaziabad: 9000,
  mathura: 4500, aligarh: 4000, bareilly: 4500, moradabad: 4000,
  gorakhpur: 4000, jhansi: 4000, firozabad: 3800,
};

interface CityStats {
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  trend: { month: string; avgPrice: number }[];
}

// Cache for 30 minutes to avoid hammering DB on every request
const cache = new Map<string, { data: CityStats; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function getCityStats(city: string): Promise<CityStats> {
  const key = city.toLowerCase().trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const agg = await Property.aggregate([
      {
        $match: {
          "location.city": { $regex: key, $options: "i" },
          isAvailable: true,
          price: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          count: { $sum: 1 },
          prices: { $push: "$price" },
        },
      },
    ]);

    // 12-month price trend
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const trendAgg = await Property.aggregate([
      {
        $match: {
          "location.city": { $regex: key, $options: "i" },
          createdAt: { $gte: twelveMonthsAgo },
          price: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trend = trendAgg.map((t: { _id: { month: number }; avgPrice: number }) => ({
      month: MONTHS[t._id.month - 1],
      avgPrice: Math.round(t.avgPrice),
    }));

    if (!agg.length || agg[0].count < 3) {
      // Not enough data — use fallback
      const fallback = FALLBACK_PRICES[key] || 7000;
      const stats: CityStats = {
        avgPrice: fallback,
        medianPrice: fallback,
        minPrice: Math.round(fallback * 0.4),
        maxPrice: Math.round(fallback * 2.5),
        totalListings: agg[0]?.count || 0,
        trend,
      };
      cache.set(key, { data: stats, ts: Date.now() });
      return stats;
    }

    const row = agg[0];
    // Compute median from prices array
    const sorted = [...row.prices].sort((a: number, b: number) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    const stats: CityStats = {
      avgPrice: Math.round(row.avgPrice),
      medianPrice: Math.round(median),
      minPrice: Math.round(row.minPrice),
      maxPrice: Math.round(row.maxPrice),
      totalListings: row.count,
      trend,
    };

    cache.set(key, { data: stats, ts: Date.now() });
    return stats;
  } catch {
    const fallback = FALLBACK_PRICES[key] || 7000;
    return {
      avgPrice: fallback,
      medianPrice: fallback,
      minPrice: Math.round(fallback * 0.4),
      maxPrice: Math.round(fallback * 2.5),
      totalListings: 0,
      trend: [],
    };
  }
}

/** Returns all cities that have listings, sorted by listing count */
export async function getActiveCities(): Promise<string[]> {
  try {
    const agg = await Property.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    return agg.map((r: { _id: string }) => r._id);
  } catch {
    return Object.keys(FALLBACK_PRICES);
  }
}
