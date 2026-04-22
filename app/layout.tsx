import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import SocketProvider from "@/components/providers/SocketProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "MatchNest – Connecting Dwellings, Linking Hearts",
  description: "Find your perfect room or tenant across Uttar Pradesh. MatchNest is your trusted mediator for PG, rooms, and rentals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <SocketProvider />
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
