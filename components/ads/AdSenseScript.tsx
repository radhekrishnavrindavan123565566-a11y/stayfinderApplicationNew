'use client';

import { useEffect } from 'react';
import { ADSENSE_CONFIG, isAdSenseEnabled } from '@/lib/adsense';

/**
 * AdSense Script Component
 * Add this to your layout to enable Google AdSense
 * Must be placed in a client component
 */
export default function AdSenseScript() {
  useEffect(() => {
    if (!isAdSenseEnabled()) {
      return;
    }

    // Create script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    script.crossOrigin = 'anonymous';

    // Append to document head
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
