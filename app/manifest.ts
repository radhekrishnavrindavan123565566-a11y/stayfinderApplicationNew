import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchNest – Find Your Perfect Room in UP",
    short_name: "MatchNest",
    description: "Browse verified PGs, rooms & flats across Prayagraj, Lucknow, Kanpur and 120+ cities in Uttar Pradesh.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f43f5e",
    categories: ["real estate", "housing", "rental"],
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Browse Properties",
        short_name: "Explore",
        description: "Find rooms and PGs",
        url: "/properties",
        icons: [{ src: "/logo.png", sizes: "96x96" }],
      },
      {
        name: "My Messages",
        short_name: "Chat",
        description: "Open your messages",
        url: "/chat",
        icons: [{ src: "/logo.png", sizes: "96x96" }],
      },
    ],
  };
}
