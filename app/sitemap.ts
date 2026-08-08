import { MetadataRoute } from 'next';

const BASE_URL = 'https://ssthomesolutions.com';

const cities = [
  'lucknow', 'prayagraj', 'kanpur', 'varanasi', 'agra',
  'meerut', 'noida', 'greater-noida', 'bareilly', 'aligarh',
  'ghaziabad', 'gorakhpur',
];

const categories = ['pg', 'rooms', 'flats', 'hostels', 'shared-accommodation'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                           lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/about`,                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`,              lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/properties`,           lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/how-it-works`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/faq`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ];

  // City pages — high priority for local SEO
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/city/${city}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // City + category pages
  const cityCategoryPages: MetadataRoute.Sitemap = cities.flatMap((city) =>
    categories.map((cat) => ({
      url: `${BASE_URL}/city/${city}/${cat}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    }))
  );

  return [...staticPages, ...cityPages, ...cityCategoryPages];
}
