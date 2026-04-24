"use client";
import { useEffect } from "react";

export default function PWAProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {/* silent */});
    }
  }, []);

  return null;
}
