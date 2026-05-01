import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/mailer";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// In-memory OTP store — use Redis in production
const otpStore    = new Map<string, { otp: string; expires: number; attempts: number }>();
const lastSentMap = new Map<string, number>();

const OTP_TTL_MS    = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MS = 60 * 1000;       // 1 min between sends
const MAX_ATTEMPTS  = 5;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST — send OTP
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, action } = await req.json();
    if (!email) return errorResponse("Email is required");

    const normalizedEmail = email.toLowerCase().trim();

    if (action === "verify-register") {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) return errorResponse("This email is already registered", 409);
    }

    // Rate limit
    const lastSent = lastSentMap.get(normalizedEmail);
    if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
      return errorResponse(`Please wait ${wait}s before requesting another OTP`, 429);
    }

    const otp = generateOtp();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + OTP_TTL_MS, attempts: 0 });
    lastSentMap.set(normalizedEmail, Date.now());

    // Send via SMTP (falls back to console if not configured)
    try {
      await sendOtpEmail(normalizedEmail, otp, action);
    } catch (mailErr) {
      console.error("[send-otp] Mail error:", mailErr);
      // Don't block registration if mail fails — still return OTP in dev
    }

    return successResponse({
      message: "OTP sent to your email",
      // Only expose in development
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT — verify OTP
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return errorResponse("Email and OTP are required");

    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(normalizedEmail);

    if (!stored) return errorResponse("OTP not found. Request a new one.", 400);
    if (Date.now() > stored.expires) {
      otpStore.delete(normalizedEmail);
      return errorResponse("OTP expired. Request a new one.", 400);
    }
    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedEmail);
      return errorResponse("Too many attempts. Request a new OTP.", 429);
    }

    stored.attempts += 1;

    if (stored.otp !== otp.toString()) {
      const remaining = MAX_ATTEMPTS - stored.attempts;
      return errorResponse(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`, 400);
    }

    otpStore.delete(normalizedEmail);
    return successResponse({ verified: true });
  } catch (error) {
    return handleApiError(error);
  }
}
