'use client';

import { useEffect } from 'react';

/**
 * Place this component anywhere you want Google Auto Ads to appear.
 * Auto Ads will automatically insert ads in the best positions.
 */
export default function AdsenseAutoAd() {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({
          google_ad_client: 'ca-pub-6171735174915662',
          enable_page_level_ads: true,
        });
      }
    } catch (e) {
      // Silent fail
    }
  }, []);

  return null; // No visible element needed — Google injects ads automatically
}
