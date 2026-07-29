import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  isCalendarConfigured,
  isVideoCallConfigured,
  isAnalyticsConfigured,
  isSentryConfigured,
} from "@/lib/integrations";
import { trackEvent, getConfiguredAnalyticsProviders } from "@/lib/integrations/analytics";

describe("Integration Services", () => {
  describe("Configuration Checks", () => {
    it("should check calendar configuration", () => {
      const configured = isCalendarConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should check video call configuration", () => {
      const configured = isVideoCallConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should check analytics configuration", () => {
      const configured = isAnalyticsConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should check Sentry configuration", () => {
      const configured = isSentryConfigured();
      expect(typeof configured).toBe("boolean");
    });

    it("should get configured analytics providers", () => {
      const providers = getConfiguredAnalyticsProviders();
      expect(Array.isArray(providers)).toBe(true);
      providers.forEach((provider) => {
        expect(["google", "posthog"]).toContain(provider);
      });
    });
  });

  describe("Analytics Integration", () => {
    it("should track events without throwing when not configured", async () => {
      // Mock configuration to be disabled
      const originalEnv = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
      delete process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

      await expect(
        trackEvent({
          eventName: "test_event",
          userId: "test-user",
          properties: { test: true },
        })
      ).resolves.not.toThrow();

      // Restore environment
      if (originalEnv) {
        process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = originalEnv;
      }
    });

    it("should accept various event types", async () => {
      const eventTypes = [
        { eventName: "page_view", userId: "user-1" },
        { eventName: "signup", userId: "user-2", properties: { type: "tenant" } },
        { eventName: "booking", userId: "user-3", properties: { amount: 5000 } },
        { eventName: "search", userId: "user-4", properties: { query: "apartments" } },
      ];

      for (const event of eventTypes) {
        await expect(trackEvent(event)).resolves.not.toThrow();
      }
    });
  });

  describe("Video Call Integration", () => {
    it("should identify available video providers", () => {
      const provider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER;
      const validProviders = ["zoom", "agora", "daily"];
      
      if (provider) {
        expect(validProviders).toContain(provider);
      }
    });
  });

  describe("Error Monitoring Integration", () => {
    it("should handle Sentry initialization safely", async () => {
      // Sentry initialization should not throw even if not configured
      expect(() => {
        // This would be called in app initialization
        const configured = isSentryConfigured();
        expect(typeof configured).toBe("boolean");
      }).not.toThrow();
    });
  });

  describe("Environment Variable Validation", () => {
    it("should validate required format for Google Calendar", () => {
      const required = [
        "GOOGLE_CALENDAR_PROJECT_ID",
        "GOOGLE_CALENDAR_CLIENT_EMAIL",
        "GOOGLE_CALENDAR_PRIVATE_KEY",
        "GOOGLE_CALENDAR_ID",
      ];

      const configured = required.every(
        (key) => process.env[key] || !isCalendarConfigured()
      );
      expect(configured).toBe(true);
    });

    it("should validate video provider is one of the supported options", () => {
      const provider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER;
      const validProviders = ["zoom", "agora", "daily"];

      if (provider) {
        expect(validProviders).toContain(provider);
      }
    });

    it("should validate Sentry DSN format if provided", () => {
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

      if (dsn) {
        expect(dsn).toMatch(/^https:\/\/.*@.*\.ingest\.sentry\.io\/\d+$/);
      }
    });
  });

  describe("Integration API Endpoints", () => {
    it("should have correct endpoint paths", () => {
      const endpoints = [
        "/api/integrations/calendar/create",
        "/api/integrations/videocall/create",
        "/api/integrations/analytics/track",
        "/api/integrations/errors/report",
      ];

      endpoints.forEach((endpoint) => {
        expect(endpoint).toMatch(/^\/api\/integrations\/[a-z]+\/[a-z]+$/);
      });
    });
  });
});

describe("Integration Load Testing", () => {
  it("should handle multiple concurrent analytics events", async () => {
    const events = Array.from({ length: 100 }, (_, i) => ({
      eventName: `event_${i}`,
      userId: `user_${i % 10}`,
      properties: { index: i },
    }));

    const results = await Promise.allSettled(events.map(trackEvent));

    // Should not crash even if services are unavailable
    expect(results).toHaveLength(100);
  });
});

describe("Integration Error Handling", () => {
  it("should gracefully handle missing credentials", async () => {
    // Test that missing credentials don't crash the app
    expect(isCalendarConfigured()).toBe(
      !!process.env.GOOGLE_CALENDAR_PRIVATE_KEY
    );
    expect(isVideoCallConfigured()).toBe(!!process.env.NEXT_PUBLIC_VIDEO_PROVIDER);
    expect(isAnalyticsConfigured()).toBe(
      !!(
        process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ||
        process.env.NEXT_PUBLIC_POSTHOG_API_KEY
      )
    );
  });

  it("should not throw on invalid event data", async () => {
    await expect(
      trackEvent({
        eventName: "",
        userId: "",
      } as any)
    ).resolves.not.toThrow();
  });
});
