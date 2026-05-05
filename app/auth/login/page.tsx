"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Shield, Zap, Clock, CreditCard, Home } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import axios from "axios";

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="flex items-center gap-1 text-xs text-red-500 mt-1 overflow-hidden"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const FEATURES = [
  { text: "10,000+ verified properties", icon: Shield },
  { text: "Instant booking confirmation", icon: Zap },
  { text: "24/7 customer support", icon: Clock },
  { text: "Secure escrow payments", icon: CreditCard },
];

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Login failed"
        : "Something went wrong";
      setServerError(msg);
      toast.error(msg);
    }
  };

  const inputClass = (hasError: boolean, isTouched: boolean, value: string) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
      hasError && isTouched
        ? "border-red-400 focus:ring-red-200 bg-red-50 dark:border-red-700"
        : isTouched && value
        ? "border-green-400 focus:ring-green-200 bg-green-50/30 dark:border-green-700"
        : "border-zinc-200 dark:border-zinc-700 focus:ring-rose-200 focus:border-rose-400"
    }`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0">
          {[
            { w: 300, x: -5, y: -5, delay: 0 },
            { w: 200, x: 60, y: 50, delay: 1 },
            { w: 150, x: 80, y: 80, delay: 2 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, delay: orb.delay }}
              className="absolute rounded-full bg-white"
              style={{ width: orb.w, height: orb.w, left: `${orb.x}%`, top: `${orb.y}%` }}
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`p-${i}`}
              animate={{ y: [0, -25, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{ left: `${(i * 8.5) % 100}%`, top: `${(i * 11) % 100}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-14 text-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" className="flex items-center gap-3 mb-12 group w-fit">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
              >
                <Home className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-2xl font-bold group-hover:text-rose-200 transition-colors">Nest<span className="text-amber-300">ora</span></span>
            </Link>
            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">Welcome back!</h2>
            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-sm">
              Sign in to manage your bookings, wishlist, and discover new properties.
            </p>
            <div className="space-y-3">
              {FEATURES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ x: 8, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 group cursor-default"
                  >
                    <motion.div 
                      className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30"
                      whileHover={{ 
                        scale: 1.15, 
                        rotate: [0, -10, 10, -10, 0],
                        backgroundColor: "rgba(255,255,255,0.35)" 
                      }}
                      transition={{ duration: 0.5 }}
                      animate={{
                        y: [0, -3, 0],
                      }}
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "3s",
                        animationIterationCount: "infinite",
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </motion.div>
                    </motion.div>
                    <span className="text-white/90 text-sm group-hover:text-white transition-colors">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="absolute top-6 left-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg"
            >
              <Home className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-bold text-zinc-900 dark:text-white">Nest<span className="text-amber-500">ora</span></span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-7 sm:p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Sign in</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Enter your credentials to continue</p>
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <motion.div
                    animate={{ 
                      scale: emailValue ? [1, 1.1, 1] : 1,
                      color: errors.email ? "#ef4444" : touchedFields.email && emailValue ? "#22c55e" : "#a1a1aa"
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  >
                    <Mail className="w-4 h-4" />
                  </motion.div>
                  <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass(!!errors.email, !!touchedFields.email, emailValue)}
                    {...register("email")}
                  />
                  <AnimatePresence>
                    {touchedFields.email && emailValue && !errors.email && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <motion.div
                    animate={{ 
                      scale: passwordValue ? [1, 1.1, 1] : 1,
                      rotate: passwordValue ? [0, -5, 5, 0] : 0,
                      color: errors.password ? "#ef4444" : touchedFields.password && passwordValue ? "#22c55e" : "#a1a1aa"
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  >
                    <Lock className="w-4 h-4" />
                  </motion.div>
                  <input
                    suppressHydrationWarning
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputClass(!!errors.password, !!touchedFields.password, passwordValue)} pr-10`}
                    {...register("password")}
                  />
                  <motion.button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    <AnimatePresence mode="wait">
                      {showPass ? (
                        <motion.div 
                          key="off" 
                          initial={{ rotate: -90, opacity: 0, scale: 0.8 }} 
                          animate={{ rotate: 0, opacity: 1, scale: 1 }} 
                          exit={{ rotate: 90, opacity: 0, scale: 0.8 }} 
                          transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <EyeOff className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="on" 
                          initial={{ rotate: 90, opacity: 0, scale: 0.8 }} 
                          animate={{ rotate: 0, opacity: 1, scale: 1 }} 
                          exit={{ rotate: -90, opacity: 0, scale: 0.8 }} 
                          transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors inline-flex items-center gap-1 group"
                >
                  <motion.span
                    whileHover={{ x: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    Forgot password?
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>

              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-rose-500 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
