import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // Accept refresh token from cookie OR request body (for cases where cookie isn't sent)
    const cookieToken = req.cookies.get("refreshToken")?.value;
    let bodyToken: string | undefined;
    try {
      const body = await req.json();
      bodyToken = body?.refreshToken;
    } catch { /* no body */ }

    const token = cookieToken || bodyToken;
    if (!token) return errorResponse("No refresh token", 401);

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return errorResponse("Invalid or expired refresh token", 401);
    }
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) return errorResponse("Invalid refresh token", 401);

    const newPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    user.refreshToken = refreshToken;
    await user.save();

    const response = successResponse({ accessToken, refreshToken });
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 900 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
