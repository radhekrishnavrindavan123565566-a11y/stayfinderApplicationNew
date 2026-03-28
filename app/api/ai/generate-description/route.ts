import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const { title, propertyType, bedrooms, bathrooms, amenities, city, highlights } = await req.json();
    if (!title || !propertyType) return errorResponse("title and propertyType required");

    const openai = getOpenAI();
    const prompt = `Write a compelling, warm, and professional rental property description for:
- Title: ${title}
- Type: ${propertyType}
- Location: ${city || "a great location"}
- Bedrooms: ${bedrooms || 1}, Bathrooms: ${bathrooms || 1}
- Amenities: ${amenities?.join(", ") || "standard amenities"}
- Highlights: ${highlights || "comfortable and well-maintained"}

Write 2-3 paragraphs (150-200 words). Be specific, inviting, and highlight the lifestyle benefits. Do not use generic filler phrases.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const description = completion.choices[0].message.content?.trim() || "";
    return successResponse({ description });
  } catch (e) { return handleApiError(e); }
}
