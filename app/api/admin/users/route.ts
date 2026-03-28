import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);
    const users = await User.find().sort({ createdAt: -1 });
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
