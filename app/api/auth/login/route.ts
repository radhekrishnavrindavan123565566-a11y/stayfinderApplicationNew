import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error!.issues[0].message);

    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return errorResponse("Invalid credentials", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse("Invalid credentials", 401);

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const response = successResponse({ user, accessToken, refreshToken });
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 900 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
