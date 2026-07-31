# 🚀 Stayerra SEO Cheat Sheet

Quick reference for common SEO tasks.

---

## 📝 Add SEO to Any Page

```typescript
import { generateSEOMetadata } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Page Title | Stayerra',
  description: 'Page description (160 chars)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  canonicalUrl: 'https://stayerra.com/your-page',
  ogImage: 'https://example.com/image.jpg',
});

export default function Page() {
  return <div>Your content</div>;
}
```

---

## 🏢 Add Local Business Schema (Cities)

```typescript
import { generateLocalBusinessSchema } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';

const schema = generateLocalBusinessSchema('Lucknow', '226001');

export default function CityPage() {
  return (
    <>
      <SchemaRenderer schema={schema} />
      <h1>Find PG & Rooms in Lucknow</h1>
      {/* Your content */}
    </>
  );
}
```

---

## 📰 Add Article Schema (Blog Posts)

```typescript
import { generateArticleSchema } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';

const schema = generateArticleSchema({
  headline: 'Article Title',
  description: 'Article description',
  image: 'https://example.com/image.jpg',
  datePublished: new Date('2024-01-15'),
  dateModified: new Date('2024-01-20'),
  author: 'Author Name',
  content: 'Full article content...',
});

export default function BlogPost() {
  return (
    <>
      <SchemaRenderer schema={schema} />
      <article>
        <h1>Article Title</h1>
        {/* Your content */}
      </article>
    </>
  );
}
```

---

## 🖼️ Add Optimized Images

```typescript
import OptimizedImage from '@/components/seo/OptimizedImage';

// Basic optimized image
<OptimizedImage 
  src="/room.jpg" 
  alt="Modern room with bed and window"
  width={800}
  height={600}
/>

// Hero image
import { HeroImage } from '@/components/seo/OptimizedImage';
<HeroImage 
  src="/hero.jpg" 
  alt="Hero background"
  title="Find Your Perfect Room"
/>

// Listing image with price
import { ListingImage } from '@/components/seo/OptimizedImage';
<ListingImage 
  src="/listing.jpg" 
  alt="PG room"
  productName="Modern PG in Lucknow"
  productPrice={8000}
/>
```

---

## 🧭 Add Breadcrumb Navigation

```typescript
import Breadcrumb from '@/components/seo/Breadcrumb';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Cities', url: '/cities' },
  { name: 'Lucknow', url: '/city/lucknow' },
];

export default function CityPage() {
  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      {/* Your content */}
    </>
  );
}
```

---

## ❓ Add FAQ Schema

```typescript
import { generateFAQSchema } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';

const schema = generateFAQSchema([
  {
    question: 'What is the average PG rent?',
    answer: 'Average rent ranges from ₹5000 to ₹15000...',
  },
  {
    question: 'How to book a room?',
    answer: 'Visit our site and click the book button...',
  },
]);

export default function FAQ() {
  return (
    <>
      <SchemaRenderer schema={schema} />
      {/* Your FAQ items */}
    </>
  );
}
```

---

## 🔗 Smart Keywords Generation

```typescript
import { generateKeywords } from '@/lib/seo';

// City-based keywords
const cityKeywords = generateKeywords({
  city: 'Lucknow',
  type: 'PG',
  additional: ['girls', 'affordable'],
});

// Result: [
//   'PG in Lucknow',
//   'rooms for rent Lucknow',
//   'PG in Lucknow girls',
//   'affordable PG Lucknow',
//   ...
// ]
```

---

## 🔍 Get Contextual Keywords

```typescript
import { getContextualKeywords } from '@/lib/seoConfig';

// Get city keywords
const cityKwds = getContextualKeywords('city', 'Lucknow');

// Get type keywords
const typeKwds = getContextualKeywords('type', 'PG');

// Get main keywords
const mainKwds = getContextualKeywords('main');
```

---

## 📊 Track Core Web Vitals

```typescript
'use client';

import { useWebVitals } from '@/hooks/useWebVitals';

export default function App() {
  useWebVitals((metric) => {
    console.log(`${metric.name}: ${metric.value}ms`);
    // Sends to Google Analytics automatically
  });

  return <div>Your app</div>;
}
```

---

## 🛠️ Commands

```bash
# Run SEO audit
npm run seo:audit

# Build the project
npm run build

# Start dev server
npm run dev

# Deploy with SEO check
npm run pre-deploy:with-seo
```

---

## 📋 Page Meta Template

Every page should have:

