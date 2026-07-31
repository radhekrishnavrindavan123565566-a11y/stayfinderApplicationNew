# SEO Files Index & Documentation

This document provides a complete guide to all SEO-related files and their purposes.

## 📁 SEO Configuration Files

### 1. **lib/seoConfig.ts**
- **Purpose**: Central configuration for all SEO settings
- **Contains**: 
  - Site information (name, URL, description)
  - Social media links
  - Contact information
  - Keywords by category
  - Performance targets
  - Cache strategies
  - Analytics IDs
  - Structured data templates

**Usage:**
```typescript
import { SEO_CONFIG, getContextualKeywords } from '@/lib/seoConfig';
```

---

### 2. **lib/seo.ts**
- **Purpose**: Reusable SEO utility functions
- **Contains**:
  - `generateSEOMetadata()` - Create Metadata objects
  - `generateJSONLD()` - Create JSON-LD schemas
  - `organizationSchema` - Organization structured data
  - `generateLocalBusinessSchema()` - Location-based schema
  - `generateBreadcrumbSchema()` - Breadcrumb navigation schema
  - `generateListingSchema()` - Real estate listing schema
  - `generateArticleSchema()` - Blog article schema
  - `generateFAQSchema()` - FAQ schema
  - `generateKeywords()` - Smart keyword generation

**Usage:**
```typescript
import { generateSEOMetadata, generateArticleSchema } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Page Title',
  description: 'Description...',
  keywords: ['keyword1', 'keyword2'],
});
```

---

## 🎨 SEO Components

### 3. **components/seo/SchemaRenderer.tsx**
- **Purpose**: Render JSON-LD structured data schemas
- **Props**: 
  - `schema`: The schema object to render
  - `id`: Unique identifier for the script tag

**Usage:**
```tsx
import SchemaRenderer from '@/components/seo/SchemaRenderer';
import { generateArticleSchema } from '@/lib/seo';

<SchemaRenderer 
  schema={generateArticleSchema({ ... })} 
  id="article-schema"
/>
```

---

### 4. **components/seo/MetaTags.tsx**
- **Purpose**: Dynamic meta tag updates for client-side rendered content
- **Exports**:
  - `updateMetaTags()` - Update meta tags dynamically
  - `getPageMetaTags()` - Get current page meta information

**Usage:**
```tsx
import { updateMetaTags, getPageMetaTags } from '@/components/seo/MetaTags';

// Update meta tags dynamically
updateMetaTags({
  title: 'New Title',
  description: 'New description',
  image: 'https://...',
  url: 'https://...',
});

// Get current meta tags
const metas = getPageMetaTags();
```

---

### 5. **components/seo/Breadcrumb.tsx**
- **Purpose**: SEO-optimized breadcrumb navigation with schema
- **Props**:
  - `items`: Array of breadcrumb items
  - `className`: CSS classes

**Usage:**
```tsx
import Breadcrumb from '@/components/seo/Breadcrumb';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'City', url: '/city/lucknow' },
];

<Breadcrumb items={breadcrumbs} className="mb-4" />
```

---

### 6. **components/seo/OptimizedImage.tsx**
- **Purpose**: SEO-optimized Image component with proper alt text
- **Exports**:
  - `OptimizedImage` - Main image component
  - `HeroImage` - Hero image with figure captions
  - `ListingImage` - Product/listing image with schema

**Usage:**
```tsx
import OptimizedImage, { HeroImage, ListingImage } from '@/components/seo/OptimizedImage';

// Basic optimized image
<OptimizedImage 
  src="/image.jpg" 
  alt="Descriptive alt text"
  width={800}
  height={600}
/>

// Hero image
<HeroImage 
  src="/hero.jpg" 
  alt="Hero"
  title="Main Heading"
/>

// Listing image with price
<ListingImage 
  src="/listing.jpg" 
  alt="Room"
  productName="Modern PG Room"
  productPrice={8000}
/>
```

---

## 🪝 Custom Hooks

### 7. **hooks/useWebVitals.ts**
- **Purpose**: Track and report Core Web Vitals to Google Analytics
- **Tracks**: LCP, FID, FCP, CLS, TTFB

