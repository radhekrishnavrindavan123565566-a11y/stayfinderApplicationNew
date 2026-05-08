import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PropertyComparison from "@/models/PropertyComparison";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, errorResponse } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const comparisons = await PropertyComparison.find({ userId: user.userId })
      .populate("properties")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ comparisons });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { name, properties, notes } = await req.json();

    if (!properties || properties.length < 2) {
      return errorResponse("At least 2 properties required for comparison", 400);
    }

    if (properties.length > 4) {
      return errorResponse("Maximum 4 properties can be compared", 400);
    }

    const comparison = await PropertyComparison.create({
      userId: user.userId,
      name: name || `Comparison ${new Date().toLocaleDateString()}`,
      properties,
      notes,
    });

    const populated = await PropertyComparison.findById(comparison._id).populate("properties");

    return successResponse({ comparison: populated }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
