import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const phoneOtpStore = new Map<string, { otp: string; expires: number; attempts: number }>();
const lastSentStore = new Map<string, number>();

const MAX_ATTEMPTS  = 5;
const OTP_TTL_MS    = 10 * 60 * 1000;
const RATE_LIMIT_MS = 60 * 1000;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

async function sendSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === "your_fast2sms_api_key_here") {
    console.log(`[PHONE OTP DEV] ${phone}: ${otp}`);
    return;
  }

  const number = phone.replace(/^\+91/, "");
  const message = `Your Nestora OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  console.log(`[Fast2SMS] Sending to ${number}`);

  // Promotional route — works immediately with balance, no DLT/website verification
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&sender_id=FSTSMS&message=${encodeURIComponent(message)}&language=english&route=p&numbers=${number}`;

  let res: Response;
  let data: Record<string, unknown>;

  try {
    res = await fetch(url, { method: "GET" });
    data = await res.json() as Record<string, unknown>;
  } catch (err) {
    console.error("[Fast2SMS] Network error:", err);
    throw new Error("SMS service unreachable. Please try again.");
  }

  console.log("[Fast2SMS] Response:", JSON.stringify(data));

  if (!res.ok || data.return === false) {
    const msg = Array.isArray(data.message)
      ? (data.message as string[])[0]
      : String(data.message ?? "Failed to send SMS");
    throw new Error(msg);
  }

  console.log(`[Fast2SMS] ✓ Sent to ${phone}`);
}

// POST — send OTP
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone } = await req.json();
    if (!phone) return errorResponse("Phone number is required");

    const normalized = normalizePhone(phone);

    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      return errorResponse("Enter a valid 10-digit Indian mobile number");
    }

    const lastSent = lastSentStore.get(normalized);
    if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
      const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSent)) / 1000);
      return errorResponse(`Please wait ${wait}s before requesting another OTP`, 429);
    }

    const existing = await User.findOne({ phone: normalized, phoneVerified: true });
    if (existing) return errorResponse("This phone number is already registered", 409);

    const otp = generateOtp();
    phoneOtpStore.set(normalized, { otp, expires: Date.now() + OTP_TTL_MS, attempts: 0 });
    lastSentStore.set(normalized, Date.now());

    try {
      await sendSms(normalized, otp);
    } catch (smsErr) {
      phoneOtpStore.delete(normalized);
      lastSentStore.delete(normalized);
      const msg = smsErr instanceof Error ? smsErr.message : "Failed to send SMS";
      return errorResponse(`SMS Error: ${msg}`, 500);
    }

    return successResponse({
      message: "OTP sent to your mobile number",
      phone: normalized,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT — verify OTP
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

    try {
      const authUser = requireAuth(req);
      await User.updateOne({ _id: authUser.userId }, { $set: { phone: normalized, phoneVerified: true } });
    } catch {
      // Not authenticated during registration — fine
    }

    return successResponse({ verified: true, phone: normalized });
  } catch (error) {
    return handleApiError(error);
  }
}
