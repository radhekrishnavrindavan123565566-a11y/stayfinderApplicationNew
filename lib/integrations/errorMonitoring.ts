import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

interface ErrorContext {
  userId?: string;
  email?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  custom?: Record<string, any>;
}

interface ErrorEvent {
  error: Error | string;
  level?: "fatal" | "error" | "warning" | "info";
  context?: ErrorContext;
  tags?: Record<string, string>;
}

/**
 * Initialize Sentry error monitoring
 */
export function initializeSentryMonitoring(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NODE_ENV;
  const release = process.env.NEXT_PUBLIC_APP_VERSION;

  if (!dsn) {
    logger.warn("[Sentry] DSN not configured - error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Ignore known errors
    ignoreErrors: [
      // Random plugins/extensions
      "top.GLOBALS",
      // Facebook errors
      "fb_xd_fragment",
      // Chrome extensions
      "extension://",
      // Chrome-specific errors
      "chrome://",
      // Mozilla Firefox errors
      "firefox://",
      // Safari errors
      "safari://",
      // NextJS errors
      "hydration",
    ],
    // Deduplication
    beforeSend(event, hint) {
      // Filter out development errors
      if (process.env.NODE_ENV === "development") {
        return event;
      }

      // Sample errors
      if (Math.random() > 0.1) {
        return null;
      }

      return event;
    },
  });

  logger.info("[Sentry] Error monitoring initialized", {
    dsn: dsn.split("@")[0] + "@***",
    environment,
  });
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN;
}

/**
 * Capture an exception
 */
export function captureException(errorEvent: ErrorEvent): string | null {
  if (!isSentryConfigured()) {
    logger.error("[Error Monitoring] Sentry not configured", errorEvent.error);
    return null;
  }

  try {
    const error = typeof errorEvent.error === "string" ? new Error(errorEvent.error) : errorEvent.error;

    // Set user context
    if (errorEvent.context?.userId || errorEvent.context?.email) {
      Sentry.setUser({
        id: errorEvent.context.userId,
        email: errorEvent.context.email,
      });
    }

    // Set additional context
    if (errorEvent.context?.custom) {
      Sentry.setContext("custom", errorEvent.context.custom);
    }

    // Set request context
    if (errorEvent.context?.url || errorEvent.context?.method) {
      Sentry.setContext("request", {
        url: errorEvent.context.url,
        method: errorEvent.context.method,
        status_code: errorEvent.context.statusCode,
      });
    }

    // Set tags
    if (errorEvent.tags) {
      Object.entries(errorEvent.tags).forEach(([key, value]) => {
        Sentry.setTag(key, value);
      });
    }

    // Add level
    const level = errorEvent.level || "error";

    const eventId = Sentry.captureException(error, {
      level,
      tags: {
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION,
        ...errorEvent.tags,
      },
    });

    logger.info("[Sentry] Exception captured", {
      eventId,
      level,
      error: error.message,
    });

    return eventId;
  } catch (err) {
    logger.error("[Sentry] Failed to capture exception", err);
    return null;
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" = "info"): string | null {
  if (!isSentryConfigured()) {
    logger.info("[Error Monitoring] Message not captured - Sentry not configured");
    return null;
  }

  try {
    const eventId = Sentry.captureMessage(message, level);

    logger.info("[Sentry] Message captured", {
      eventId,
      level,
      message,
    });

    return eventId;
  } catch (err) {
    logger.error("[Sentry] Failed to capture message", err);
    return null;
  }
}

/**
 * Set user context for error tracking
 */
export function setErrorUser(userId: string, email?: string, additionalData?: Record<string, any>): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    Sentry.setUser({
      id: userId,
      email,
      ...additionalData,
    });

    logger.debug("[Sentry] User context set", { userId, email });
  } catch (err) {
    logger.error("[Sentry] Failed to set user context", err);
  }
}

/**
 * Clear user context
 */
export function clearErrorUser(): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    Sentry.setUser(null);
    logger.debug("[Sentry] User context cleared");
  } catch (err) {
    logger.error("[Sentry] Failed to clear user context", err);
  }
}

/**
 * Add breadcrumb for error context
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: "fatal" | "error" | "warning" | "info" | "debug",
  data?: Record<string, any>
): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    Sentry.addBreadcrumb({
      message,
      category: category || "user-action",
      level: level || "info",
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (err) {
    logger.error("[Sentry] Failed to add breadcrumb", err);
  }
}

/**
 * Track API request/response
 */
export function trackApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  error?: Error
): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    addBreadcrumb(
      `${method} ${endpoint}`,
      "api",
      statusCode >= 400 ? "error" : "info",
      {
        status_code: statusCode,
        duration_ms: duration,
        error: error?.message,
      }
    );
  } catch (err) {
    logger.error("[Sentry] Failed to track API call", err);
  }
}

/**
 * Track database query
 */
export function trackDatabaseQuery(
  query: string,
  collection?: string,
  duration?: number,
  error?: Error
): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    addBreadcrumb(
      `DB: ${collection || "unknown"}`,
      "database",
      error ? "error" : "info",
      {
        collection,
        duration_ms: duration,
        query: query.substring(0, 100), // Limit query length for privacy
        error: error?.message,
      }
    );
  } catch (err) {
    logger.error("[Sentry] Failed to track database query", err);
  }
}

/**
 * Start performance monitoring for a transaction
 */
export function startTransaction(name: string, op?: string) {
  if (!isSentryConfigured()) {
    return null;
  }

  try {
    const transaction = Sentry.startTransaction({
      op: op || "http.server",
      name,
    });

    return {
      transaction,
      end: () => transaction.finish(),
      addSpan: (spanName: string, spanOp: string, callback?: () => void) => {
        const span = transaction.startChild({
          op: spanOp,
          description: spanName,
        });

        try {
          if (callback) {
            callback();
          }
        } finally {
          span.finish();
        }
      },
    };
  } catch (err) {
    logger.error("[Sentry] Failed to start transaction", err);
    return null;
  }
}

/**
 * Get Sentry dashboard URL
 */
export function getSentryDashboardUrl(): string {
  return "https://sentry.io";
}

/**
 * Track custom event
 */
export function trackCustomEvent(
  eventName: string,
  level: "fatal" | "error" | "warning" | "info" = "info",
  data?: Record<string, any>
): void {
  if (!isSentryConfigured()) {
    return;
  }

  try {
    Sentry.captureMessage(eventName, level);

    if (data) {
      Sentry.setContext("custom_event", data);
    }

    logger.info("[Sentry] Custom event tracked", { eventName, level, data });
  } catch (err) {
    logger.error("[Sentry] Failed to track custom event", err);
  }
}

/**
 * Flush all pending events before shutdown
 */
export async function flushSentryEvents(timeout: number = 2000): Promise<boolean> {
  if (!isSentryConfigured()) {
    return false;
  }

  try {
    const flushed = await Sentry.close(timeout);
    logger.info("[Sentry] Events flushed", { flushed });
    return flushed;
  } catch (err) {
    logger.error("[Sentry] Failed to flush events", err);
    return false;
  }
}

// Export Sentry for direct use if needed
export { Sentry };
