import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error!.issues[0].message);

    const { username, email, password, role } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return errorResponse("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      phone: body.phone || "",
      phoneVerified: body.phoneVerified === true,
    });
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Use updateOne to avoid triggering any pre-save hooks
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const response = successResponse({ user, accessToken, refreshToken }, 201);
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 900 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
