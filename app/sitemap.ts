import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nestora.in';

  try {
    await connectDB();

    // Fetch all available properties
    const properties = await Property.find({ isAvailable: true })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5000) // Sitemap limit
      .lean();

    const propertyUrls = properties.map((property) => ({
      url: `${baseUrl}/properties/${property._id}`,
      lastModified: property.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/properties`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/auth/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/auth/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
    ];

    return [...staticPages, ...propertyUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return static pages only if DB fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/properties`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      },
    ];
  }
}
