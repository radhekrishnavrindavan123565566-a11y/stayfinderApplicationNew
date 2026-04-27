import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nestora – Find Your Perfect Room in UP",
    short_name: "Nestora",
    description: "Browse verified PGs, rooms & flats across Prayagraj, Lucknow, Kanpur and 120+ cities in Uttar Pradesh.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f43f5e",
    categories: ["real estate", "housing", "rental"],
    icons: [
      {
        src: "/logo.png",
        sizes: "1385x752",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    screenshots: [
      {
        src: "/logo.png",
        sizes: "1385x752",
        type: "image/png",
        // @ts-expect-error — form_factor is valid per spec
        form_factor: "wide",
      },
    ],
    shortcuts: [
      {
        name: "Browse Properties",
        short_name: "Explore",
        url: "/properties",
        icons: [{ src: "/logo.png", sizes: "1385x752" }],
      },
      {
        name: "My Messages",
        short_name: "Chat",
        url: "/chat",
        icons: [{ src: "/logo.png", sizes: "1385x752" }],
      },
    ],
  };
}
