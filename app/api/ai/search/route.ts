import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    requireAuth(req); // must be logged in to use AI search parser
    const { query } = await req.json();
    if (!query) return errorResponse("query required");

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a rental property search assistant. Parse the user's natural language query and extract structured search filters.
Return ONLY a JSON object with these optional fields:
- city: string
- minPrice: number (per night)
- maxPrice: number (per night)
- bedrooms: number (minimum)
- propertyType: "apartment" | "house" | "villa" | "studio" | "condo" | "cabin"
- amenities: string[] (from: WiFi, Parking, Kitchen, Pool, Gym, AC, TV, Washer)
- keywords: string (remaining search terms)

Example: {"city": "New York", "maxPrice": 150, "bedrooms": 2, "amenities": ["WiFi", "Parking"]}`,
        },
        { role: "user", content: query },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const filters = JSON.parse(completion.choices[0].message.content || "{}");
    return successResponse({ filters, originalQuery: query });
  } catch (e) { return handleApiError(e); }
}
