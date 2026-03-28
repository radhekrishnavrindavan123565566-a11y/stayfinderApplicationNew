"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { Home, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
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

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ chars", ok: password.length >= 6 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColors = ["bg-red-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Strong"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 space-y-1.5"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < score ? 1 : 0.3 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ transformOrigin: "left" }}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? barColors[score - 1] : "bg-zinc-200 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-1">
        <span className={`text-xs font-medium ${score === 3 ? "text-green-600" : score === 2 ? "text-yellow-600" : "text-red-500"}`}>
          {labels[score - 1] || "Too short"}
        </span>
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className={`text-[10px] flex items-center gap-0.5 ${c.ok ? "text-green-600" : "text-zinc-400"}`}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const STATS = [
  { v: "10K+", l: "Properties" },
  { v: "50K+", l: "Users" },
  { v: "120+", l: "Cities" },
  { v: "4.9★", l: "Rating" },
];

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register: registerUser, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "tenant" as const },
    mode: "onChange",
  });

  const role = watch("role");
  const passwordValue = watch("password", "");
  const emailValue = watch("email", "");
  const usernameValue = watch("username", "");

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    try {
      await registerUser(data);
      toast.success("Account created! Welcome to StayFinder.");
      router.push("/");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Registration failed"
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.2, 0.08] }}
              transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
              className="absolute rounded-full bg-rose-500/30"
              style={{
                width: `${60 + i * 20}px`,
                height: `${60 + i * 20}px`,
                left: `${(i * 9) % 80}%`,
                top: `${(i * 13) % 80}%`,
              }}
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
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center"
              >
                <Home className="w-5 h-5" />
              </motion.div>
              <span className="text-2xl font-bold group-hover:text-rose-400 transition-colors">StayFinder</span>
            </Link>
            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">Join us today</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-sm">
              Create your account and start exploring thousands of amazing properties worldwide.
            </p>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 gap-3"
            >
              {STATS.map((s) => (
                <motion.div
                  key={s.l}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.04 }}
                  className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 text-center"
                >
                  <div className="text-2xl font-bold text-rose-400">{s.v}</div>
                  <div className="text-xs text-zinc-400 mt-1">{s.l}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="absolute top-6 left-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">StayFinder</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-7 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Create account</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Join thousands of users on StayFinder</p>
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

            {/* Role toggle */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6">
              {(["tenant", "owner"] as const).map((r) => (
                <label key={r} className="flex-1 cursor-pointer">
                  <input type="radio" value={r} {...register("role")} className="sr-only" />
                  <motion.div
                    animate={{
                      backgroundColor: role === r ? "#ffffff" : "transparent",
                      color: role === r ? "#18181b" : "#71717a",
                    }}
                    transition={{ duration: 0.2 }}
                    className={`text-center py-2.5 rounded-lg text-sm font-medium ${role === r ? "shadow dark:bg-zinc-700 dark:text-white" : ""}`}
                  >
                    {r === "tenant" ? "🏠 I'm a Tenant" : "🏡 I'm an Owner"}
                  </motion.div>
                </label>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="johndoe"
                    autoComplete="username"
                    className={inputClass(!!errors.username, !!touchedFields.username, usernameValue)}
                    {...register("username")}
                  />
                  <AnimatePresence>
                    {touchedFields.username && usernameValue && !errors.username && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <FieldError message={errors.username?.message} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    suppressHydrationWarning
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`${inputClass(!!errors.password, !!touchedFields.password, passwordValue)} pr-10`}
                    {...register("password")}
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    <AnimatePresence mode="wait">
                      {showPass ? (
                        <motion.div key="off" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <EyeOff className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div key="on" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <Eye className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
                <PasswordStrength password={passwordValue} />
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-rose-500 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
