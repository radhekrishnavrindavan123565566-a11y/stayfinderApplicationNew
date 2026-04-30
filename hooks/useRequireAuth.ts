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
    if (!hydrated) return; // wait — storage not read yet
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user]);

  return { ready: hydrated, user };
}
