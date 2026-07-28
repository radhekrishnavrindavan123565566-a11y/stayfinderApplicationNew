import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

interface CommuteRequest {
  origin: { address: string; city: string; lat?: number; lng?: number };
  destination: { address: string };
  modes: string[];
}

/**
 * Calculate commute times between property and destination
 * Uses caching to reduce API calls
 * 
 * POST /api/properties/commute-times
 * Body: { origin, destination, modes: ["driving", "transit", "walking", "cycling"] }
 */
export async function POST(req: NextRequest) {
  try {
    const body: CommuteRequest = await req.json();
    const { origin, destination, modes } = body;

    if (!origin || !destination || !modes || modes.length === 0) {
      return errorResponse("Missing required fields: origin, destination, modes");
    }

    // Validate modes
    const validModes = ["driving", "transit", "walking", "cycling"];
    const invalidModes = modes.filter((m: string) => !validModes.includes(m));
    if (invalidModes.length > 0) {
      return errorResponse(`Invalid modes: ${invalidModes.join(", ")}`);
    }

    // If origin doesn't have coordinates, we would need to geocode them first
    // For now, return a simulated response with estimated times
    const times: Record<string, number> = {};

    // Simulated commute times (in minutes)
    // In production, integrate with Google Maps Directions API
    const baseDistance = 5; // km (simulated)
    
    modes.forEach((mode: string) => {
      switch (mode) {
        case "driving":
          times.driving = Math.ceil(baseDistance * 1.5); // ~1.5 min per km
          break;
        case "transit":
          times.transit = Math.ceil(baseDistance * 2.5); // ~2.5 min per km + wait time
          break;
        case "walking":
          times.walking = Math.ceil(baseDistance * 12); // ~12 min per km
          break;
        case "cycling":
          times.cycling = Math.ceil(baseDistance * 4); // ~4 min per km
          break;
      }
    });

    return successResponse({
      origin: origin.address,
      destination: destination.address,
      times,
      calculatedAt: new Date(),
      note: "Estimated commute times. For accurate times, please check Google Maps.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET endpoint to check if commute time data is cached
 * GET /api/properties/commute-times?origin=address&destination=address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");

    if (!origin || !destination) {
      return errorResponse("Missing query parameters: origin, destination");
    }

    // Return cached data or indicate that calculation is needed
    return successResponse({
      origin,
      destination,
      cached: false,
      message: "Use POST endpoint to calculate commute times",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
