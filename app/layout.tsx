import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClientProviders from "@/components/providers/ClientProviders";
import { Suspense } from "react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap", preload: true });

const BASE_URL = "https://stayerra.com";
const OG_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80";

// Structured Data for Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Stayerra",
  "description": "Find verified PGs, rooms & flats across Uttar Pradesh",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "sameAs": [
    "https://www.facebook.com/stayerra",
    "https://www.instagram.com/stayerra_in",
    "https://www.twitter.com/stayerra_in",
    "https://www.linkedin.com/company/stayerra"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "Customer Service"
  },
  "areaServed": {
    "@type": "State",
    "name": "Uttar Pradesh"
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Stayerra – Best PG, Rooms & Flats in UP | Verified Listings",
    template: "%s | Stayerra - Find Your Perfect Stay in Uttar Pradesh",
  },
  description: "Find verified PGs, rooms & flats across 120+ cities in Uttar Pradesh. Best rental solutions in Lucknow, Prayagraj, Kanpur & more. No broker fees. Instant booking with Aadhaar verification.",
  keywords: [
    "PG in Lucknow",
    "rooms for rent UP",
    "flat in Prayagraj",
    "PG Kanpur",
    "rental rooms Varanasi",
    "paying guest Uttar Pradesh",
    "affordable rooms UP",
    "verified PG listings",
    "no broker rooms",
    "Stayerra",
    "best PG sites India",
    "room rental Noida",
    "hostel in UP",
    "shared accommodation"
  ],
  authors: [{ name: "Stayerra", url: BASE_URL }],
  creator: "Stayerra",
  publisher: "Stayerra",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Stayerra" },
  formatDetection: { telephone: false },
  category: "Real Estate",
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en-IN': `${BASE_URL}/en-IN`,
      'hi': `${BASE_URL}/hi`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Stayerra",
    title: "Stayerra – Best PG, Rooms & Flats in UP",
    description: "Verified PGs, rooms & flats across 120+ cities in Uttar Pradesh. No broker. Instant booking.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Stayerra – Rental Rooms in UP",
        type: "image/jpeg",
      },
      {
        url: `${BASE_URL}/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: "Stayerra Logo",
        type: "image/jpeg",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stayerra – Best PG, Rooms & Flats in UP",
    description: "Verified PGs, rooms & flats. No broker fees. Instant booking.",
    images: [OG_IMAGE],
    creator: "@stayerra_in",
    site: "@stayerra_in",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    "bingbot": {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  referrer: "strict-origin-when-cross-origin",
  themeColor: "#f43f5e",
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import ErrorBoundary from '@/components/ErrorBoundary';
import ScrollProgress from '@/components/ui/ScrollProgress';

function ScrollProgressWrapper() {
  return <ScrollProgress />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* JSON-LD Structured Data for Rich Snippets */}
        <Script
          id="json-ld-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
          strategy="afterInteractive"
        />

        {/* Canonical URL */}
        <link rel="canonical" href={BASE_URL} />

        {/* Alternate Links for Multi-language */}
        <link rel="alternate" hrefLang="en-IN" href={BASE_URL} />
        <link rel="alternate" hrefLang="hi" href={`${BASE_URL}/hi`} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />

        {/* Google Site Verification for Search Console */}
        <meta name="google-site-verification" content="b8Svk1MJ3qt_svlwYxpBRH1MEFQDCW0xJ83RYihTlzk" />
        
        {/* Microsoft/Bing Verification */}
        <meta name="msvalidate.01" content="YOUR_MSVALIDATE_KEY" />
        
        {/* Google AdSense Account Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-6171735174915662" />
        
        {/* SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="author" content="Stayerra" />
        <meta name="publisher" content="Stayerra" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="English" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large" />
        
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6171735174915662"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Analytics 4 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_path: window.location.pathname,
                send_page_view: true,
              });
            `,
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Preload critical font */}
        <link rel="preload" as="font" href={geist.variable} type="font/woff2" crossOrigin="anonymous" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stayerra" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Optimization: Defer non-critical CSS/JS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .skip-link {
              position: absolute;
              top: -40px;
              left: 0;
              background: #000;
              color: #fff;
              padding: 8px 16px;
              text-decoration: none;
              z-index: 100;
              border-radius: 0 0 4px 0;
            }
            .skip-link:focus {
              top: 0;
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <Suspense fallback={null}>
          <ScrollProgressWrapper />
        </Suspense>
        <ErrorBoundary>
          <Navbar />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <ClientProviders />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "12px", background: "#1a1a1a", color: "#fff", fontSize: "14px" },
            success: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
