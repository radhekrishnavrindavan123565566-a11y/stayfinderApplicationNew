/**
 * Central SEO configuration for the entire application
 */

export const SEO_CONFIG = {
  // Site information
  site: {
    name: 'SST Home Solutions',
    url: 'https://ssthomesolutions.com',
    description: 'Find verified PGs, rooms & flats across Uttar Pradesh. No broker fees, instant booking.',
    locale: 'en_IN',
    alternateLocales: ['hi', 'en'],
  },

  // Social media
  social: {
    facebook: 'https://www.facebook.com/stayerra',
    instagram: 'https://www.instagram.com/ssthomesolutions',
    twitter: 'https://twitter.com/ssthomesolutions',
    linkedin: 'https://www.linkedin.com/company/stayerra',
    youtube: 'https://www.youtube.com/c/stayerra',
  },

  // Contact information
  contact: {
    email: 'support@ssthomesolutions.com',
    phone: '+91-XXXXXXXXXX',
    address: {
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
    },
  },

  // SEO Keywords by category
  keywords: {
    main: [
      'PG in Lucknow',
      'rooms for rent UP',
      'flat in Prayagraj',
      'paying guest Kanpur',
      'rental rooms Varanasi',
      'best PG sites',
      'no broker rooms',
      'verified listings',
      'shared accommodation',
      'affordable rooms UP',
    ],
    cities: [
      'Lucknow',
      'Prayagraj',
      'Kanpur',
      'Varanasi',
      'Agra',
      'Meerut',
      'Noida',
      'Greater Noida',
      'Bareilly',
      'Aligarh',
      'Ghaziabad',
      'Gorakhpur',
    ],
    types: ['PG', 'Rooms', 'Flats', 'Hostels', 'Shared Accommodation'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp', 'image/jpeg'],
    sizes: {
      hero: '1200x630',
      thumbnail: '300x225',
      og: '1200x630',
      twitter: '1200x675',
    },
  },

  // Performance targets
  performance: {
    // Core Web Vitals targets
    lcp: 2500, // Largest Contentful Paint - 2.5s
    fid: 100, // First Input Delay - 100ms
    cls: 0.1, // Cumulative Layout Shift - 0.1
    ttfb: 600, // Time to First Byte - 600ms
    fcp: 1800, // First Contentful Paint - 1.8s
  },

  // Cache strategies
  cache: {
    static: 31536000, // 1 year
    dynamic: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
  },

  // Indexing rules
  indexing: {
    allowedPaths: [
      '/',
      '/about',
      '/how-it-works',
      '/city/*',
      '/blog/*',
      '/faq',
      '/contact',
    ],
    disallowedPaths: [
      '/admin',
      '/api',
      '/dashboard',
      '/search',
      '/_next',
      '/static',
    ],
  },

  // Structured Data
  structuredData: {
    organization: {
      name: 'SST Home Solutions',
      type: 'RealEstateAgent',
      description: 'Find verified PGs, rooms & flats across Uttar Pradesh',
    },
  },

  // Analytics
  analytics: {
    googleAnalyticsId: 'G-XXXXXXXXXX', // Update with your ID
    googleSearchConsoleId: 'b8Svk1MJ3qt_svlwYxpBRH1MEFQDCW0xJ83RYihTlzk',
    msBingVerification: 'YOUR_MSVALIDATE_KEY',
  },

  // Ads
  ads: {
    googleAdSenseId: 'ca-pub-6171735174915662',
  },

  // Sitemap
  sitemap: {
    maxUrlsPerFile: 50000,
    generateRobots: true,
    changefreq: {
      homepage: 'daily',
      city: 'daily',
      listing: 'daily',
      blog: 'weekly',
      static: 'monthly',
    },
    priority: {
      homepage: 1.0,
      city: 0.9,
      category: 0.85,
      listing: 0.8,
      blog: 0.7,
      static: 0.6,
    },
  },

  // Mobile optimization
  mobile: {
    viewportWidth: 'device-width',
    viewportInitialScale: 1,
    viewportMaximumScale: 5,
    viewportUserScalable: true,
    appCapable: true,
  },

  // Security headers
  security: {
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src * data: https:; font-src 'self' fonts.gstatic.com;",
    xFrameOptions: 'SAMEORIGIN',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
  },

  // Open Graph defaults
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/jpeg',
  },

  // Twitter Card defaults
  twitterCard: {
    cardType: 'summary_large_image',
    creator: '@ssthomesolutions',
    site: '@ssthomesolutions',
  },

  // Robots rules
  robots: {
    maxSnippet: -1, // No limit
    maxImagePreview: 'large',
    maxVideoPreview: -1, // No limit
  },
};

/**
 * Helper function to get keywords for a specific context
 */
export function getContextualKeywords(context: 'city' | 'type' | 'main', value?: string): string[] {
  switch (context) {
    case 'city':
      if (value) {
        return [
          `PG in ${value}`,
          `rooms for rent ${value}`,
          `flats in ${value}`,
          `rental accommodation ${value}`,
          `paying guest ${value}`,
          `best PG in ${value}`,
          `affordable rooms ${value}`,
          `shared accommodation ${value}`,
        ];
      }
      return SEO_CONFIG.keywords.cities;

    case 'type':
      if (value) {
        return [
          `${value} in Uttar Pradesh`,
          `${value} rentals`,
          `${value} for rent`,
          `find ${value}`,
          `${value} no broker`,
        ];
      }
      return SEO_CONFIG.keywords.types;

    case 'main':
    default:
      return SEO_CONFIG.keywords.main;
  }
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  return `${SEO_CONFIG.site.url}${path}`;
}

/**
 * Format page title consistently
 */
export function formatPageTitle(title: string, includePrefix = true): string {
  const base = `${title}${includePrefix ? ' | ' + SEO_CONFIG.site.name : ''}`;
  return base;
}

/**
 * Get Open Graph image URL
 */
export function getOgImage(type: 'default' | 'city' | 'listing' | 'blog', city?: string): string {
  const baseUrl = 'https://images.unsplash.com';

  switch (type) {
    case 'city':
      return `${baseUrl}/photo-1564013799919-ab600027ffc6?w=1200&q=80`;
    case 'listing':
      return `${baseUrl}/photo-1502672260266-1c1ef2d93688?w=1200&q=80`;
    case 'blog':
      return `${baseUrl}/photo-1552664730-d307ca884978?w=1200&q=80`;
    case 'default':
    default:
      return SEO_CONFIG.openGraph.image;
  }
}
