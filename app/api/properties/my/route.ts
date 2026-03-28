import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { requireRole } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    const properties = await Property.find({ ownerId: user.userId }).sort({ createdAt: -1 });
    return successResponse({ properties });
  } catch (error) {
    return handleApiError(error);
  }
}
