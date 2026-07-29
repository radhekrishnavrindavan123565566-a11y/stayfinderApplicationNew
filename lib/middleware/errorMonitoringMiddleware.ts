import { NextRequest, NextResponse } from "next/server";
import { trackApiCall, addBreadcrumb } from "@/lib/integrations/errorMonitoring";

/**
 * Middleware wrapper for API routes with error monitoring
 * Wraps API handlers and tracks errors automatically
 */
export function withErrorMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = req.method;
    const pathname = new URL(req.url).pathname;

    try {
      // Add breadcrumb for request start
      addBreadcrumb(
        `${method} ${pathname} started`,
        "api",
        "info",
        {
          method,
          pathname,
        }
      );

      // Execute handler
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Track successful API call
      trackApiCall(pathname, method, response.status, duration);

      // Add breadcrumb for successful response
      addBreadcrumb(
        `${method} ${pathname} completed`,
        "api",
        "info",
        {
          status: response.status,
          duration_ms: duration,
        }
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Track failed API call
      if (error instanceof Error) {
        trackApiCall(pathname, method, 500, duration, error);
      }

      // Add error breadcrumb
      addBreadcrumb(
        `${method} ${pathname} failed`,
        "api",
        "error",
        {
          error: error instanceof Error ? error.message : String(error),
          duration_ms: duration,
        }
      );

      throw error;
    }
  };
}

/**
 * Wrap handler to catch and log errors
 */
export async function safeApiHandler<T>(
  handler: () => Promise<T>,
  context?: {
    userId?: string;
    route?: string;
  }
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    addBreadcrumb(
      `Handler error: ${context?.route || "unknown"}`,
      "handler",
      "error",
      {
        userId: context?.userId,
        error: error instanceof Error ? error.message : String(error),
      }
    );
    throw error;
  }
}
