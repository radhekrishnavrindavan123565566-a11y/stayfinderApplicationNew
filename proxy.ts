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
  // Check cookie first (set by API routes)
  const cookieToken = req.cookies.get("accessToken")?.value;
  if (cookieToken) return cookieToken;
  
  // Check Authorization header (from localStorage via axios interceptor)
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  
  return null;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = getToken(req);
  const payload = token ? getTokenPayload(token) : null;
  const isLoggedIn = !!payload?.userId;

  // For client-side navigation, check if this is a navigation request
  // If there's no cookie but it's a client-side navigation, let it through
  // The client-side auth check will handle it
  const isClientNavigation = req.headers.get("sec-fetch-dest") === "document" && 
                             req.headers.get("sec-fetch-mode") === "navigate";

  // Logged-in users trying to access login/register → redirect to home
  if (isLoggedIn && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Guests trying to access protected routes
  // Skip redirect for client-side navigation (let client handle it)
  if (!isLoggedIn && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    // If it's a client-side navigation, let it through
    // The page will check localStorage and redirect if needed
    if (isClientNavigation) {
      return NextResponse.next();
    }
    
    // For direct access (no cookie), redirect to login
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") && payload?.role !== "admin") {
    // If it's a client-side navigation and no cookie, let client handle it
    if (isClientNavigation && !token) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Continue with response and add security headers for Lighthouse
  const response = NextResponse.next();

  // Security Headers for Lighthouse Best Practices
  const securityHeaders = {
    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'on',
    
    // Strict Transport Security (HSTS) - only in production
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    }),
    
    // Frame Options
    'X-Frame-Options': 'SAMEORIGIN',
    
    // Content Type Options
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // Cache Control for static assets
  if (
    pathname.startsWith('/_next/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff|woff2)$/)
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  return response;
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
