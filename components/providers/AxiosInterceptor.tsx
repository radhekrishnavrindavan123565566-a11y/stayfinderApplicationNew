"use client";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

/**
 * This interceptor is now disabled because auth handling is done in authStore.ts
 * Keeping this file for potential future use, but it returns null (no-op)
 */
export default function AxiosInterceptor() {
  // Auth interceptor is now handled in store/authStore.ts to avoid duplicates
  return null;
}
