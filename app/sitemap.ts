import { MetadataRoute } from 'next';

const BASE_URL = 'https://stayerra.com';

// Add your main pages here
const mainPages = [
  { path: '', priority: 1.0, changefreq: 'daily' as const },
  { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
  { path: '/how-it-works', priority: 0.8, changefreq: 'monthly' as const },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' as const },
  { path: '/faq', priority: 0.7, changefreq: 'monthly' as const },
];

// City pages for better local SEO
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

export default function sitemap(): MetadataRoute.Sitemap {
  // Main pages
  const mainSitemap = mainPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq as 'daily' | 'weekly' | 'monthly',
    priority: page.priority,
  }));

  // City pages
  const citySitemap = cities.map((city) => ({
    url: `${BASE_URL}/city/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // City + category pages
  const categories = ['pg', 'rooms', 'flats', 'hostels', 'shared-accommodation'];
  const cityCategorySitemap = cities.flatMap((city) =>
    categories.map((category) => ({
      url: `${BASE_URL}/city/${city}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))
  );

  return [...mainSitemap, ...citySitemap, ...cityCategorySitemap];
}
