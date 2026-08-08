import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';
import Breadcrumb, { BreadcrumbItem } from '@/components/seo/Breadcrumb';

interface BlogPostProps {
  params: { slug: string };
}

// Blog posts - replace with DB fetch in production
const blogPosts: Record<string, {
  title: string;
  description: string;
  content: string;
  image: string;
  author: string;
  publishedDate: string;
  updatedDate: string;
  category: string;
  readTime: string;
}> = {
  'how-to-find-best-pg': {
    title: 'How to Find the Best PG in Uttar Pradesh – 2024 Guide',
    description: 'Complete guide to finding verified, affordable PGs in UP. Learn tips and tricks to get the perfect accommodation.',
    content: 'Full blog content here...',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    author: 'SST Home Solutions Team',
    publishedDate: '2024-01-15',
    updatedDate: '2024-07-31',
    category: 'Housing Guide',
    readTime: '8 min read',
  },
  'tips-for-roommates': {
    title: 'Living with Roommates: Tips for Harmonious Shared Living',
    description: 'Essential tips for maintaining a healthy roommate relationship and making the most of shared accommodation.',
    content: 'Full blog content here...',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    author: 'SST Home Solutions Team',
    publishedDate: '2024-01-20',
    updatedDate: '2024-07-25',
    category: 'Living Tips',
    readTime: '5 min read',
  },
};

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const post = blogPosts[params.slug];
  if (!post) {
    return { title: 'Article Not Found', description: 'The article you are looking for does not exist.' };
  }
  return generateSEOMetadata({
    title: `${post.title} | SST Home Solutions`,
    description: post.description,
    keywords: [post.category, 'PG', 'Rental Guide', 'Accommodation Tips', 'Uttar Pradesh'],
    ogImage: post.image,
    ogType: 'article',
    canonicalUrl: `https://ssthomesolutions.com/blog/${params.slug}`,
  });
}

function getBreadcrumbs(slug: string): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: slug.split('-').join(' '), url: `/blog/${slug}` },
  ];
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = blogPosts[params.slug];
  const breadcrumbs = getBreadcrumbs(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Article JSON-LD schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.publishedDate,
    dateModified: post.updatedDate,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'SST Home Solutions',
      logo: { '@type': 'ImageObject', url: 'https://ssthomesolutions.com/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://ssthomesolutions.com/blog/${params.slug}` },
  };

  return (
    <>
      <SchemaRenderer schema={articleSchema} id={`article-${params.slug}`} />

      <article className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbs} className="mb-8" />

          <header className="mb-8">
            <p className="text-sm text-gray-500 mb-2">{post.category} • {post.readTime}</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{post.description}</p>
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">By {post.author}</p>
                <p className="text-sm text-gray-600">
                  Published {new Date(post.publishedDate).toLocaleDateString()} · Updated {new Date(post.updatedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </header>

          <figure className="mb-8">
            <img src={post.image} alt={post.title} className="w-full h-auto rounded-lg" />
            <figcaption className="text-sm text-gray-500 mt-2">{post.title}</figcaption>
          </figure>

          <div className="prose prose-lg max-w-none mb-8">
            <p>{post.content}</p>
          </div>

          {/* Share */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold mb-4">Share this article</h3>
            <div className="flex gap-4">
              <a href="#" className="text-blue-600 hover:underline">Facebook</a>
              <a href="#" className="text-blue-400 hover:underline">Twitter</a>
              <a href="#" className="text-blue-700 hover:underline">LinkedIn</a>
            </div>
          </div>

          {/* Related */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(blogPosts)
                .filter(([slug]) => slug !== params.slug)
                .map(([slug, p]) => (
                  <a key={slug} href={`/blog/${slug}`} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <p className="text-sm text-gray-500 mb-2">{p.category}</p>
                      <h3 className="font-semibold group-hover:text-blue-600">{p.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                    </div>
                  </a>
                ))}
            </div>
          </section>
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  return [];
}
