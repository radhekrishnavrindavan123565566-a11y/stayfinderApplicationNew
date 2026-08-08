import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/dashboard/', '/profile/', '/settings/'],
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
    sitemap: [
      'https://ssthomesolutions.com/sitemap.xml',
      'https://ssthomesolutions.com/sitemap-0.xml',
    ],
    host: 'https://ssthomesolutions.com',
  };
}