```typescript
// 1. Metadata
export const metadata = generateSEOMetadata({
  title: 'Unique title with keywords',
  description: 'Unique description under 160 chars',
  keywords: ['relevant', 'keywords', 'here'],
});

// 2. H1 Tag
<h1>Main heading matching title</h1>

// 3. Schema (if applicable)
<SchemaRenderer schema={schema} />

// 4. Images with alt text
<OptimizedImage alt="Descriptive text" />

// 5. Internal Links
<Link href="/related-page">Related Link</Link>

// 6. Breadcrumbs (if nested)
<Breadcrumb items={breadcrumbs} />
```

---

## ⚡ Performance Checklist

- ✅ Image optimization (WebP, AVIF)
- ✅ Lazy loading images
- ✅ Font preloading
- ✅ DNS prefetch
- ✅ Cache headers
- ✅ Minified CSS/JS
- ✅ Static generation
- ✅ CDN ready

---

## 🐛 Debug SEO Issues

**Pages not indexing?**
```typescript
// Check robots meta tag
export const metadata = {
  robots: {
    index: true,
    follow: true,
  },
};
```

**Schema not validating?**
```typescript
// Check schema with Google's tool
// https://search.google.com/test/rich-results
```

**Page speed slow?**
```bash
# Check with PageSpeed Insights
# https://pagespeed.web.dev/
```

**Keywords not ranking?**
```typescript
// Ensure H1 contains keyword
<h1>Keyword in your heading</h1>

// Add keyword in first 100 words
<p>Start with keyword...</p>

// Use keyword in internal links
<Link href="...">Keyword anchor text</Link>
```

---

## 🎯 Content Requirements

**Minimum per page:**
- ✅ Unique H1 tag
- ✅ Meta description (160 chars)
- ✅ 300+ words of content
- ✅ At least 1 internal link
- ✅ At least 1 image with alt text
- ✅ Proper heading structure (H1 > H2 > H3)

**Optimal per page:**
- ✅ 1000+ words of quality content
- ✅ Multiple internal links
- ✅ 2-3 images with alt text
- ✅ Proper keyword distribution (1-2%)
- ✅ Schema markup
- ✅ Breadcrumb navigation
- ✅ Related content links

---

## 📞 File Quick Links

- **Config**: `lib/seoConfig.ts`
- **Utilities**: `lib/seo.ts`
- **Layout**: `app/layout.tsx`
- **Components**: `components/seo/`
- **Templates**: `app/(public)/`
- **Scripts**: `scripts/seo-audit.ts`
- **Documentation**: `SEO_*.md`

---

## 🚀 Publishing Checklist

Before deploying:

- [ ] Run `npm run seo:audit`
- [ ] Check all pages have meta tags
- [ ] Verify images have alt text
- [ ] Test on mobile
- [ ] Run PageSpeed Insights
- [ ] Check canonical URLs
- [ ] Validate schema markup
- [ ] Test breadcrumbs
- [ ] Review internal links
- [ ] Commit and push changes

---

## 📈 Monthly SEO Tasks

```
Week 1:
- [ ] Check Search Console
- [ ] Review new search queries
- [ ] Analyze top pages
- [ ] Fix any crawl errors

Week 2:
- [ ] Update page content
- [ ] Add new blog post
- [ ] Check Core Web Vitals
- [ ] Review rankings

Week 3:
- [ ] Run SEO audit (npm run seo:audit)
- [ ] Analyze competitor sites
- [ ] Identify new keywords
- [ ] Plan new content

Week 4:
- [ ] Review organic traffic
- [ ] Analyze user behavior
- [ ] Update underperforming pages
- [ ] Build backlinks
```

---

## 💡 Pro Tips

1. **Title Formula**: Primary Keyword + Modifier | Brand
   - Example: "Best PG in Lucknow | Stayerra"

2. **Description Formula**: Solution + Benefit + CTA (160 chars)
   - Example: "Find verified PGs in Lucknow. No broker, instant booking. Browse now on Stayerra."

3. **URL Structure**: `/type/location/specific`
   - Example: `/city/lucknow/pg-for-girls`

4. **Internal Link Formula**: 1 link per 100 words
   - Example: In 500-word article, add ~5 internal links

5. **Keyword Density**: 1-2% of content
   - Example: "Keyword" appears 1-2 times per 100 words

6. **Header Structure**: 1 H1 > Multiple H2s > Multiple H3s
   - Never skip levels or use multiple H1s

7. **Image Alt Text**: `noun + descriptor + keyword`
   - Example: "Room with window and bed in Lucknow PG"

8. **Meta Description**: Target keywords but write for users
   - Make it compelling and click-worthy

---

## 🎓 Learning Resources

- [Google Search Central](https://developers.google.com/search)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Schema.org](https://schema.org)
- [Moz SEO](https://moz.com/learn/seo)

---

**Updated**: July 31, 2026
**Status**: Ready to Use ✅
