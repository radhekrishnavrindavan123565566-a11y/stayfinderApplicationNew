import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
    unoptimized: true, // allows base64 data URLs and local /uploads paths on all envs
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/logo.png" },
    ],
  },
};

export default nextConfig;
