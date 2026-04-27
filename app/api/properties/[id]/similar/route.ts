import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const source = await Property.findById(id).lean();
    if (!source) return successResponse({ properties: [] });

    // Score-based similarity: same city > same type > similar price > similar beds
    const candidates = await Property.find({
      _id: { $ne: id },
      isAvailable: true,
      "location.city": { $regex: source.location.city, $options: "i" },
    })
      .select("title price location propertyType bedrooms images averageRating totalReviews amenities")
      .limit(20)
      .lean();

    const scored = candidates.map((p) => {
      let score = 0;
      // Same type +3
      if (p.propertyType === source.propertyType) score += 3;
      // Price within 30% +2
      const priceDiff = Math.abs(p.price - source.price) / source.price;
      if (priceDiff <= 0.15) score += 2;
      else if (priceDiff <= 0.30) score += 1;
      // Same bedrooms +2
      if (p.bedrooms === source.bedrooms) score += 2;
      // Shared amenities +1 per match (max 3)
      const shared = (p.amenities || []).filter((a: string) => source.amenities?.includes(a)).length;
      score += Math.min(3, shared);
      return { ...p, _score: score };
    });

    const similar = scored
      .sort((a, b) => b._score - a._score)
      .slice(0, 4)
      .map(({ _score, ...p }) => p);

    return successResponse({ properties: similar });
  } catch (error) {
    return handleApiError(error);
  }
}
