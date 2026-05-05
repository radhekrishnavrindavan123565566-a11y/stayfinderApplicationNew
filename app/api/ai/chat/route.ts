import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// RAG-based property assistant
// 1. Parse user intent with GPT
// 2. Query MongoDB with extracted filters
// 3. Feed results back to GPT as context
// 4. Return natural language answer + matching properties

export async function POST(req: NextRequest) {
  try {
    // Auth is optional for the chat — anonymous users can search,
    // but we attach user context when available for personalisation
    const _user = authenticateRequest(req);
    const { message, history = [] } = await req.json();
    if (!message?.trim()) return errorResponse("Message is required");

    await connectDB();

    // ── Step 1: Extract search intent ────────────────────────────────────────
    let filters: Record<string, unknown> = {};
    let properties: unknown[] = [];

    if (isOpenAIConfigured()) {
      const openai = getOpenAI();

      const intentRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a property search intent extractor for Nestora, a rental platform in Uttar Pradesh, India.
Extract search filters from the user message. Return ONLY valid JSON with these optional fields:
{
  "city": string,
  "minPrice": number,
  "maxPrice": number,
  "bedrooms": number,
  "propertyType": "apartment"|"house"|"villa"|"studio"|"condo"|"cabin",
  "amenities": string[],
  "nearLocation": string,
  "isPropertyQuery": boolean
}
Set isPropertyQuery=true only if user is asking about properties/rooms/PGs.`,
          },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
        temperature: 0,
      });

      try {
        filters = JSON.parse(intentRes.choices[0].message.content || "{}");
      } catch { filters = {}; }

      // ── Step 2: Fetch matching properties from DB ─────────────────────────
      if (filters.isPropertyQuery !== false) {
        const query: Record<string, unknown> = { isAvailable: true };
        if (filters.city) query["location.city"] = { $regex: filters.city as string, $options: "i" };
        if (filters.propertyType) query.propertyType = filters.propertyType;
        if (filters.bedrooms) query.bedrooms = { $gte: filters.bedrooms };
        if (filters.minPrice || filters.maxPrice) {
          query.price = {};
          if (filters.minPrice) (query.price as Record<string, unknown>).$gte = filters.minPrice;
          if (filters.maxPrice) (query.price as Record<string, unknown>).$lte = filters.maxPrice;
        }
        if (filters.nearLocation) {
          const near = { $regex: filters.nearLocation as string, $options: "i" };
          query.$or = [{ "location.address": near }, { "location.city": near }, { title: near }, { description: near }];
        }

        properties = await Property.find(query)
          .select("title price location propertyType bedrooms bathrooms amenities averageRating images")
          .sort({ isBoosted: -1, averageRating: -1 })
          .limit(5)
          .lean();
      }

      // ── Step 3: Generate natural language response ────────────────────────
      const propertyContext = properties.length > 0
        ? `\n\nMatching properties found:\n${properties.map((p: unknown) => {
            const prop = p as { title: string; price: number; location: { city: string }; propertyType: string; bedrooms: number; averageRating: number };
            return `- ${prop.title} | ₹${prop.price.toLocaleString("en-IN")}/month | ${prop.location.city} | ${prop.propertyType} | ${prop.bedrooms} bed | Rating: ${prop.averageRating || "New"}`;
          }).join("\n")}`
        : "\n\nNo exact matches found in database.";

      const chatMessages = [
        {
          role: "system" as const,
          content: `You are Nestora's friendly AI assistant helping users find rental properties in Uttar Pradesh, India.
You help with property searches, pricing questions, booking guidance, and general rental advice.
Be concise, helpful, and warm. Use ₹ for prices. Mention specific properties when available.
If no properties match, suggest adjusting filters or browsing all listings.${propertyContext}`,
        },
        ...history.slice(-6).map((h: { role: string; content: string }) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user" as const, content: message },
      ];

      const chatRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        max_tokens: 400,
        temperature: 0.7,
      });

      const reply = chatRes.choices[0].message.content?.trim() || "I couldn't process that. Please try again.";
      return successResponse({ reply, properties, filters });
    }

    // ── Fallback: no OpenAI key — rule-based response ─────────────────────
    const lower = message.toLowerCase();
    let reply = "I can help you find properties! Try asking something like 'Show me 2BHK flats in Lucknow under ₹10000'.";

    if (lower.includes("price") || lower.includes("cost") || lower.includes("rent")) {
      reply = "Rental prices in UP range from ₹3,000 for PG rooms to ₹25,000+ for furnished apartments. What city and budget are you looking at?";
    } else if (lower.includes("lucknow") || lower.includes("prayagraj") || lower.includes("kanpur") || lower.includes("varanasi")) {
      const city = lower.includes("lucknow") ? "Lucknow" : lower.includes("prayagraj") ? "Prayagraj" : lower.includes("kanpur") ? "Kanpur" : "Varanasi";
      properties = await Property.find({ "location.city": { $regex: city, $options: "i" }, isAvailable: true })
        .select("title price location propertyType bedrooms images averageRating")
        .sort({ averageRating: -1 }).limit(4).lean();
      reply = `I found ${properties.length} properties in ${city}. Here are the top results!`;
    }

    return successResponse({ reply, properties, filters });
  } catch (error) {
    return handleApiError(error);
  }
}
