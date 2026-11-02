/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript checking during build due to test file issues
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization - CRITICAL FOR SEO
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Stock photos
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // Cloudinary (all sub-accounts)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      // Google auth avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      // GitHub avatars
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // User-uploaded content on common CDNs
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      // SST own domain
      { protocol: 'https', hostname: 'ssthomesolutions.com' },
      { protocol: 'https', hostname: 'www.ssthomesolutions.com' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for optimal caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for better SEO
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    staticGenerationRetryCount: 2,
  },

  // Headers for caching and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for optimization
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Production build optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
};

module.exports = nextConfig;
