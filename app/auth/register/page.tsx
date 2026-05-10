"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import {
  Mail, Lock, User, Eye, EyeOff, Phone,
  AlertCircle, CheckCircle2, ArrowRight, KeyRound, ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import axios from "axios";

type RegStep = "form" | "email-otp";

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="flex items-center gap-1 text-xs text-red-500 mt-1 overflow-hidden">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ chars", ok: password.length >= 6 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < score ? ["bg-red-400","bg-yellow-400","bg-green-500"][score - 1] : "bg-zinc-200 dark:bg-zinc-700"
          }`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] ${c.ok ? "text-green-600" : "text-zinc-400"}`}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const STATS = [
  { v: "10K+", l: "Properties" }, { v: "50K+", l: "Users" },
  { v: "120+", l: "Cities" },    { v: "4.9★", l: "Rating" },
];

function RegisterForm() {
  const [showPass, setShowPass]       = useState(false);
  const [serverError, setServerError] = useState("");
  const [regStep, setRegStep]         = useState<RegStep>("form");
  const [phoneValue, setPhoneValue]   = useState("");
  const [emailOtp, setEmailOtp]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError]   = useState(false);
  const [pendingData, setPendingData] = useState<RegisterInput | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted]         = useState(false);
  const { register: registerUser, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user) {
      router.push("/dashboard");
    }
  }, [user, router, mounted]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, touchedFields } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "tenant" as const },
    mode: "onChange",
  });

  const role          = watch("role");
  const passwordValue = watch("password", "");
  const emailValue    = watch("email", "");
  const usernameValue = watch("username", "");

  const inputCls = (err: boolean, touched: boolean, val: string) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
      err && touched   ? "border-red-400 focus:ring-red-200 bg-red-50 dark:border-red-700"
      : touched && val ? "border-green-400 focus:ring-green-200 bg-green-50/30 dark:border-green-700"
      : "border-zinc-200 dark:border-zinc-700 focus:ring-rose-200 focus:border-rose-400"
    }`;

  // Step 1 → send email OTP (phone saved but not SMS-verified)
  const onSubmit = async (data: RegisterInput) => {
    if (!termsAccepted) { setTermsError(true); toast.error("Accept Terms & Conditions"); return; }
    setTermsError(false); setServerError(""); setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { email: data.email, action: "verify-register" });
      setPendingData(data);
      setRegStep("email-otp");
      setResendTimer(60);
      toast.success("OTP sent to your email");
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || "Failed to send OTP" : "Something went wrong";
      setServerError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  // Step 2 → verify email OTP and register
  const verifyAndRegister = async () => {
    if (emailOtp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    if (!pendingData) return;
    setLoading(true); setServerError("");
    try {
      await axios.put("/api/auth/send-otp", { email: pendingData.email, otp: emailOtp });
      // Pass phone along — saved to DB, verified later via profile
      await registerUser({ ...pendingData } as RegisterInput);
      // Save phone separately after registration
      if (phoneValue.length === 10) {
        try {
          await axios.patch("/api/user/profile", { phone: `+91${phoneValue}` });
        } catch { /* non-critical */ }
      }
      // Immediate redirect
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || "Verification failed" : "Something went wrong";
      setServerError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    if (resendTimer > 0 || !pendingData) return;
    setLoading(true);
    try {
      await axios.post("/api/auth/send-otp", { email: pendingData.email, action: "verify-register" });
      setResendTimer(60); toast.success("OTP resent");
    } catch { toast.error("Failed to resend OTP"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.15, 0.06] }}
              transition={{ duration: 5 + i * 0.5, repeat: Infinity, delay: i * 0.6 }}
              className="absolute rounded-full bg-rose-500/30"
              style={{ width: `${80 + i * 25}px`, height: `${80 + i * 25}px`, left: `${(i * 11) % 80}%`, top: `${(i * 14) % 80}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14 text-white">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/" className="flex items-center gap-3 mb-12 group w-fit">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-2xl font-bold group-hover:text-amber-200 transition-colors">Stay<span className="text-amber-400">erra</span></span>
            </Link>
            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">Join us today</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-sm">
              Create your account and start exploring thousands of verified properties across UP.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s) => (
                <motion.div key={s.l} whileHover={{ scale: 1.04 }}
                  className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-rose-400">{s.v}</div>
                  <div className="text-xs text-zinc-400 mt-1">{s.l}</div>
                </motion.div>
              ))}
            </div>
            {/* Step indicator */}
            <div className="mt-10 flex items-center gap-3">
              {(["Details", "Verify Email"] as const).map((label, i) => {
                const active = (i === 0 && regStep === "form") || (i === 1 && regStep === "email-otp");
                const done   = i === 0 && regStep === "email-otp";
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done ? "bg-green-500 text-white" : active ? "bg-rose-500 text-white" : "bg-white/10 text-zinc-400"
                    }`}>{done ? "✓" : i + 1}</div>
                    <span className={`text-xs ${active ? "text-white" : "text-zinc-500"}`}>{label}</span>
                    {i < 1 && <div className="w-6 h-px bg-zinc-700" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">Stay<span className="text-amber-600">erra</span></span>
          </div>

          {/* Mobile step bar */}
          <div className="flex gap-2 mb-6 lg:hidden">
            {(["form","email-otp"] as RegStep[]).map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
                regStep === s ? "bg-rose-500" : i < (["form","email-otp"] as RegStep[]).indexOf(regStep) ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"
              }`} />
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-7 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Form ── */}
              {regStep === "form" && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Create account</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Step 1 of 2 — Your details</p>
                  </div>

                  <AnimatePresence>
                    {serverError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400 overflow-hidden">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Role toggle */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-5">
                    {(["tenant", "owner"] as const).map((r) => (
                      <label key={r} className="flex-1 cursor-pointer">
                        <input type="radio" value={r} {...register("role")} className="sr-only" />
                        <div className={`text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                          role === r ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500"
                        }`}>
                          {r === "tenant" ? "🏠 Tenant" : "🔑 Owner"}
                        </div>
                      </label>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input type="text" placeholder="johndoe" autoComplete="username"
                          className={inputCls(!!errors.username, !!touchedFields.username, usernameValue)}
                          {...register("username")} />
                        {touchedFields.username && usernameValue && !errors.username && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <FieldError message={errors.username?.message} />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input type="email" placeholder="you@example.com" autoComplete="email"
                          className={inputCls(!!errors.email, !!touchedFields.email, emailValue)}
                          {...register("email")} />
                        {touchedFields.email && emailValue && !errors.email && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <FieldError message={errors.email?.message} />
                    </div>

                    {/* Phone (optional, saved without SMS verification) */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Mobile number <span className="text-zinc-400 text-xs font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs text-zinc-500 font-medium">+91</span>
                        </div>
                        <input type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full pl-16 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                        />
                        {phoneValue.length === 10 && (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">You can verify your number later from your profile</p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                          autoComplete="new-password"
                          className={`${inputCls(!!errors.password, !!touchedFields.password, passwordValue)} pr-10`}
                          {...register("password")} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1" tabIndex={-1}>
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError message={errors.password?.message} />
                      <PasswordStrength password={passwordValue} />
                    </div>

                    {/* Terms */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${
                      termsError ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                      : termsAccepted ? "border-green-400 bg-green-50/30 dark:bg-green-950/10"
                      : "border-zinc-200 dark:border-zinc-700"
                    }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        termsAccepted ? "bg-rose-500 border-rose-500" : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        <input type="checkbox" checked={termsAccepted}
                          onChange={(e) => { setTermsAccepted(e.target.checked); if (e.target.checked) setTermsError(false); }}
                          className="sr-only" />
                        {termsAccepted && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" className="text-rose-500 font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                          Terms &amp; Conditions
                        </Link>
                      </span>
                    </label>
                    {termsError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Accept Terms to continue</p>}

                    <Button type="submit" isLoading={isSubmitting || loading} className="w-full" size="lg">
                      Continue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>

                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-5">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-rose-500 font-medium hover:underline">Sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Email OTP ── */}
              {regStep === "email-otp" && (
                <motion.div key="email-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Verify your email</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      Step 2 of 2 — OTP sent to<br />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{pendingData?.email}</span>
                    </p>
                  </div>

                  <AnimatePresence>
                    {serverError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400 overflow-hidden">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{serverError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">OTP Code</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input type="text" inputMode="numeric" maxLength={6} value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                          onKeyDown={(e) => e.key === "Enter" && verifyAndRegister()}
                          placeholder="• • • • • •"
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 tracking-[0.5em] text-center text-xl font-bold transition-all"
                        />
                      </div>
                    </div>

                    <Button onClick={verifyAndRegister} isLoading={loading} className="w-full" size="lg">
                      Verify &amp; Create Account <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button onClick={() => { setRegStep("form"); setEmailOtp(""); setServerError(""); }}
                        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                        ← Back
                      </button>
                      <button onClick={resendOtp} disabled={resendTimer > 0 || loading}
                        className="text-rose-500 hover:underline disabled:opacity-50 transition-colors">
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
