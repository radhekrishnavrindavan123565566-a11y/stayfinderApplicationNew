import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// In-memory OTP store (use Redis in production)
const phoneOtpStore = new Map<string, { otp: string; expires: number; attempts: number }>();
const lastSentStore = new Map<string, number>();

const MAX_ATTEMPTS = 5;
const OTP_TTL_MS   = 10 * 60 * 1000; // 10 min
const RATE_LIMIT_MS = 60 * 1000;      // 1 min between sends

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

/** Send OTP via Fast2SMS DLT-free Quick SMS */
async function sendSmsVieFast2SMS(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === "your_fast2sms_api_key_here") {
    // No key configured — log to console for dev
    console.log(`[PHONE OTP DEV] ${phone}: ${otp}`);
    return;
  }

  // Strip +91 prefix — Fast2SMS expects 10-digit number
  const number = phone.replace(/^\+91/, "");

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "otp",          // OTP route (free, no DLT needed)
      variables_values: otp, // OTP value injected into template
      numbers: number,
      flash: 0,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.return === false) {
    console.error("[Fast2SMS Error]", data);
    throw new Error(data.message?.[0] || "Failed to send SMS");
  }

  console.log(`[Fast2SMS] OTP sent to ${phone}`);
}

// ── POST /api/auth/phone-otp — send OTP ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone } = await req.json();
    if (!phone) return errorResponse("Phone number is required");

    const normalized = normalizePhone(phone);

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      return errorResponse("Enter a valid 10-digit Indian mobile number");
    }

    // Rate limit
    const lastSent = lastSentStore.get(normalized);
    if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
      return errorResponse(`Please wait ${wait}s before requesting another OTP`, 429);
    }

    // Check not already registered
    const existing = await User.findOne({ phone: normalized, phoneVerified: true });
    if (existing) return errorResponse("This phone number is already registered", 409);

    const otp = generateOtp();
    phoneOtpStore.set(normalized, { otp, expires: Date.now() + OTP_TTL_MS, attempts: 0 });
    lastSentStore.set(normalized, Date.now());

    // Send SMS
    await sendSmsVieFast2SMS(normalized, otp);

    return successResponse({
      message: "OTP sent to your mobile number",
      phone: normalized,
      // Expose OTP only in development for easy testing
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ── PUT /api/auth/phone-otp — verify OTP ─────────────────────────────────────
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
      return errorResponse(
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        400
      );
    }

    phoneOtpStore.delete(normalized);

    // If authenticated, mark phone as verified on the user record
    try {
      const authUser = requireAuth(req);
      await User.updateOne(
        { _id: authUser.userId },
        { $set: { phone: normalized, phoneVerified: true } }
      );
    } catch {
      // Not authenticated during registration — that's fine
    }

    return successResponse({ verified: true, phone: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}
