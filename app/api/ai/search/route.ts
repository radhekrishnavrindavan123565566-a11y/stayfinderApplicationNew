import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    // public endpoint — no auth required
    const { query } = await req.json();
    if (!query) return errorResponse("query required");

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a rental property search assistant for India.
Parse the user's natural language query and extract structured search filters.
Return ONLY a JSON object with these optional fields:
- city: string (Indian city name)
- minPrice: number (monthly rent in INR)
- maxPrice: number (monthly rent in INR)
- bedrooms: number (minimum)
- propertyType: "apartment" | "house" | "villa" | "studio" | "condo" | "cabin"
- amenities: string[] (from: WiFi, Parking, Kitchen, Pool, Gym, AC, TV, Washer)
- keywords: string (remaining search terms)
- nearLocation: string (landmark or area name)

Example: {"city": "Allahabad", "maxPrice": 8000, "bedrooms": 2, "amenities": ["WiFi"]}
Price parsing: "₹8000", "8 thousand", "8k" all map to 8000. "1BHK"→bedrooms:1, "2BHK"→bedrooms:2.`,
        },
        { role: "user", content: query },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    let filters;
    try {
      filters = JSON.parse(completion.choices[0].message.content || "{}");
    } catch {
      filters = {};
    }
    return successResponse({ filters, originalQuery: query });
  } catch (e) { return handleApiError(e); }
}
