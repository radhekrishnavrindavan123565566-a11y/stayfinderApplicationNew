"use client";

interface PropertyStructuredDataProps {
  property: {
    _id: string;
    title: string;
    description: string;
    price: number;
    location: {
      address: string;
      city: string;
      state?: string;
      pincode?: string;
    };
    images: string[];
    averageRating?: number;
    reviewCount?: number;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  };
}

export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: property.title,
    description: property.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state || 'Uttar Pradesh',
      postalCode: property.location.pincode,
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    image: property.images,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    amenityFeature: property.amenities?.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    })),
    ...(property.averageRating && property.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.averageRating,
        reviewCount: property.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
}

export function OrganizationStructuredData({
  name = 'Nestora',
  url = 'https://nestora.in',
  logo = 'https://nestora.in/logo.png',
}: OrganizationStructuredDataProps = {}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs: [
      'https://twitter.com/nestora_in',
      'https://facebook.com/nestora',
      'https://instagram.com/nestora_in',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
