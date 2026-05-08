import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const property = await Property.findById(id).populate("ownerId", "username avatar email createdAt");
    if (!property) return errorResponse("Property not found", 404);
    return successResponse({ property });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    const body = await req.json();
    // Build flat $set with dot-notation for nested fields to avoid wiping subdocuments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatSet: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if ((key === "videos" || key === "location") && value && typeof value === "object") {
        for (const [sk, sv] of Object.entries(value as Record<string, string>)) {
          if (sv !== undefined && sv !== null && sv !== "") flatSet[`${key}.${sk}`] = sv;
        }
      } else {
        flatSet[key] = value;
      }
    }
    // strict:false ensures videos subdocument saves even if model cache is stale
    const updated = await Property.findByIdAndUpdate(
      id,
      { $set: flatSet },
      { new: true, strict: false }
    );
    return successResponse({ property: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    await Property.findByIdAndDelete(id);
    return successResponse({ message: "Property deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
