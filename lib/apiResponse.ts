import { NextResponse } from "next/server";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return errorResponse("Unauthorized", 401);
    if (error.message === "Forbidden") return errorResponse("Forbidden", 403);
    if (error.message === "Not Found") return errorResponse("Not Found", 404);
    // JWT errors — treat as 401 not 500
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return errorResponse("Invalid or expired token", 401);
    }
    if (
      error.message.includes("MONGODB_URI") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("MongoNetworkError") ||
      error.message.includes("MongoServerSelectionError") ||
      error.message.includes("buffering timed out") ||
      error.message.includes("querySrv")
    ) {
      return errorResponse("Database connection error", 500);
    }
    return errorResponse(error.message, 500);
  }
  // Log non-Error objects too
  console.error("Non-Error thrown:", JSON.stringify(error));
  return errorResponse("Internal server error", 500);
}
