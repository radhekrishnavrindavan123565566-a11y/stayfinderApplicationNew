import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return errorResponse("User not found", 404);
    return successResponse({ message: "User deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);
    const { id } = await params;
    const body = await req.json();
    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) return errorResponse("User not found", 404);
    return successResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
