'use client';

import { useEffect } from 'react';

/**
 * Client component that initializes Google AdSense.
 * Must be a Client Component because it uses useEffect + window.
 * Placed in layout.tsx body — runs once on every page.
 */
export default function AdsenseInit() {
  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6171735174915662';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    // Initialize Auto Ads
    script.onload = () => {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
          google_ad_client: 'ca-pub-6171735174915662',
          enable_page_level_ads: true,
          overlays: { bottom: true },
        });
      } catch (e) {
        // AdSense not ready, retry on next attempt
      }
    };

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
