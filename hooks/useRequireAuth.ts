"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Waits for Zustand persist to fully rehydrate before checking auth.
 * Uses onRehydrateStorage flag — no setTimeout, no race conditions.
 *
 * @param requiredRoles  Redirect to `redirectTo` if user role not in list.
 * @param redirectTo     Where to send unauthenticated users (default: /auth/login).
 */
export function useRequireAuth(
  requiredRoles?: string[],
  redirectTo = "/auth/login"
) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // Don't do anything until localStorage has been read
    if (!hydrated) return;

    // Not logged in → send to login
    if (!user) {
      router.replace(redirectTo);
      return;
    }

    // Logged in but wrong role → send to dashboard
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      router.replace("/dashboard");
    }

    // Correct role → do nothing, page renders normally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user?._id, user?.role]);

  // ready = hydration done AND user has the right role (or no role required)
  const hasCorrectRole = !requiredRoles || !user || requiredRoles.includes(user.role);
  const ready = hydrated && !!user && hasCorrectRole;

  return { ready, user: ready ? user : null };
}
