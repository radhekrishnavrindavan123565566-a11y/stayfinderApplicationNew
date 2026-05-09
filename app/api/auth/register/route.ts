import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 registrations per minute per IP
    const { success } = rateLimit(req, 3, 60000);
    if (!success) {
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }

    await connectDB();
    const body = await req.json();
    
    // Sanitize input
    const sanitized = sanitizeInput(body);
    
    const parsed = registerSchema.safeParse(sanitized);
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
    response.cookies.set("accessToken", accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
      path: '/'
    });
    response.cookies.set("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
      path: '/'
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
