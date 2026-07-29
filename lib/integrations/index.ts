/**
 * Integrations Hub
 * Centralized export for all integration services
 */

// Calendar Booking
export * from "./calendar";

// Video Calls
export * from "./videocall";

// Analytics
export * from "./analytics";

// Error Monitoring
export * from "./errorMonitoring";

/**
 * Initialize all integrations
 * Call this on application startup
 */
export async function initializeIntegrations(): Promise<void> {
  const { initializeSentryMonitoring } = await import("./errorMonitoring");

  // Initialize error monitoring first to catch any initialization errors
  initializeSentryMonitoring();

  console.log("[Integrations] All services initialized");
}
