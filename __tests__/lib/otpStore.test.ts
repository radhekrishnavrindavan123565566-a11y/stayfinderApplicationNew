import { describe, test, expect, beforeEach } from 'vitest';
import { otpStore, verifyOtp, OTP_TTL_MS } from '@/lib/otpStore';

describe('OTP Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    otpStore.clear();
  });

  test('verifyOtp returns { valid: true } and deletes entry on correct OTP', () => {
    const email = 'test@example.com';
    const otp = '123456';
    
    // Add OTP to store
    otpStore.set(email, {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const result = verifyOtp(email, otp);

    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(otpStore.has(email)).toBe(false); // Should be deleted
  });

  test('verifyOtp returns { valid: false, reason: "OTP expired" } for expired entries', () => {
    const email = 'test@example.com';
    const otp = '123456';
    
    // Add expired OTP to store
    otpStore.set(email, {
      otp,
      expires: Date.now() - 1000, // Expired 1 second ago
      attempts: 0,
    });

    const result = verifyOtp(email, otp);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('OTP expired');
    expect(otpStore.has(email)).toBe(false); // Should be deleted
  });

  test('verifyOtp returns { valid: false, reason: "OTP not found" } when key is absent', () => {
    const email = 'nonexistent@example.com';
    const otp = '123456';

    const result = verifyOtp(email, otp);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('OTP not found');
  });

  test('verifyOtp returns { valid: false, reason: "Invalid OTP" } for wrong code', () => {
    const email = 'test@example.com';
    const correctOtp = '123456';
    const wrongOtp = '654321';
    
    // Add OTP to store
    otpStore.set(email, {
      otp: correctOtp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const result = verifyOtp(email, wrongOtp);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Invalid OTP');
    expect(otpStore.has(email)).toBe(true); // Should still exist
    expect(otpStore.get(email)?.attempts).toBe(1); // Attempt counter incremented
  });

  test('verifyOtp handles case-insensitive email and trims whitespace', () => {
    const email = 'Test@Example.com';
    const normalizedEmail = 'test@example.com';
    const otp = '123456';
    
    // Add OTP with normalized email
    otpStore.set(normalizedEmail, {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    // Verify with different casing and whitespace
    const result = verifyOtp('  TEST@EXAMPLE.COM  ', otp);

    expect(result.valid).toBe(true);
    expect(otpStore.has(normalizedEmail)).toBe(false); // Should be deleted
  });

  test('verifyOtp returns { valid: false, reason: "Too many attempts" } after max attempts', () => {
    const email = 'test@example.com';
    const otp = '123456';
    
    // Add OTP with max attempts reached
    otpStore.set(email, {
      otp,
      expires: Date.now() + OTP_TTL_MS,
      attempts: 5, // MAX_ATTEMPTS
    });

    const result = verifyOtp(email, otp);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Too many attempts');
    expect(otpStore.has(email)).toBe(false); // Should be deleted
  });
});
