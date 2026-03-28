import { NextRequest, NextResponse } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/chat",
  "/dashboard",
  "/bookings",
  "/wishlist",
  "/profile",
  "/agreements",
  "/admin",
  "/properties/new",
  "/properties/edit",
];

// Routes that logged-in users should NOT access
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

function getTokenPayload(token: string): { userId?: string; role?: string } | null {
  try {
    // JWT is base64url encoded — decode payload without verifying signature
    // (API routes do full verification; middleware only needs userId for redirect logic)
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const json = Buffer.from(base64Payload, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getToken(req: NextRequest): string | null {
  // Check Authorization header
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  // Check cookie
  return req.cookies.get("accessToken")?.value ?? null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = getToken(req);
  const payload = token ? getTokenPayload(token) : null;
  const isLoggedIn = !!payload?.userId;

  // Logged-in users trying to access login/register → redirect to home
  if (isLoggedIn && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Guests trying to access protected routes → redirect to login
  if (!isLoggedIn && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public files
     * - API routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads|api/).*)",
  ],
};
