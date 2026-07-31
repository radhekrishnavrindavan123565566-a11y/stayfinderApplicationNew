'use client';

import Script from 'next/script';

interface SchemaRendererProps {
  schema: Record<string, any>;
  id?: string;
}

/**
 * Component to render JSON-LD schema scripts
 * Use this on any page that needs structured data
 */
export default function SchemaRenderer({ schema, id }: SchemaRendererProps) {
  return (
    <Script
      id={id || 'json-ld-schema'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="afterInteractive"
    />
  );
}
