import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property, { IProperty } from "@/models/Property";
import UserPreferences, { IUserPreferences } from "@/models/UserPreferences";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getActiveCities } from "@/lib/cityStats";

interface Breakdown {
  budget: number;
  bedrooms: number;
  amenities: number;
  location: number;
  tenantType: number;
}

async function computeMatchScore(
  property: IProperty,
  preferences: IUserPreferences
): Promise<{ score: number; reasons: string[]; tags: string[]; breakdown: Breakdown }> {
  const breakdown: Breakdown = { budget: 0, bedrooms: 0, amenities: 0, location: 0, tenantType: 0 };
  const reasons: string[] = [];
  const tags: string[] = [];

  // Budget — 25 pts
  const { min, max } = preferences.budget;
  if (max > 0) {
    if (property.price >= min && property.price <= max) {
      breakdown.budget = 25;
      reasons.push("Price fits your budget perfectly");
    } else if (property.price <= max * 1.1) {
      breakdown.budget = 15;
      reasons.push("Price is slightly above your budget");
    }
  }

  // Bedrooms — 20 pts
  const bedroomDiff = Math.abs(property.bedrooms - preferences.preferredBedrooms);
  if (bedroomDiff === 0) {
    breakdown.bedrooms = 20;
    reasons.push(`Exact bedroom match (${property.bedrooms} bed)`);
  } else if (bedroomDiff === 1) {
    breakdown.bedrooms = 10;
    reasons.push(`Close bedroom match (${property.bedrooms} bed, you prefer ${preferences.preferredBedrooms})`);
  }

  // Amenities — 20 pts proportional
  if (preferences.preferredAmenities.length > 0) {
    const propAmenities = property.amenities.map((a) => a.toLowerCase());
    const prefAmenities = preferences.preferredAmenities.map((a) => a.toLowerCase());
    const intersection = prefAmenities.filter((a) => propAmenities.includes(a));
    const ratio = intersection.length / prefAmenities.length;
    breakdown.amenities = Math.round(ratio * 20);
    if (ratio === 1) {
      reasons.push("Has all your preferred amenities");
      tags.push("Perfect Amenities");
    } else if (ratio >= 0.5) {
      reasons.push(`Has ${intersection.length} of ${prefAmenities.length} preferred amenities`);
    }
  }

  // Location — 20 pts
  const propCity = property.location.city.toLowerCase();
  const prefCities = preferences.preferredCities.map((c) => c.toLowerCase());
  if (prefCities.length > 0 && prefCities.includes(propCity)) {
    breakdown.location = 20;
    reasons.push(`Located in your preferred city (${property.location.city})`);
    tags.push("Preferred Location");
  }

  // Tenant type — 15 pts
  const type = preferences.tenantType;
  if (type === "student") {
    const isAffordable = max > 0 ? property.price <= max * 0.8 : property.price < 500;
    if (isAffordable) {
      breakdown.tenantType = 15;
      reasons.push("Affordable for students");
      tags.push("🎓 Student Friendly");
    }
  } else if (type === "family") {
    const hasKitchen = property.amenities.some((a) => a.toLowerCase() === "kitchen");
    if (property.bedrooms >= 2 && hasKitchen) {
      breakdown.tenantType = 15;
      reasons.push("Spacious with kitchen — great for families");
      tags.push("👨‍👩‍👧 Family Friendly");
    } else if (property.bedrooms >= 2 || hasKitchen) {
      breakdown.tenantType = 8;
      reasons.push("Partially suitable for families");
    }
  } else if (type === "professional") {
    // Use real active cities from DB instead of hardcoded list
    const activeCities = await getActiveCities();
    const isActivCity = activeCities.map(c => c.toLowerCase()).includes(propCity);
    if (isActivCity) {
      breakdown.tenantType = 15;
      reasons.push(`Active rental market in ${property.location.city} — ideal for professionals`);
      tags.push("💼 Professional Hub");
    }
  } else if (type === "couple") {
    if (property.bedrooms >= 1 && property.bedrooms <= 2) {
      breakdown.tenantType = 15;
      reasons.push("Cozy size — great for couples");
      tags.push("💑 Couple Friendly");
    }
  }

  const score = Math.min(
    100,
    breakdown.budget + breakdown.bedrooms + breakdown.amenities + breakdown.location + breakdown.tenantType
  );

  if (score >= 70) tags.push("Top Match");
  else if (score >= 40) tags.push("Good Match");

  return { score, reasons, tags, breakdown };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;

    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);

    const preferences = await UserPreferences.findOne({ userId: user.userId });
    if (!preferences) {
      return successResponse({
        score: 0,
        reasons: ["Set your preferences to get a match score"],
        tags: [],
        breakdown: { budget: 0, bedrooms: 0, amenities: 0, location: 0, tenantType: 0 },
      });
    }

    const result = await computeMatchScore(property, preferences);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
