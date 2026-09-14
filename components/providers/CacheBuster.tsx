"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

/**
 * CacheBuster Component
 * Checks for updates in the background and prompts user to refresh
 * Helps with the issue where updated data doesn't show due to browser caching
 */
export default function CacheBuster() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    // Don't run during server-side rendering
    if (typeof window === "undefined") return;

    // Check for updates immediately and then every 30 seconds
    const checkForUpdates = async () => {
      try {
        // Fetch the page with cache-busting query
        const response = await fetch(window.location.pathname, {
          cache: "no-store",
          headers: {
            "Pragma": "no-cache",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        // If we got a different content hash, there's an update
        const currentHash = document.documentElement.getAttribute("data-page-hash");
        const newHash = response.headers.get("x-content-hash");

        if (currentHash && newHash && currentHash !== newHash && !hasRefreshed) {
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.debug("Update check failed:", error);
      }
    };

    // Check immediately
    const initialTimer = setTimeout(checkForUpdates, 2000);

    // Then check every 30 seconds
    const intervalId = setInterval(checkForUpdates, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [hasRefreshed]);

  const handleRefresh = () => {
    // Clear service worker cache
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Clear localStorage if needed (optional)
    // localStorage.clear(); // Only use if your app doesn't depend on localStorage

    setHasRefreshed(true);
    setUpdateAvailable(false);

    // Refresh the page
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {updateAvailable && !hasRefreshed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-2xl border border-blue-400/30 backdrop-blur-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="flex-shrink-0"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-1">
                  Updates Available
                </h3>
                <p className="text-xs sm:text-sm text-white/90 mb-3">
                  A new version is ready. Refresh to see the latest changes and data.
                </p>
                <motion.button
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-1.5 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Refresh Now
                </motion.button>
              </div>

              <motion.button
                onClick={() => setUpdateAvailable(false)}
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
              >
                <span className="text-lg">×</span>
              </motion.button>
            </div>

            {/* Progress bar animation */}
            <motion.div
              animate={{ scaleX: [0, 1] }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-0.5 bg-white/20 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
