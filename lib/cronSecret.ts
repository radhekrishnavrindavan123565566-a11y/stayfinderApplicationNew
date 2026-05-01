import { NextRequest } from "next/server";
import { errorResponse } from "./apiResponse";

/** Validates the cron secret header so only Vercel (or your scheduler) can call these routes */
export function validateCronSecret(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null; // no secret configured — allow in dev
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return errorResponse("Unauthorized", 401);
  }
  return null;
}
