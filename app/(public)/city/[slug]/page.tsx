import { Metadata } from 'next';
import { generateSEOMetadata, generateLocalBusinessSchema, generateKeywords } from '@/lib/seo';
import SchemaRenderer from '@/components/seo/SchemaRenderer';
import Breadcrumb, { BreadcrumbItem } from '@/components/seo/Breadcrumb';

interface CityPageProps {
  params: {
    slug: string;
  };
}

// Format city slug to proper name
function formatCityName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate metadata for city pages
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = formatCityName(params.slug);

  return generateSEOMetadata({
    title: `Find PG, Rooms & Flats in ${city} | Stayerra`,
    description: `Discover verified PGs, rooms & flats in ${city}, Uttar Pradesh. Best rental options with no broker fees and instant booking. Browse ${city} listings on Stayerra.`,
    keywords: generateKeywords({
      city,
      type: 'PG',
      additional: [
        `affordable rooms ${city}`,
        `student PG ${city}`,
        `working professional rooms ${city}`,
        `best PG in ${city}`,
        `shared accommodation ${city}`,
      ],
    }),
    canonicalUrl: `https://stayerra.com/city/${params.slug}`,
    ogImage: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80`,
  });
}

// Breadcrumb items
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
      {/* Schema Markup */}
      <SchemaRenderer schema={localBusinessSchema} id={`local-business-${params.slug}`} />

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbs} className="mb-8" />

          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PG, Rooms & Flats in {city}
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8">
            Find verified, affordable accommodation in {city}. No broker fees, instant booking, and Aadhaar-verified listings.
          </p>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Filter by Type</h2>
              <ul className="space-y-2">
                <li><a href={`/city/${params.slug}/pg`} className="text-blue-600 hover:underline">PG & Hostels</a></li>
                <li><a href={`/city/${params.slug}/rooms`} className="text-blue-600 hover:underline">Rooms</a></li>
                <li><a href={`/city/${params.slug}/flats`} className="text-blue-600 hover:underline">Flats</a></li>
                <li><a href={`/city/${params.slug}/shared`} className="text-blue-600 hover:underline">Shared Accommodation</a></li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Budget Range</h2>
              <ul className="space-y-2">
                <li><a href={`/city/${params.slug}?budget=low`} className="text-blue-600 hover:underline">Under ₹5,000</a></li>
                <li><a href={`/city/${params.slug}?budget=mid`} className="text-blue-600 hover:underline">₹5,000 - ₹10,000</a></li>
                <li><a href={`/city/${params.slug}?budget=high`} className="text-blue-600 hover:underline">₹10,000 - ₹20,000</a></li>
                <li><a href={`/city/${params.slug}?budget=premium`} className="text-blue-600 hover:underline">₹20,000+</a></li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Features</h2>
              <ul className="space-y-2">
                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> WiFi</label></li>
                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> Meals Included</label></li>
                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> Parking</label></li>
                <li><label className="flex items-center"><input type="checkbox" className="mr-2" /> A/C</label></li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Roommate Type</h2>
              <ul className="space-y-2">
                <li><a href={`/city/${params.slug}?type=girls`} className="text-blue-600 hover:underline">For Girls</a></li>
                <li><a href={`/city/${params.slug}?type=boys`} className="text-blue-600 hover:underline">For Boys</a></li>
                <li><a href={`/city/${params.slug}?type=couples`} className="text-blue-600 hover:underline">For Couples</a></li>
                <li><a href={`/city/${params.slug}?type=family`} className="text-blue-600 hover:underline">For Families</a></li>
              </ul>
            </div>
          </div>

          {/* Listings Section - Placeholder */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Available Listings in {city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Listings will be populated here */}
              <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
                Loading listings...
              </div>
            </div>
          </section>

          {/* Local SEO Content */}
          <section className="mt-12 bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Why Choose Stayerra in {city}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">✓ No Broker Fees</h3>
                <p className="text-gray-700">Save money with zero broker commissions. Deal directly with owners and properties.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Verified Listings</h3>
                <p className="text-gray-700">All properties verified with Aadhaar details for safety and authenticity.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✓ Instant Booking</h3>
                <p className="text-gray-700">Book immediately and move in without lengthy paperwork or delays.</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Common Questions about {city} Rentals</h2>
            <div className="space-y-4">
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold">What is the average PG rent in {city}?</summary>
                <p className="mt-2 text-gray-700">Average PG rents in {city} range from ₹5,000 to ₹15,000 depending on location and amenities.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold">How to find the best rooms in {city}?</summary>
                <p className="mt-2 text-gray-700">Use our filters to search by budget, amenities, and location. Check verified reviews and ratings before booking.</p>
              </details>
              <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                <summary className="font-semibold">Are the listings on Stayerra verified?</summary>
                <p className="mt-2 text-gray-700">Yes, all listings are verified with owner Aadhaar details and property photos for your safety.</p>
              </details>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// Generate static params for top cities
export async function generateStaticParams() {
  const cities = [
    'lucknow',
    'prayagraj',
    'kanpur',
    'varanasi',
    'agra',
    'meerut',
    'noida',
    'greater-noida',
    'bareilly',
    'aligarh',
    'ghaziabad',
    'gorakhpur',
  ];

  return cities.map((city) => ({
    slug: city,
  }));
}
