import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (user) {
      await User.findByIdAndUpdate(user.userId, { refreshToken: null });
    }
    const response = successResponse({ message: "Logged out successfully" });
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
