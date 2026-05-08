"use client";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function AxiosInterceptor() {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.error || error.message;

          // Handle 401 Unauthorized - user not authenticated
          if (status === 401) {
            toast.error("Session expired. Please login again.");
            logout();
            router.push("/auth/login");
          }
          
          // Handle 403 Forbidden - user doesn't have permission
          else if (status === 403) {
            toast.error(message || "You don't have permission to perform this action.");
            // Don't logout, just show error
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router, logout]);

  return null;
}
