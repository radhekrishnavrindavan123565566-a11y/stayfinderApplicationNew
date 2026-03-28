import { IUser } from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export type FraudSignal = {
  type: "new_account" | "no_reviews" | "price_anomaly" | "unverified_id" | "multiple_reports";
  severity: "low" | "medium" | "high";
  message: string;
};

export type FraudRiskResult = {
  level: "low" | "medium" | "high";
  signals: FraudSignal[];
};

// In-memory cache: Map<userId, { result, cachedAt }>
const fraudCache = new Map<string, { result: FraudRiskResult; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function computeProfileCompleteness(user: IUser): number {
  const weights: { value: unknown; weight: number }[] = [
    { value: user.avatar, weight: 15 },
    { value: user.username, weight: 10 },
    { value: user.email, weight: 10 },
    { value: (user as IUser & { phone?: string }).phone, weight: 15 },
    { value: (user as IUser & { bio?: string }).bio, weight: 10 },
    { value: user.ownerVerified ? "verified" : null, weight: 20 },
    { value: user.tenantVerified ? "verified" : null, weight: 20 },
  ];

  let score = 0;
  for (const { value, weight } of weights) {
    if (value !== null && value !== undefined && value !== "") {
      score += weight;
    }
  }
  return Math.min(100, score);
}

export async function assessFraudRisk(
  userId: string,
  propertyId?: string
): Promise<FraudRiskResult> {
  const cacheKey = `${userId}:${propertyId ?? ""}`;
  const cached = fraudCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.result;
  }

  await connectDB();

  const User = (await import("@/models/User")).default;
  const user = await User.findById(userId).lean<IUser & { createdAt: Date }>();
  if (!user) {
    const result: FraudRiskResult = { level: "low", signals: [] };
    fraudCache.set(cacheKey, { result, cachedAt: Date.now() });
    return result;
  }

  const signals: FraudSignal[] = [];
  let riskScore = 0;

  const now = Date.now();
  const accountAgeMs = now - new Date(user.createdAt).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // New account signal
  if (accountAgeMs < sevenDaysMs) {
    signals.push({
      type: "new_account",
      severity: "medium",
      message: "Account created less than 7 days ago",
    });
    riskScore += 30;
  }

  // No reviews signal
  let reviewCount = 0;
  try {
    const Review = (await import("@/models/Review")).default;
    reviewCount = await Review.countDocuments({ userId });
  } catch {
    reviewCount = 0;
  }

  if (reviewCount === 0 && accountAgeMs > thirtyDaysMs) {
    signals.push({
      type: "no_reviews",
      severity: "low",
      message: "No reviews on account",
    });
    riskScore += 10;
  }

  // Unverified owner signal
  if (user.role === "owner" && !user.ownerVerified) {
    signals.push({
      type: "unverified_id",
      severity: "high",
      message: "Owner identity not verified",
    });
    riskScore += 40;
  }

  // Price anomaly signal
  if (propertyId) {
    try {
      const Property = (await import("@/models/Property")).default;
      const property = await Property.findById(propertyId).lean();
      if (property) {
        const fairMin = property.priceIntelligence?.fairPriceRange?.min;
        if (fairMin && property.price < fairMin * 0.5) {
          signals.push({
            type: "price_anomaly",
            severity: "high",
            message: "Price significantly below market rate",
          });
          riskScore += 40;
        }
      }
    } catch {
      // ignore property fetch errors
    }
  }

  const level: "low" | "medium" | "high" =
    riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low";

  const result: FraudRiskResult = { level, signals };
  fraudCache.set(cacheKey, { result, cachedAt: Date.now() });
  return result;
}
