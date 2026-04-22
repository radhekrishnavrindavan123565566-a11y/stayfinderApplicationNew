"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import axios from "axios";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    if (!email.trim()) { setError("Enter your email address"); return; }
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || "Failed to send OTP" : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndReset = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email, otp, newPassword });
      toast.success("Password reset successfully!");
      setStep("done");
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || "Reset failed" : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white transition-all";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 relative overflow-hidden">
        <div className="absolute inset-0">
          {[300, 200, 150].map((w, i) => (
            <motion.div key={i}
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i }}
              className="absolute rounded-full bg-white"
              style={{ width: w, height: w, left: `${i * 30}%`, top: `${i * 25}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12 w-fit">
            <Image src="/logo.png" alt="MatchNest" width={40} height={40} className="rounded-2xl" />
            <span className="text-2xl font-bold">Match<span className="text-amber-300">Nest</span></span>
          </Link>
          <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">Reset your password</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            Enter your email, get an OTP, and set a new password in seconds.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen lg:min-h-0">
        <div className="absolute top-6 left-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MatchNest" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-zinc-900 dark:text-white">Match<span className="text-amber-500">Nest</span></span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-7 sm:p-8">

            {step === "done" ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Password Reset!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Your password has been updated successfully.</p>
                <Button onClick={() => router.push("/auth/login")} className="w-full">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Forgot Password</h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    {step === "email" && "Enter your registered email to receive an OTP"}
                    {step === "otp" && `Enter the 6-digit OTP sent to ${email}`}
                  </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {["email", "otp"].map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        step === s ? "bg-rose-500 text-white" :
                        (step === "otp" && s === "email") || step === "password" || step === "done" ? "bg-green-500 text-white" :
                        "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                      }`}>{i + 1}</div>
                      {i < 1 && <div className={`flex-1 h-0.5 w-8 ${step !== "email" ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />}
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400 overflow-hidden"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {step === "email" && (
                    <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                            placeholder="you@example.com"
                            className={inputBase}
                          />
                        </div>
                      </div>
                      <Button onClick={sendOtp} isLoading={loading} className="w-full" size="lg">
                        Send OTP <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {step === "otp" && (
                    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Enter OTP</label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="6-digit OTP"
                            className={`${inputBase} tracking-widest text-center text-lg font-bold`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <input
                            type={showPass ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className={`${inputBase} pr-10`}
                          />
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors" tabIndex={-1}>
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button onClick={verifyOtpAndReset} isLoading={loading} className="w-full" size="lg">
                        Reset Password <ArrowRight className="w-4 h-4" />
                      </Button>
                      <button onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                        className="w-full text-sm text-zinc-500 hover:text-rose-500 transition-colors">
                        Resend OTP
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-rose-500 font-medium hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
