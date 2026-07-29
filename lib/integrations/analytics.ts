import { logger } from "@/lib/logger";
import axios from "axios";

export type AnalyticsProvider = "google" | "posthog";

interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface TrackingConfig {
  provider: AnalyticsProvider;
  userId?: string;
  sessionId?: string;
}

/**
 * Check which analytics providers are configured
 */
export function getConfiguredAnalyticsProviders(): AnalyticsProvider[] {
  const providers: AnalyticsProvider[] = [];

  if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    providers.push("google");
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    providers.push("posthog");
  }

  return providers;
}

/**
 * Check if analytics is configured
 */
export function isAnalyticsConfigured(): boolean {
  return getConfiguredAnalyticsProviders().length > 0;
}

// ─────────────────────────────────────────────────────────────────
// GOOGLE ANALYTICS 4
// ─────────────────────────────────────────────────────────────────

export async function trackGoogleAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;

    if (!measurementId || !apiSecret) {
      logger.warn("[Analytics] Google Analytics not configured");
      return;
    }

    const payload = {
      client_id: event.userId || "anonymous",
      events: [
        {
          name: event.eventName,
          params: {
            session_id: event.userId,
            timestamp_micros: Date.now() * 1000,
            ...event.properties,
          },
        },
      ],
    };

    await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      payload
    );

    logger.info("[Google Analytics] Event tracked", {
      event: event.eventName,
      userId: event.userId,
    });
  } catch (error) {
    logger.error("[Google Analytics] Failed to track event", error);
    // Don't throw - analytics failures shouldn't crash the app
  }
}

// ─────────────────────────────────────────────────────────────────
// POSTHOG ANALYTICS
// ─────────────────────────────────────────────────────────────────

export async function trackPostHogEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;

    if (!apiKey) {
      logger.warn("[Analytics] PostHog not configured");
      return;
    }

    const payload = {
      api_key: apiKey,
      event: event.eventName,
      distinct_id: event.userId || "anonymous",
      timestamp: (event.timestamp || new Date()).toISOString(),
      properties: event.properties || {},
    };

    await axios.post("https://app.posthog.com/capture/", payload);

    logger.info("[PostHog] Event tracked", {
      event: event.eventName,
      userId: event.userId,
    });
  } catch (error) {
    logger.error("[PostHog] Failed to track event", error);
    // Don't throw - analytics failures shouldn't crash the app
  }
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/**
 * Track a user event across all configured analytics providers
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const providers = getConfiguredAnalyticsProviders();

  if (providers.length === 0) {
    logger.debug("[Analytics] No providers configured");
    return;
  }

  const promises: Promise<void>[] = [];

  if (providers.includes("google")) {
    promises.push(trackGoogleAnalyticsEvent(event));
  }

  if (providers.includes("posthog")) {
    promises.push(trackPostHogEvent(event));
  }

  // Execute all analytics calls in parallel
  await Promise.allSettled(promises);
}

/**
 * Identify a user across analytics platforms
 */
export async function identifyUser(
  userId: string,
  traits?: Record<string, any>
): Promise<void> {
  try {
    const providers = getConfiguredAnalyticsProviders();

    if (providers.includes("posthog")) {
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;

      await axios.post("https://app.posthog.com/decide/?v=2", {
        api_key: apiKey,
        distinct_id: userId,
        $set: traits || {},
        $set_once: {
          initial_visit: new Date().toISOString(),
        },
      });

      logger.info("[PostHog] User identified", { userId, traits });
    }

    // Google Analytics doesn't have explicit user identification in GA4
    // User ID is set through the event properties
  } catch (error) {
    logger.error("[Analytics] Failed to identify user", error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(
  pagePath: string,
  pageTitle?: string,
  userId?: string
): Promise<void> {
  await trackEvent({
    eventName: "page_view",
    userId,
    properties: {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: `${process.env.NEXT_PUBLIC_APP_URL}${pagePath}`,
    },
  });
}

/**
 * Track user signup
 */
export async function trackSignup(
  userId: string,
  email: string,
  userType: "owner" | "tenant"
): Promise<void> {
  await trackEvent({
    eventName: "signup",
    userId,
    properties: {
      email,
      user_type: userType,
      signup_date: new Date().toISOString(),
    },
  });

  await identifyUser(userId, {
    email,
    user_type: userType,
    signup_date: new Date().toISOString(),
  });
}

/**
 * Track booking event
 */
export async function trackBooking(
  userId: string,
  bookingData: {
    bookingId: string;
    propertyId: string;
    amount: number;
    currency: string;
    nights: number;
    startDate: Date;
    endDate: Date;
  }
): Promise<void> {
  await trackEvent({
    eventName: "booking_created",
    userId,
    properties: {
      booking_id: bookingData.bookingId,
      property_id: bookingData.propertyId,
      revenue: bookingData.amount,
      currency: bookingData.currency,
      nights: bookingData.nights,
      start_date: bookingData.startDate.toISOString(),
      end_date: bookingData.endDate.toISOString(),
      booking_date: new Date().toISOString(),
    },
  });
}

/**
 * Track payment event
 */
export async function trackPayment(
  userId: string,
  paymentData: {
    transactionId: string;
    amount: number;
    currency: string;
    status: "success" | "failed" | "pending";
    paymentMethod: string;
  }
): Promise<void> {
  await trackEvent({
    eventName: "payment_completed",
    userId,
    properties: {
      transaction_id: paymentData.transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: paymentData.status,
      payment_method: paymentData.paymentMethod,
      payment_date: new Date().toISOString(),
    },
  });
}

/**
 * Track property view
 */
export async function trackPropertyView(
  userId: string,
  propertyId: string,
  propertyData?: {
    title?: string;
    price?: number;
    location?: string;
  }
): Promise<void> {
  await trackEvent({
    eventName: "property_viewed",
    userId,
    properties: {
      property_id: propertyId,
      ...propertyData,
      view_date: new Date().toISOString(),
    },
  });
}

/**
 * Track search query
 */
export async function trackSearch(
  userId: string,
  searchQuery: string,
  filters?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventName: "search_performed",
    userId,
    properties: {
      search_query: searchQuery,
      filters: filters || {},
      search_date: new Date().toISOString(),
    },
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  featureName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent({
    eventName: "feature_used",
    userId,
    properties: {
      feature_name: featureName,
      ...metadata,
      usage_date: new Date().toISOString(),
    },
  });
}

/**
 * Track error event
 */
export async function trackError(
  userId: string,
  errorData: {
    errorName: string;
    errorMessage: string;
    errorStack?: string;
    page?: string;
  }
): Promise<void> {
  await trackEvent({
    eventName: "error_occurred",
    userId,
    properties: {
      error_name: errorData.errorName,
      error_message: errorData.errorMessage,
      error_stack: errorData.errorStack,
      page: errorData.page,
      error_date: new Date().toISOString(),
    },
  });
}

/**
 * Get analytics dashboard URL
 */
export function getAnalyticsDashboardUrl(provider: AnalyticsProvider): string {
  switch (provider) {
    case "google":
      return "https://analytics.google.com/";
    case "posthog":
      return "https://app.posthog.com/";
    default:
      return "";
  }
}
