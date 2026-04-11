import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import crypto from "crypto";

// Simple in-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    // Step 1: Send OTP
    if (email && !otp) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return errorResponse("No account found with this email", 404);

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email.toLowerCase(), { otp: generatedOtp, expires: Date.now() + 10 * 60 * 1000 });

      // In production, send via email service. For now, log it.
      console.log(`[OTP] Password reset OTP for ${email}: ${generatedOtp}`);

      // TODO: integrate nodemailer/sendgrid here
      // await sendEmail({ to: email, subject: "Password Reset OTP", text: `Your OTP is: ${generatedOtp}` });

      return successResponse({ message: "OTP sent to your email", otp: generatedOtp /* remove in prod */ });
    }

    // Step 2: Verify OTP + reset password
    if (email && otp && newPassword) {
      const stored = otpStore.get(email.toLowerCase());
      if (!stored) return errorResponse("OTP expired or not found. Request a new one.", 400);
      if (Date.now() > stored.expires) {
        otpStore.delete(email.toLowerCase());
        return errorResponse("OTP has expired. Request a new one.", 400);
      }
      if (stored.otp !== otp) return errorResponse("Invalid OTP", 400);

      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash(newPassword, 12);
      await User.updateOne({ email: email.toLowerCase() }, { $set: { password: hashed } });
      otpStore.delete(email.toLowerCase());

      return successResponse({ message: "Password reset successfully" });
    }

    return errorResponse("Invalid request", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
