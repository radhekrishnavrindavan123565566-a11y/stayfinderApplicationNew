import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();
const lastSentMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    // Step 1: Send OTP
    if (email && !otp) {
      const normalizedEmail = email.toLowerCase().trim();

      // Rate limit
      const lastSent = lastSentMap.get(normalizedEmail);
      if (lastSent && Date.now() - lastSent < 60_000) {
        const wait = Math.ceil((60_000 - (Date.now() - lastSent)) / 1000);
        return errorResponse(`Please wait ${wait}s before requesting another OTP`, 429);
      }

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return errorResponse("No account found with this email", 404);

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(normalizedEmail, { otp: generatedOtp, expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
      lastSentMap.set(normalizedEmail, Date.now());

      // Send via SMTP
      try {
        await sendEmail(
          normalizedEmail,
          `${generatedOtp} — Nestora Password Reset`,
          `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:16px;">
            <h2 style="color:#f43f5e;">Password Reset 🔐</h2>
            <p>Hi <strong>${user.username}</strong>,</p>
            <p>Use this OTP to reset your Nestora password:</p>
            <div style="background:#fef2f2;border:2px dashed #f43f5e;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
              <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#f43f5e;font-family:monospace;">${generatedOtp}</span>
            </div>
            <p style="color:#71717a;font-size:13px;">Valid for 10 minutes. Do not share with anyone.</p>
          </div>`
        );
      } catch (mailErr) {
        console.error("[forgot-password] Mail error:", mailErr);
      }

      return successResponse({
        message: "OTP sent to your email",
        ...(process.env.NODE_ENV !== "production" && { otp: generatedOtp }),
      });
    }

    // Step 2: Verify OTP + reset password
    if (email && otp && newPassword) {
      const normalizedEmail = email.toLowerCase().trim();
      const stored = otpStore.get(normalizedEmail);
      if (!stored) return errorResponse("OTP expired or not found. Request a new one.", 400);
      if (Date.now() > stored.expires) {
        otpStore.delete(normalizedEmail);
        return errorResponse("OTP has expired. Request a new one.", 400);
      }
      if (stored.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return errorResponse("Too many attempts. Request a new OTP.", 429);
      }
      stored.attempts += 1;
      if (stored.otp !== otp.toString()) return errorResponse("Invalid OTP", 400);
      if (newPassword.length < 6) return errorResponse("Password must be at least 6 characters", 400);

      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash(newPassword, 12);
      await User.updateOne({ email: normalizedEmail }, { $set: { password: hashed } });
      otpStore.delete(normalizedEmail);

      return successResponse({ message: "Password reset successfully" });
    }

    return errorResponse("Invalid request", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
