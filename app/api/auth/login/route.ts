import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeInput } from "@/lib/sanitize";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@nestora.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@Nestora2025";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute
    const { success, remaining } = rateLimit(req, 5, 60000);
    if (!success) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    await connectDB();
    const body = await req.json();
    
    // Sanitize input to prevent NoSQL injection
    const sanitized = sanitizeInput(body);
    
    const parsed = loginSchema.safeParse(sanitized);
    if (!parsed.success) return errorResponse(parsed.error!.issues[0].message);

    const { email, password } = parsed.data;

    // ── Static admin credentials check ──────────────────────────────
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) return errorResponse("Invalid credentials", 401);

      // Upsert admin user in DB so the rest of the app works normally
      let adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
      if (!adminUser) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        adminUser = await User.create({
          username: "Admin",
          email: ADMIN_EMAIL.toLowerCase(),
          password: hashed,
          role: "admin",
        });
      } else if (adminUser.role !== "admin") {
        await User.updateOne({ _id: adminUser._id }, { $set: { role: "admin" } });
        adminUser.role = "admin";
      }

      const payload = { userId: adminUser._id.toString(), email: adminUser.email, role: "admin" as const };
      const accessToken  = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      await User.updateOne({ _id: adminUser._id }, { $set: { refreshToken } });

      const response = successResponse({ user: adminUser, accessToken, refreshToken });
      response.cookies.set("accessToken",  accessToken,  { httpOnly: true, maxAge: 900 });
      response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800 });
      return response;
    }
    // ────────────────────────────────────────────────────────────────

    const user = await User.findOne({ email }).select("+password");
    if (!user) return errorResponse("Invalid credentials", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse("Invalid credentials", 401);

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken  = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    const response = successResponse({ user, accessToken, refreshToken });
    response.cookies.set("accessToken",  accessToken,  { httpOnly: true, maxAge: 900 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
