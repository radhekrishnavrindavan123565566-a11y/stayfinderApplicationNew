/**
 * Cache Management Utilities
 * Provides functions to clear browser cache, service worker cache, etc.
 */

export const cacheManager = {
  /**
   * Clear all browser caches (service worker, local storage, session storage)
   */
  async clearAllCaches() {
    try {
      // Clear service worker caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("Service worker caches cleared");
      }

      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      console.log("Browser storage cleared");

      // Unregister service workers if desired
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
        console.log("Service workers unregistered");
      }

      return { success: true, message: "All caches cleared successfully" };
    } catch (error) {
      console.error("Error clearing caches:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  /**
   * Clear only service worker cache (keeps local storage)
   */
  async clearServiceWorkerCache() {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("Service worker caches cleared");
      }
      return { success: true, message: "Service worker caches cleared" };
    } catch (error) {
      console.error("Error clearing service worker cache:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  /**
   * Clear browser storage (local + session)
   */
  clearBrowserStorage() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("Browser storage cleared");
      return { success: true, message: "Browser storage cleared" };
    } catch (error) {
      console.error("Error clearing browser storage:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },

  /**
   * Perform a hard refresh of the page (bypasses cache)
   */
  hardRefresh() {
    // Ctrl+Shift+R equivalent
    window.location.href = window.location.href;
    // Add cache-busting param
    setTimeout(() => {
      location.reload();
    }, 100);
  },

  /**
   * Check cache status
   */
  async getCacheStatus() {
    try {
      const cacheNames = await caches.keys();
      const storageSize = {
        localStorage: new Blob(Object.values(localStorage)).size,
        sessionStorage: new Blob(Object.values(sessionStorage)).size,
      };

      return {
        caches: cacheNames,
        storage: storageSize,
        totalCaches: cacheNames.length,
      };
    } catch (error) {
      console.error("Error getting cache status:", error);
      return null;
    }
  },
};
