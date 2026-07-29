import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { captureException, isSentryConfigured } from "@/lib/integrations/errorMonitoring";
import { z } from "zod";

const reportErrorSchema = z.object({
  errorName: z.string().min(1),
  errorMessage: z.string().min(1),
  errorStack: z.string().optional(),
  userId: z.string().optional(),
  email: z.string().email().optional(),
  page: z.string().optional(),
  level: z.enum(["fatal", "error", "warning", "info"]).optional().default("error"),
  tags: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Don't require auth - users should be able to report errors even when logged out
    
    if (!isSentryConfigured()) {
      // Silently return success even if not configured
      return successResponse({
        success: true,
        message: "Error monitoring disabled",
      });
    }

    const body = await req.json();
    const parsed = reportErrorSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { errorName, errorMessage, errorStack, userId, email, page, level, tags } = parsed.data;

    // Capture error
    const eventId = captureException({
      error: new Error(errorMessage),
      level,
      context: {
        userId,
        email,
        url: page,
        custom: {
          errorName,
          errorStack,
        },
      },
      tags: {
        source: "client",
        ...tags,
      },
    });

    return successResponse(
      {
        success: true,
        eventId,
        message: "Error reported successfully",
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
