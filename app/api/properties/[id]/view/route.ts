import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import UserPreferences from "@/models/UserPreferences";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: propertyId } = await params;

    // Increment viewCount
    const updated = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { viewCount: 1 } },
      { new: true, select: "viewCount" }
    );

    if (!updated) {
      return successResponse({ viewCount: 0 });
    }

    // If authenticated, upsert recentlyViewed
    const user = authenticateRequest(req);
    if (user) {
      const existing = await UserPreferences.findOne({ userId: user.userId });
      if (existing) {
        // Remove existing entry for this propertyId, then unshift new one, slice to 20
        const filtered = (existing.recentlyViewed || []).filter(
          (entry: { propertyId: { toString(): string } }) =>
            entry.propertyId.toString() !== propertyId
        );
        const updated_rv = [{ propertyId, viewedAt: new Date() }, ...filtered].slice(0, 20);
        await UserPreferences.findOneAndUpdate(
          { userId: user.userId },
          { $set: { recentlyViewed: updated_rv } }
        );
      } else {
        await UserPreferences.findOneAndUpdate(
          { userId: user.userId },
          { $set: { recentlyViewed: [{ propertyId, viewedAt: new Date() }] } },
          { upsert: true }
        );
      }
    }

    return successResponse({ viewCount: updated.viewCount });
  } catch (error) {
    return handleApiError(error);
  }
}
