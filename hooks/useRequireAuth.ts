"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Waits for Zustand persist to rehydrate before checking auth.
 * Returns { ready, user } — render nothing until ready === true.
 *
 * @param requiredRoles  If provided, redirects to `redirectTo` if user role not in list.
 * @param redirectTo     Where to send unauthenticated users (default: /auth/login).
 */
export function useRequireAuth(
  requiredRoles?: string[],
  redirectTo = "/auth/login"
) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give Zustand one tick to rehydrate from localStorage
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [ready, user, router, redirectTo, requiredRoles?.join(",")]);

  return { ready, user };
}
