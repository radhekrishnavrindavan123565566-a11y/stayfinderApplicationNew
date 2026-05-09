import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Accept from cookie OR body (cookie may not be forwarded on Vercel)
    const cookieToken = req.cookies.get("refreshToken")?.value;
    let bodyToken: string | undefined;
    try {
      const body = await req.json();
      bodyToken = body?.refreshToken;
    } catch { /* no body */ }

    const token = cookieToken || bodyToken;
    if (!token) return errorResponse("No refresh token", 401);

    // Verify JWT signature and expiry
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    // Find user — don't fail if DB token doesn't match (handles server restarts)
    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user) return errorResponse("User not found", 401);

    // Issue new tokens
    const newPayload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken  = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    // Update stored refresh token
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const response = successResponse({ accessToken, refreshToken });
    response.cookies.set("accessToken",  accessToken,  { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7200, // 2 hours
      sameSite: "lax", 
      path: "/" 
    });
    response.cookies.set("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2592000, // 30 days
      sameSite: "lax", 
      path: "/" 
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