**Usage:**
```typescript
import { useWebVitals } from '@/hooks/useWebVitals';

export default function App() {
  useWebVitals((metric) => {
    console.log(metric);
  });
  
  return <div>Your app</div>;
}
```

---

## 📄 Page Templates

### 8. **app/(public)/city/[slug]/page.tsx**
- **Purpose**: City page template with local SEO
- **Features**:
  - Dynamic metadata generation
  - Local business schema
  - Breadcrumb navigation
  - Filter sections
  - Local content
  - FAQ section
  - Static generation for performance

**Usage**: Automatically used for city pages like `/city/lucknow`

---

### 9. **app/(public)/blog/[slug]/page.tsx**
- **Purpose**: Blog post template with article schema
- **Features**:
  - Dynamic metadata for posts
  - Article schema markup
  - Breadcrumb navigation
  - Publishing metadata
  - Social sharing buttons
  - Related posts
  - Static generation

**Usage**: Automatically used for blog pages like `/blog/article-title`

---

## 🤖 Automation Scripts

### 10. **scripts/seo-audit.ts**
- **Purpose**: Automated SEO audit of the entire site
- **Checks**:
  - Layout meta tags
  - robots.txt configuration
  - Sitemap presence
  - SEO configuration
  - SEO utilities existence
  - Next.js configuration
  - Dependencies
  - Environment variables

**Run**: `npm run seo:audit`

---

## 🗂️ Core Configuration Files

### 11. **app/layout.tsx**
- **Purpose**: Root layout with comprehensive SEO meta tags
- **Contains**:
  - Global metadata
  - JSON-LD organization schema
  - Google verification tags
  - Analytics scripts
  - Preconnects and DNS prefetch
  - Security headers meta tags
  - PWA meta tags

**Key Features**:
```tsx
// Organization Schema
<SchemaRenderer schema={jsonLd} />

// Analytics
<Script src="https://www.googletagmanager.com/gtag/js?id=G-..." />

// OpenGraph, Twitter Cards, Robots settings in metadata
```

---

### 12. **app/robots.ts**
- **Purpose**: Generate robots.txt rules
- **Contains**: Crawl rules, sitemaps, host

**Location**: Automatically served as `/robots.txt`

---

### 13. **app/sitemap.ts**
- **Purpose**: Generate dynamic sitemap
- **Contains**: Main pages, city pages, category pages

**Location**: Automatically served as `/sitemap.xml`

---

