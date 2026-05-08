"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, User } from "@/store/authStore";

/**
 * Reads auth state directly from localStorage on first render —
 * synchronous, no race condition, no false redirects.
 */
export function useRequireAuth(
  requiredRoles?: string[],
  redirectTo = "/auth/login"
) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    let resolvedUser: User | null = null;

    // 1. Read directly from localStorage — synchronous
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        resolvedUser = parsed?.state?.user ?? null;
      }
    } catch { /* ignore */ }

    // 2. Also sync Zustand if not yet hydrated
    if (!useAuthStore.getState()._hasHydrated) {
      useAuthStore.getState().setHasHydrated(true);
    }

    if (!resolvedUser) {
      window.location.href = redirectTo;
      return;
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(resolvedUser.role)) {
      window.location.href = "/dashboard";
      return;
    }

    setUser(resolvedUser);
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep in sync with live Zustand state (e.g. logout while on page)
  const liveUser = useAuthStore((s) => s.user);
  useEffect(() => {
    if (!ready) return;
    if (!liveUser) {
      window.location.href = redirectTo;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveUser]);

  return { ready, user };
}
