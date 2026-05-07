import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nestora - Find Your Perfect Rental Home',
    short_name: 'Nestora',
    description: 'Find verified PGs, rooms & flats across Uttar Pradesh',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f43f5e',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
