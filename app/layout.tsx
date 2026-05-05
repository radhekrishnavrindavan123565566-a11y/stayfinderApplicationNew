import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import AIChatbot from "@/components/ai/AIChatbot";
import ErrorBoundary from "@/components/ErrorBoundary";
import SocketProvider from "@/components/providers/SocketProvider";
import PWAProvider from "@/components/providers/PWAProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const BASE_URL = "https://nestora.in";
const OG_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nestora – Find Your Place. Feel At Home.",
    template: "%s | Nestora",
  },
  description: "Find verified PGs, rooms & flats across Uttar Pradesh. Nestora connects tenants and owners — no broker, instant booking, Aadhaar-verified listings.",
  keywords: ["PG in Lucknow", "rooms for rent UP", "flat in Prayagraj", "PG Kanpur", "rental rooms Varanasi", "Nestora"],
  authors: [{ name: "Nestora" }],
  creator: "Nestora",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Nestora" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Nestora",
    title: "Nestora – Find Your Place. Feel At Home.",
    description: "Verified PGs, rooms & flats across 120+ cities in Uttar Pradesh. No broker. Instant booking.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Nestora – Rental Rooms in UP" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nestora – Find Your Place. Feel At Home.",
    description: "Verified PGs, rooms & flats across 120+ cities in Uttar Pradesh. No broker. Instant booking.",
    images: [OG_IMAGE],
    creator: "@nestora_in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nestora" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <AIChatbot />
        <SocketProvider />
        <PWAProvider />
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
