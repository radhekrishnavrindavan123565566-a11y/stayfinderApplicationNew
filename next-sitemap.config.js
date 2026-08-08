/** @type {import('next-sitemap').IConfig} */

const BASE_URL = 'https://ssthomesolutions.com';

module.exports = {
  siteUrl: BASE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  autoLastmod: true,

  // Pages to exclude from sitemap
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/profile/*',
    '/settings',
    '/settings/*',
    '/404',
    '/500',
  ],

  // Additional paths to add manually (e.g. dynamic pages not auto-detected)
  additionalPaths: async (config) => {
    const cities = [
      'lucknow',
      'prayagraj',
      'kanpur',
      'varanasi',
      'agra',
      'meerut',
      'noida',
      'greater-noida',
      'bareilly',
      'aligarh',
      'ghaziabad',
      'gorakhpur',
    ];

    const cityPaths = cities.map((city) => ({
      loc: `/city/${city}`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString(),
    }));

    return cityPaths;
  },

  // Custom robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/dashboard', '/profile', '/settings'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      `${BASE_URL}/sitemap.xml`,
    ],
  },

  // Transform function to customize entries
  transform: async (config, path) => {
    // Give homepage highest priority
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // High priority for key pages
    const highPriorityPages = ['/about', '/contact', '/properties', '/how-it-works'];
    if (highPriorityPages.includes(path)) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
