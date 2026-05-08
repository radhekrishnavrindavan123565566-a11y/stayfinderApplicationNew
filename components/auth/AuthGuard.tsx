"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Permanent fix for auth redirect race condition.
 *
 * Strategy:
 * 1. On mount, read auth state directly from localStorage (synchronous)
 *    — this avoids waiting for Zustand's async rehydration
 * 2. If no user found → redirect immediately, no flash
 * 3. If user found but wrong role → redirect immediately
 * 4. If user found with correct role → render children
 */
export default function AuthGuard({ children, requiredRoles, redirectTo = "/auth/login" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "redirecting">("checking");
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    // Read directly from localStorage — synchronous, no race condition
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = parsed?.state?.user;

        if (user) {
          // Check role
          if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            setStatus("redirecting");
            window.location.href = "/dashboard";
            return;
          }
          // All good — also ensure Zustand is hydrated
          useAuthStore.getState().setHasHydrated(true);
          setStatus("allowed");
          return;
        }
      }
    } catch {
      // localStorage parse error — treat as unauthenticated
    }

    // No user in storage → redirect
    setStatus("redirecting");
    window.location.href = redirectTo;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also subscribe to Zustand in case user logs out while on page
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hydrated || status !== "allowed") return;
    if (!user) {
      window.location.href = redirectTo;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  if (status === "checking" || status === "redirecting") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return <>{children}</>;
}
