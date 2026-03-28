import { NextRequest } from "next/server";
import { verifyAccessToken, JWTPayload } from "./jwt";

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get("accessToken");
  return cookie?.value || null;
}

export function authenticateRequest(req: NextRequest): JWTPayload | null {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = authenticateRequest(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function requireRole(req: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(req);
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