### 14. **public/robots.txt**
- **Purpose**: Fallback robots.txt (if dynamic one isn't generated)
- **Contains**: User-agent rules, disallow paths, sitemap

---

### 15. **next.config.js**
- **Purpose**: Next.js configuration with SEO optimizations
- **Optimizations**:
  - Image optimization (WebP, AVIF)
  - Cache control headers
  - Security headers
  - Gzip compression
  - Static generation

---

## 📋 Documentation Files

### 16. **SEO_IMPLEMENTATION_GUIDE.md**
- **Purpose**: Comprehensive SEO implementation guide
- **Contents**:
  - Completed improvements
  - Step-by-step setup instructions
  - Page-level optimization
  - City pages SEO
  - Listing pages schema
  - Blog optimization
  - Internal linking strategy
  - Content optimization
  - Mobile optimization
  - Performance monitoring
  - Keyword strategy
  - Monthly checklist
  - Expected results timeline
  - Common mistakes to avoid

---

### 17. **SEO_QUICK_START.md**
- **Purpose**: Quick start guide (30-minute setup)
- **Contents**:
  - Initial setup steps
  - Google Search Console setup
  - Google Analytics setup
  - Bing Webmaster setup
  - Content creation
  - Monitoring tasks
  - Testing tools
  - Component usage examples
  - Key metrics
  - Performance tips
  - Troubleshooting
  - Checklist

---

### 18. **SEO_FILES_INDEX.md** (This File)
- **Purpose**: Documentation of all SEO-related files
- **Contents**: Complete index with descriptions and usage

---

## 🔄 File Dependencies

```
layout.tsx
  ├── sitemap.ts
  ├── robots.ts
  ├── lib/seo.ts
  ├── components/seo/SchemaRenderer.tsx
  ├── components/seo/OptimizedImage.tsx
  └── hooks/useWebVitals.ts

[slug]/page.tsx (City/Blog pages)
  ├── lib/seo.ts
  ├── lib/seoConfig.ts
  ├── components/seo/SchemaRenderer.tsx
  ├── components/seo/Breadcrumb.tsx
  └── components/seo/OptimizedImage.tsx

package.json
  ├── SEO dependencies (web-vitals)
  └── SEO scripts (seo:audit)
```

---

## 🚀 Getting Started

### 1. Initial Setup
```bash
# Run SEO audit
npm run seo:audit

# Update configuration
# Edit lib/seoConfig.ts with your details

# Build and test
npm run build
npm run seo:audit
```

### 2. Deploy
```bash
# Pre-deploy with SEO check
npm run pre-deploy:with-seo

# Deploy to production
npm run build && npm run start
```

### 3. Monitor
```bash
# Regular checks
npm run seo:audit

# Daily: Check Google Search Console
# Weekly: Review Analytics
# Monthly: Comprehensive audit
```

---

## 📊 File Organization

```
app/
├── layout.tsx (ROOT SEO)
├── robots.ts
├── sitemap.ts
├── (public)/
│   ├── city/[slug]/page.tsx
│   └── blog/[slug]/page.tsx
└── api/

components/
└── seo/
    ├── SchemaRenderer.tsx
    ├── MetaTags.tsx
    ├── Breadcrumb.tsx
    └── OptimizedImage.tsx

hooks/
└── useWebVitals.ts

lib/
├── seo.ts
└── seoConfig.ts

public/
├── robots.txt
└── sitemap.xml (generated)

scripts/
└── seo-audit.ts

next.config.js

SEO_IMPLEMENTATION_GUIDE.md
SEO_QUICK_START.md
SEO_FILES_INDEX.md (this file)
```

---

## 🎯 Common Tasks

### Add SEO to a New Page
```typescript
import { generateSEOMetadata } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Page Title | Stayerra',
  description: 'Page description...',
  keywords: ['keyword1', 'keyword2'],
  canonicalUrl: 'https://stayerra.com/page',
});
```

### Add Schema Markup
```typescript
import SchemaRenderer from '@/components/seo/SchemaRenderer';
import { generateArticleSchema } from '@/lib/seo';

<SchemaRenderer schema={generateArticleSchema({ ... })} />
```

### Add Optimized Images
```typescript
import OptimizedImage from '@/components/seo/OptimizedImage';

<OptimizedImage 
  src="/image.jpg" 
  alt="Descriptive text for SEO"
  width={800}
  height={600}
/>
```

### Add Breadcrumbs
```typescript
import Breadcrumb from '@/components/seo/Breadcrumb';

<Breadcrumb items={breadcrumbs} />
```

---

## ✅ Verification Checklist

- [ ] All pages have unique meta titles and descriptions
- [ ] All images have descriptive alt text
- [ ] Breadcrumb navigation on relevant pages
- [ ] Schema markup on city and blog pages
- [ ] robots.txt configured correctly
- [ ] Sitemap generation working
- [ ] Google Search Console verification added
- [ ] Analytics tracking implemented
- [ ] Core Web Vitals < targets
- [ ] Mobile-friendly design verified

---

## 📞 Support

For issues or questions:
1. Check the relevant documentation file
2. Run `npm run seo:audit` to identify issues
3. Review code comments in source files
4. Check Google Search Central: https://developers.google.com/search

---

## 📈 Expected Results

**Month 1-2**: 
- Pages indexed in Google
- Initial search impressions
- 50-100 organic visitors/month

**Month 3-4**:
- Ranking improvements
- 200-500 organic visitors/month

**Month 6+**:
- Top 10 rankings for target keywords
- 1000+ organic visitors/month
- Established organic presence

---

Last Updated: July 31, 2026
