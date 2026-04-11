import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, action } = await req.json();
    if (!email) return errorResponse("Email is required");

    const normalizedEmail = email.toLowerCase();

    if (action === "verify-register") {
      // Check email not already used
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) return errorResponse("This email is already registered", 409);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + 10 * 60 * 1000 });

    console.log(`[OTP] ${action} OTP for ${normalizedEmail}: ${otp}`);
    // TODO: send via email service in production

    return successResponse({ message: "OTP sent to your email", otp /* remove in prod */ });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return errorResponse("Email and OTP are required");

    const normalizedEmail = email.toLowerCase();
    const stored = otpStore.get(normalizedEmail);
    if (!stored) return errorResponse("OTP not found. Request a new one.", 400);
    if (Date.now() > stored.expires) {
      otpStore.delete(normalizedEmail);
      return errorResponse("OTP expired. Request a new one.", 400);
    }
    if (stored.otp !== otp) return errorResponse("Invalid OTP", 400);

    otpStore.delete(normalizedEmail);
    return successResponse({ verified: true });
  } catch (error) {
    return handleApiError(error);
  }
}
