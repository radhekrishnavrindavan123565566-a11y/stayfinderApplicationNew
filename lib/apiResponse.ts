import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getRequestMeta(req?: NextRequest): Record<string, string> {
  if (!req) return {};
  const requestId = req.headers.get("x-request-id") ?? "";
  const startMs = req.headers.get("x-request-start");
  const durationMs = startMs ? String(Date.now() - Number(startMs)) : "";
  return {
    ...(requestId && { "x-request-id": requestId }),
    ...(durationMs && { "x-response-time": `${durationMs}ms` }),
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function successResponse(data: unknown, status = 200, req?: NextRequest) {
  return NextResponse.json({ success: true, data }, {
    status,
    headers: getRequestMeta(req),
  });
}

export function errorResponse(message: string, status = 400, req?: NextRequest) {
  return NextResponse.json({ success: false, error: message }, {
    status,
    headers: getRequestMeta(req),
  });
}

export function handleApiError(error: unknown, req?: NextRequest) {
  const requestId = req?.headers.get("x-request-id");
  const meta = getRequestMeta(req);

  if (error instanceof Error) {
    // Known safe-to-expose errors
    if (error.message === "Unauthorized") return errorResponse("Unauthorized", 401, req);
    if (error.message === "Forbidden")    return errorResponse("Forbidden", 403, req);
    if (error.message === "Not Found")    return errorResponse("Not Found", 404, req);

    // JWT errors → 401
    if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
      return errorResponse("Invalid or expired token", 401, req);
    }

    // DB connectivity errors → generic 503 (don't expose internals)
    const isDbError =
      error.message.includes("MONGODB_URI") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("MongoNetworkError") ||
      error.message.includes("MongoServerSelectionError") ||
      error.message.includes("buffering timed out") ||
      error.message.includes("querySrv");
    if (isDbError) {
      logger.error("DB connectivity error", { err: error.message, requestId });
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable", requestId },
        { status: 503, headers: meta }
      );
    }

    // Mongoose validation errors → 422 with field details
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.message },
        { status: 422, headers: meta }
      );
    }

    // Log unexpected errors but return a safe generic message
    logger.error("Unhandled API error", { err: error, requestId });
    return NextResponse.json(
      { success: false, error: "Internal server error", requestId },
      { status: 500, headers: meta }
    );
  }

  logger.error("Non-Error thrown", { raw: JSON.stringify(error), requestId });
  return NextResponse.json(
    { success: false, error: "Internal server error", requestId },
    { status: 500, headers: meta }
  );
}
