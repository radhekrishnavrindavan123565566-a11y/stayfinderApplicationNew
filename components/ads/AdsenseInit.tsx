'use client';

import { useEffect } from 'react';

/**
 * Client component that initialises Google Auto Ads.
 * Must be a Client Component because it uses useEffect + window.
 * Placed in layout.tsx body — runs once on every page.
 */
export default function AdsenseInit() {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
        google_ad_client: 'ca-pub-6171735174915662',
        enable_page_level_ads: true,
        overlays: { bottom: true },
      });
    } catch (e) {
      // Silent — script may not be loaded yet
    }
  }, []);

  return null;
}
