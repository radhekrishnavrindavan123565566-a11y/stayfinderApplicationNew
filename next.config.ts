import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "@react-pdf/renderer",
    ],
  },

  // Image optimization for Lighthouse
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year for immutable images
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/logo.png" },
    ],
  },

  // Headers for security (cache headers moved to proxy.ts)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
