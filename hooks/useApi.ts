import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export function useApi() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const authHeaders = useCallback((): { headers: Record<string, string> } => ({
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  }), [accessToken]);

  return { authHeaders };
}

export function useAsync<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const msg = err instanceof AxiosError
        ? err.response?.data?.error || err.message
        : "Something went wrong";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute };
}
