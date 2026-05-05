import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getCityStats } from "@/lib/cityStats";

// All possible smart tags
const ALL_TAGS = [
  // Location-based
  "near-metro", "near-college", "near-hospital", "near-market", "city-center",
  "quiet-area", "gated-community", "prime-location",
  // Tenant-type
  "student-friendly", "working-professional", "family-friendly", "bachelor-friendly",
  "female-only", "couple-friendly",
  // Property features
  "fully-furnished", "semi-furnished", "unfurnished", "newly-renovated",
  "spacious", "compact", "high-floor", "ground-floor", "corner-unit",
  // Amenities
  "wifi-included", "ac-included", "parking-available", "gym-access",
  "swimming-pool", "24hr-security", "power-backup", "water-24hr",
  // Value
  "budget-friendly", "premium", "best-value", "price-negotiable",
  // Booking
  "instant-booking", "same-day-move-in", "flexible-lease", "short-term",
];

// Rule-based tagger (works without OpenAI) — uses real DB city averages
async function ruleBasedTags(property: {
  title: string;
  description: string;
  amenities: string[];
  price: number;
  location: { city: string; address: string };
  propertyType: string;
  bedrooms: number;
  instantBooking: boolean;
}): Promise<string[]> {
  const tags: string[] = [];
  const text = `${property.title} ${property.description} ${property.location.address}`.toLowerCase();
  const amenities = (property.amenities || []).map(a => a.toLowerCase());

  // Location tags
  if (text.includes("university") || text.includes("college") || text.includes("campus")) tags.push("near-college");
  if (text.includes("metro") || text.includes("station")) tags.push("near-metro");
  if (text.includes("hospital") || text.includes("medical")) tags.push("near-hospital");
  if (text.includes("market") || text.includes("mall")) tags.push("near-market");
  if (text.includes("gated") || text.includes("society")) tags.push("gated-community");

  // Tenant type
  if (text.includes("student") || text.includes("hostel") || text.includes("pg")) tags.push("student-friendly");
  if (text.includes("bachelor") || text.includes("single")) tags.push("bachelor-friendly");
  if (text.includes("family") || text.includes("families")) tags.push("family-friendly");
  if (text.includes("female") || text.includes("ladies") || text.includes("girls")) tags.push("female-only");
  if (text.includes("working") || text.includes("professional") || text.includes("office")) tags.push("working-professional");

  // Furnishing
  if (text.includes("fully furnished") || amenities.includes("furnished")) tags.push("fully-furnished");
  else if (text.includes("semi furnished") || text.includes("semi-furnished")) tags.push("semi-furnished");
  else if (text.includes("unfurnished")) tags.push("unfurnished");

  // Amenities
  if (amenities.some(a => a.includes("wifi"))) tags.push("wifi-included");
  if (amenities.some(a => a.includes("ac") || a.includes("air"))) tags.push("ac-included");
  if (amenities.some(a => a.includes("parking") || a.includes("car"))) tags.push("parking-available");
  if (amenities.some(a => a.includes("gym") || a.includes("fitness"))) tags.push("gym-access");
  if (amenities.some(a => a.includes("pool") || a.includes("swimming"))) tags.push("swimming-pool");
  if (amenities.some(a => a.includes("security") || a.includes("guard"))) tags.push("24hr-security");
  if (amenities.some(a => a.includes("power") || a.includes("backup"))) tags.push("power-backup");

  // Price-based — use real DB average for this city
  const cityStats = await getCityStats(property.location.city);
  const threshold = cityStats.avgPrice;
  if (property.price <= threshold * 0.7) tags.push("budget-friendly");
  else if (property.price >= threshold * 1.5) tags.push("premium");

  // Booking
  if (property.instantBooking) tags.push("instant-booking");

  return [...new Set(tags)];
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req);

    const { propertyId, save = false } = await req.json();
    if (!propertyId) return errorResponse("propertyId is required");

    const property = await Property.findById(propertyId).lean();
    if (!property) return errorResponse("Property not found", 404);

    // Rule-based tags first
    const ruleTags = await ruleBasedTags(property as Parameters<typeof ruleBasedTags>[0]);
    let finalTags = ruleTags;
    let aiTags: string[] = [];

    // Enhance with GPT
    if (isOpenAIConfigured()) {
      const openai = getOpenAI();
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a property tagging expert for Indian rental market.
Analyze the property and return ONLY a JSON array of relevant tags from this list:
${ALL_TAGS.join(", ")}
Return max 8 most relevant tags. Return format: {"tags": ["tag1", "tag2"]}`,
          },
          {
            role: "user",
            content: `Title: ${property.title}
Description: ${property.description?.slice(0, 400)}
Price: ₹${property.price}/month in ${property.location.city}
Type: ${property.propertyType}, Bedrooms: ${property.bedrooms}
Amenities: ${property.amenities?.join(", ")}
Address: ${property.location.address}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 150,
        temperature: 0,
      });

      try {
        const parsed = JSON.parse(res.choices[0].message.content || "{}");
        aiTags = (parsed.tags || []).filter((t: string) => ALL_TAGS.includes(t));
        finalTags = [...new Set([...ruleTags, ...aiTags])].slice(0, 10);
      } catch { /* use rule tags */ }
    }

    // Save tags to property if requested
    if (save) {
      await Property.findByIdAndUpdate(propertyId, { $set: { smartTags: finalTags } });
    }

    return successResponse({
      propertyId,
      tags: finalTags,
      ruleTags,
      aiTags,
      total: finalTags.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
