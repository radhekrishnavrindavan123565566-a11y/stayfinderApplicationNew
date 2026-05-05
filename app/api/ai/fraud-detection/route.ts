import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

interface FraudSignal {
  signal: string;
  severity: "low" | "medium" | "high";
  detail: string;
}

// Rule-based fraud scoring (works without OpenAI)
function ruleBasedScore(property: {
  price: number;
  title: string;
  description: string;
  images: string[];
  location: { city: string };
  propertyType: string;
  bedrooms: number;
}): { score: number; signals: FraudSignal[] } {
  const signals: FraudSignal[] = [];
  let score = 0;

  // Price anomaly — suspiciously cheap
  const cityAvgPrices: Record<string, number> = {
    lucknow: 8000, prayagraj: 6000, kanpur: 5500, varanasi: 5000,
    noida: 12000, agra: 5000, meerut: 5500,
  };
  const cityKey = property.location.city.toLowerCase();
  const avgPrice = cityAvgPrices[cityKey] || 7000;
  if (property.price < avgPrice * 0.3) {
    signals.push({ signal: "price_too_low", severity: "high", detail: `Price ₹${property.price} is unusually low for ${property.location.city}` });
    score += 35;
  } else if (property.price < avgPrice * 0.5) {
    signals.push({ signal: "price_below_market", severity: "medium", detail: `Price is 50% below market average` });
    score += 15;
  }

  // No images
  if (!property.images || property.images.length === 0) {
    signals.push({ signal: "no_images", severity: "high", detail: "No photos uploaded" });
    score += 25;
  } else if (property.images.length < 2) {
    signals.push({ signal: "few_images", severity: "low", detail: "Only 1 photo — legitimate listings usually have 3+" });
    score += 10;
  }

  // Short description
  if (!property.description || property.description.length < 50) {
    signals.push({ signal: "thin_description", severity: "medium", detail: "Description is very short" });
    score += 15;
  }

  // Suspicious keywords in title/description
  const suspiciousWords = ["urgent", "immediate", "abroad", "overseas", "wire transfer", "western union", "advance only", "no visit"];
  const text = `${property.title} ${property.description}`.toLowerCase();
  const found = suspiciousWords.filter(w => text.includes(w));
  if (found.length > 0) {
    signals.push({ signal: "suspicious_keywords", severity: "high", detail: `Contains suspicious terms: ${found.join(", ")}` });
    score += found.length * 20;
  }

  // Unrealistic bedroom count
  if (property.bedrooms > 10) {
    signals.push({ signal: "unrealistic_bedrooms", severity: "medium", detail: `${property.bedrooms} bedrooms is unusually high` });
    score += 15;
  }

  return { score: Math.min(score, 100), signals };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["owner", "admin"]); // only owners & admins can run fraud checks

    const { propertyId } = await req.json();
    if (!propertyId) return errorResponse("propertyId is required");

    const property = await Property.findById(propertyId).lean();
    if (!property) return errorResponse("Property not found", 404);

    // Rule-based scoring
    const { score: ruleScore, signals } = ruleBasedScore(property as Parameters<typeof ruleBasedScore>[0]);

    let aiAnalysis = "";
    let finalScore = ruleScore;

    // Enhance with GPT if available
    if (isOpenAIConfigured()) {
      const openai = getOpenAI();
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a rental fraud detection expert. Analyze this property listing and identify any red flags.
Return JSON: { "additionalScore": number (0-30), "aiSignals": string[], "verdict": "safe"|"suspicious"|"likely_fraud", "summary": string }`,
          },
          {
            role: "user",
            content: `Title: ${property.title}
            Description: ${property.description?.slice(0, 300)}
            Price: ₹${property.price}/month
            City: ${property.location.city}
            Type: ${property.propertyType}
            Bedrooms: ${property.bedrooms}
            Images: ${property.images?.length || 0}
            Rule-based signals: ${signals.map(s => s.signal).join(", ") || "none"}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0,
      });

      try {
        const aiResult = JSON.parse(res.choices[0].message.content || "{}");
        finalScore = Math.min(100, ruleScore + (aiResult.additionalScore || 0));
        aiAnalysis = aiResult.summary || "";
        if (aiResult.aiSignals?.length) {
          aiResult.aiSignals.forEach((s: string) => signals.push({ signal: "ai_detected", severity: "medium", detail: s }));
        }
      } catch { /* use rule score */ }
    }

    const verdict = finalScore >= 60 ? "likely_fraud" : finalScore >= 30 ? "suspicious" : "safe";
    const riskLevel = finalScore >= 60 ? "high" : finalScore >= 30 ? "medium" : "low";

    return successResponse({
      propertyId,
      fraudScore: finalScore,
      riskLevel,
      verdict,
      signals,
      aiAnalysis,
      recommendation: verdict === "likely_fraud"
        ? "This listing has multiple fraud indicators. Review before publishing."
        : verdict === "suspicious"
        ? "Some concerns detected. Manual review recommended."
        : "Listing appears legitimate.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
