import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// In-memory OTP store keyed by phone number (use Redis in production)
const phoneOtpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MS = 60 * 1000;    // 1 minute between sends
const lastSentStore = new Map<string, number>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone: string): string {
  // Strip spaces/dashes, ensure +91 prefix for Indian numbers
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

// POST /api/auth/phone-otp — send OTP to phone
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone } = await req.json();
    if (!phone) return errorResponse("Phone number is required");

    const normalized = normalizePhone(phone);

    // Validate Indian mobile number format
    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      return errorResponse("Enter a valid 10-digit Indian mobile number");
    }

    // Rate limiting — 1 OTP per minute per number
    const lastSent = lastSentStore.get(normalized);
    if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
      return errorResponse(`Please wait ${wait}s before requesting another OTP`, 429);
    }

    // Check phone not already verified by another user
    const existing = await User.findOne({ phone: normalized, phoneVerified: true });
    if (existing) return errorResponse("This phone number is already registered", 409);

    const otp = generateOtp();
    phoneOtpStore.set(normalized, { otp, expires: Date.now() + OTP_TTL_MS, attempts: 0 });
    lastSentStore.set(normalized, Date.now());

    // TODO: Integrate real SMS provider (Twilio / MSG91 / Fast2SMS)
    // Example with MSG91:
    // await axios.post("https://api.msg91.com/api/v5/otp", {
    //   template_id: process.env.MSG91_TEMPLATE_ID,
    //   mobile: normalized,
    //   authkey: process.env.MSG91_AUTH_KEY,
    //   otp,
    // });

    console.log(`[PHONE OTP] ${normalized}: ${otp}`);

    return successResponse({
      message: "OTP sent to your phone number",
      phone: normalized,
      // Remove otp from response in production
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/auth/phone-otp — verify OTP
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { phone, otp } = await req.json();
    if (!phone || !otp) return errorResponse("Phone and OTP are required");

    const normalized = normalizePhone(phone);
    const stored = phoneOtpStore.get(normalized);

    if (!stored) return errorResponse("OTP not found. Request a new one.", 400);
    if (Date.now() > stored.expires) {
      phoneOtpStore.delete(normalized);
      return errorResponse("OTP expired. Request a new one.", 400);
    }
    if (stored.attempts >= MAX_ATTEMPTS) {
      phoneOtpStore.delete(normalized);
      return errorResponse("Too many attempts. Request a new OTP.", 429);
    }

    stored.attempts += 1;

    if (stored.otp !== otp.toString()) {
      const remaining = MAX_ATTEMPTS - stored.attempts;
      return errorResponse(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`, 400);
    }

    phoneOtpStore.delete(normalized);

    // If user is authenticated, mark their phone as verified
    try {
      const authUser = requireAuth(req);
      await User.updateOne(
        { _id: authUser.userId },
        { $set: { phone: normalized, phoneVerified: true } }
      );
    } catch {
      // Not authenticated — verification token returned for use during registration
    }

    return successResponse({ verified: true, phone: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}
