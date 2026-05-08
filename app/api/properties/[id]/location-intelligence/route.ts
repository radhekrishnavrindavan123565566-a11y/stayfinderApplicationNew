import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

interface AmenityInput {
  type: string;
  name: string;
  distanceKm: number;
  walkTimeMinutes: number;
}

interface RequestBody {
  nearbyAmenities: AmenityInput[];
  safetyScore: number;
  safetyLabel: string;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;

    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);

    const isOwner = property.ownerId.toString() === user.userId;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) return errorResponse("Forbidden", 403);

    const body: RequestBody = await req.json();
    const { nearbyAmenities, safetyScore, safetyLabel } = body;

    if (typeof safetyScore !== "number" || safetyScore < 0 || safetyScore > 100) {
      return errorResponse("safetyScore must be a number between 0 and 100", 400);
    }

    property.locationIntelligence = {
      nearbyAmenities: nearbyAmenities ?? [],
      safetyScore,
      safetyLabel,
      lastUpdated: new Date(),
    };

    await property.save();

    return successResponse({ property });
  } catch (error) {
    return handleApiError(error);
  }
}
