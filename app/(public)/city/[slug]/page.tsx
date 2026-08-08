import { Metadata } from 'next';
import { generateSEOMetadata, generateLocalBusinessSchema, generateKeywords } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';
import Breadcrumb, { BreadcrumbItem } from '@/components/seo/Breadcrumb';

interface CityPageProps {
  params: { slug: string };
}

function formatCityName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = formatCityName(params.slug);
  return generateSEOMetadata({
    title: `Find PG, Rooms & Flats in ${city} | SST Home Solutions`,
    description: `Discover verified PGs, rooms & flats in ${city}, Uttar Pradesh. No broker fees, instant booking. Browse ${city} listings on SST Home Solutions.`,
    keywords: generateKeywords({
      city,
      type: 'PG',
      additional: [
        `affordable rooms ${city}`,
        `student PG ${city}`,
        `best PG in ${city}`,
        `shared accommodation ${city}`,
      ],
    }),
    canonicalUrl: `https://ssthomesolutions.com/city/${params.slug}`,
    ogImage: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80`,
  });
}

function getBreadcrumbs(slug: string): BreadcrumbItem[] {
  const city = formatCityName(slug);
  return [
    { name: 'Home', url: '/' },
    { name: 'Cities', url: '/cities' },
    { name: city, url: `/city/${slug}` },
  ];
}

export default function CityPage({ params }: CityPageProps) {
  const city = formatCityName(params.slug);
  const breadcrumbs = getBreadcrumbs(params.slug);
  const localBusinessSchema = generateLocalBusinessSchema(city);

  return (
    <>
      <SchemaRenderer schema={localBusinessSchema} id={`local-business-${params.slug}`} />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbs} className="mb-8" />

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PG, Rooms & Flats in {city}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find verified, affordable accommodation in {city}. No broker fees, instant booking, Aadhaar-verified listings.
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Filter by Type</h2>
              <ul className="space-y-2">
                {['pg', 'rooms', 'flats', 'shared'].map((type) => (
                  <li key={type}>
                    <a href={`/city/${params.slug}/${type}`} className="text-blue-600 hover:underline capitalize">
                      {type === 'pg' ? 'PG & Hostels' : type === 'shared' ? 'Shared Accommodation' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Budget Range</h2>
              <ul className="space-y-2">
                {[
                  { label: 'Under ₹5,000', value: 'low' },
                  { label: '₹5,000 – ₹10,000', value: 'mid' },
                  { label: '₹10,000 – ₹20,000', value: 'high' },
                  { label: '₹20,000+', value: 'premium' },
                ].map(({ label, value }) => (
                  <li key={value}>
                    <a href={`/city/${params.slug}?budget=${value}`} className="text-blue-600 hover:underline">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              <ul className="space-y-2">
                {['WiFi', 'Meals Included', 'Parking', 'A/C'].map((item) => (
                  <li key={item}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" /> {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">For</h2>
              <ul className="space-y-2">
                {['girls', 'boys', 'couples', 'family'].map((type) => (
                  <li key={type}>
                    <a href={`/city/${params.slug}?type=${type}`} className="text-blue-600 hover:underline capitalize">
                      For {type.charAt(0).toUpperCase() + type.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Listings placeholder */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Available Listings in {city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                Listings loading...
              </div>
            </div>
          </section>

          {/* Why SST Home Solutions */}
          <section className="mt-12 bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Why Choose SST Home Solutions in {city}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">✓ No Broker Fees</h3>
                <p className="text-gray-700">Zero broker commissions. Deal directly with property owners.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Verified Listings</h3>
                <p className="text-gray-700">All properties verified with Aadhaar for safety and authenticity.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Instant Booking</h3>
                <p className="text-gray-700">Book immediately without lengthy paperwork or delays.</p>
              </div>
            </div>
          </section>

          {/* FAQ with schema-friendly markup */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">FAQs about {city} Rentals</h2>
            <div className="space-y-4">
              {[
                {
                  q: `What is the average PG rent in ${city}?`,
                  a: `Average PG rents in ${city} range from ₹5,000 to ₹15,000 depending on location and amenities.`,
                },
                {
                  q: `How to find the best rooms in ${city}?`,
                  a: `Use our filters to search by budget, amenities, and location. Check verified reviews before booking.`,
                },
                {
                  q: `Are listings on SST Home Solutions verified?`,
                  a: `Yes, all listings are verified with owner Aadhaar details and property photos for your safety.`,
                },
              ].map(({ q, a }, i) => (
                <details key={i} className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                  <summary className="font-semibold">{q}</summary>
                  <p className="mt-2 text-gray-700">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// No static params needed — pages are rendered on-demand
export async function generateStaticParams() {
  return [];
}
