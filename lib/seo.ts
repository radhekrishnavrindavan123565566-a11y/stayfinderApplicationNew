import { Metadata } from 'next';

const BASE_URL = 'https://ssthomesolutions.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  authors?: Array<{ name: string; url?: string }>;
  publishedDate?: Date;
  updatedDate?: Date;
  structuredData?: Record<string, any>;
}

/**
 * Generate metadata for SEO
 */
export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title = 'Stayerra – Best PG, Rooms & Flats in UP',
    description = 'Find verified PGs, rooms & flats across Uttar Pradesh. Best rental solutions with instant booking.',
    keywords = [],
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    canonicalUrl = BASE_URL,
    noindex = false,
    nofollow = false,
    authors = [{ name: 'SST Home Solutions', url: BASE_URL }],
    publishedDate,
    updatedDate,
    structuredData,
  } = props;

  const robots = {
    index: !noindex,
    follow: !nofollow,
    googleBot: {
      index: !noindex,
      follow: !nofollow,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };

  return {
    title,
    description,
    keywords,
    authors,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'SST Home Solutions',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@ssthomesolutions',
    },
    robots,
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'article:published_time': publishedDate?.toISOString(),
      'article:modified_time': updatedDate?.toISOString(),
    },
  };
}

/**
 * Generate JSON-LD structured data
 */
export function generateJSONLD(type: string, data: Record<string, any>) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

/**
 * Organization structured data
 */
export const organizationSchema = generateJSONLD('Organization', {
  name: 'SST Home Solutions',
  description: 'Find verified PGs, rooms & flats across Uttar Pradesh',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: [
    'https://www.facebook.com/stayerra',
    'https://www.instagram.com/ssthomesolutions',
    'https://www.twitter.com/ssthomesolutions',
    'https://www.linkedin.com/company/stayerra',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'Customer Service',
  },
  areaServed: {
    '@type': 'State',
    name: 'Uttar Pradesh',
  },
});

/**
 * Generate local business schema for cities
 */
export function generateLocalBusinessSchema(city: string, postcode?: string) {
  return generateJSONLD('LocalBusiness', {
    name: `Stayerra - ${city}`,
    description: `Find PGs, rooms & flats in ${city}`,
    url: `${BASE_URL}/city/${city.toLowerCase().replace(/\s+/g, '-')}`,
    telephone: '+91-XXXXXXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
      postalCode: postcode,
    },
    areaServed: {
      '@type': 'State',
      name: 'Uttar Pradesh',
    },
  });
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return generateJSONLD('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * Generate product schema for listings
 */
export function generateListingSchema(listing: {
  name: string;
  description: string;
  image: string;
  price: number;
  location: string;
  type: string;
  featured?: boolean;
}) {
  return generateJSONLD('RealEstateAgent', {
    name: listing.name,
    description: listing.description,
    image: listing.image,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'INR',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location,
    },
  });
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return generateJSONLD('FAQPage', {
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

/**
 * Generate article schema
 */
export function generateArticleSchema(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author?: string;
  content: string;
}) {
  return generateJSONLD('NewsArticle', {
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished.toISOString(),
    dateModified: article.dateModified?.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'SST Home Solutions',
    },
    articleBody: article.content,
  });
}

/**
 * Open Graph meta tags helper
 */
export function getOpenGraphMetaTags(props: SEOProps) {
  return {
    'og:title': props.title || 'SST Home Solutions',
    'og:description': props.description,
    'og:image': props.ogImage || DEFAULT_OG_IMAGE,
    'og:type': props.ogType || 'website',
    'og:url': props.canonicalUrl || BASE_URL,
    'og:site_name': 'SST Home Solutions',
    'og:locale': 'en_IN',
  };
}

/**
 * Twitter Card meta tags helper
 */
export function getTwitterCardMetaTags(props: SEOProps) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': props.title || 'SST Home Solutions',
    'twitter:description': props.description,
    'twitter:image': props.ogImage || DEFAULT_OG_IMAGE,
    'twitter:creator': '@ssthomesolutions',
    'twitter:site': '@ssthomesolutions',
  };
}

/**
 * Generate keywords for different content types
 */
export function generateKeywords(params: {
  city?: string;
  type?: string;
  additional?: string[];
}): string[] {
  const keywords: string[] = [];

  if (params.city) {
    keywords.push(
      `PG in ${params.city}`,
      `rooms for rent ${params.city}`,
      `flats in ${params.city}`,
      `rental accommodation ${params.city}`,
      `paying guest ${params.city}`,
      `affordable rooms ${params.city}`,
      `shared accommodation ${params.city}`,
      `${params.city} rooms`
    );
  }

  if (params.type) {
    keywords.push(
      `${params.type} in Uttar Pradesh`,
      `${params.type} near me`,
      `verified ${params.type}`,
      `${params.type} no broker`
    );
  }

  if (params.additional) {
    keywords.push(...params.additional);
  }

  keywords.push(
    'SST Home Solutions',
    'PG finder India',
    'room rental India',
    'best PG sites',
    'no broker rooms',
    'verified listings',
    'instant booking rooms'
  );

  return keywords;
}
