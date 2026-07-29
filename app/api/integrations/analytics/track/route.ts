import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { trackEvent, isAnalyticsConfigured } from "@/lib/integrations/analytics";
import { z } from "zod";

const trackEventSchema = z.object({
  eventName: z.string().min(1),
  userId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isAnalyticsConfigured()) {
      // Silently return success even if not configured
      return successResponse(
        {
          success: true,
          message: "Analytics tracking disabled",
        }
      );
    }

    const body = await req.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { eventName, userId, properties } = parsed.data;

    // Track event
    await trackEvent({
      eventName,
      userId,
      properties: {
        timestamp: new Date(),
        userAgent: req.headers.get("user-agent"),
        referer: req.headers.get("referer"),
        ...properties,
      },
    });

    return successResponse({
      success: true,
      message: "Event tracked successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
