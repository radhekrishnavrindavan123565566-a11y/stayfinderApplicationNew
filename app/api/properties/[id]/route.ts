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
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    const body = await req.json();
    const updated = await Property.findByIdAndUpdate(id, body, { new: true, runValidators: true });
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
