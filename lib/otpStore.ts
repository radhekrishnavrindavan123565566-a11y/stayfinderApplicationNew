/**
 * Shared in-memory OTP store.
 * Used by /api/auth/send-otp (to write) and /api/agreements/[id]/sign (to verify).
 * In production, replace with Redis for multi-instance support.
 */

export const otpStore = new Map<string, { otp: string; expires: number; attempts: number }>();

export const OTP_TTL_MS   = 10 * 60 * 1000; // 10 minutes
export const MAX_ATTEMPTS = 5;

export interface OtpVerifyResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verify an OTP for a given email.
 * Consumes (deletes) the OTP on success.
 * Increments attempt counter on wrong code.
 */
export function verifyOtp(email: string, otp: string): OtpVerifyResult {
  const key = email.toLowerCase().trim();
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, reason: "OTP not found" };
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(key);
    return { valid: false, reason: "OTP expired" };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { valid: false, reason: "Too many attempts" };
  }

  if (stored.otp !== otp.toString()) {
    stored.attempts += 1;
    return { valid: false, reason: "Invalid OTP" };
  }

  // Correct — consume the OTP
  otpStore.delete(key);
  return { valid: true };
}
