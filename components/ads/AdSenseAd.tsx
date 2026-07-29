'use client';

import { useEffect } from 'react';
import { isAdSenseEnabled, initializeAds, logAdImpression } from '@/lib/adsense';

interface AdSenseAdProps {
  slotId: string;
  slotName: string;
  format?: 'auto' | 'vertical' | 'horizontal' | 'in-article' | 'native';
  width?: number;
  height?: number;
  responsive?: boolean;
  className?: string;
}

export default function AdSenseAd({
  slotId,
  slotName,
  format = 'auto',
  width,
  height,
  responsive = true,
  className = '',
}: AdSenseAdProps) {
  useEffect(() => {
    if (!isAdSenseEnabled() || !slotId) {
      return;
    }

    // Initialize ads
    initializeAds();
    
    // Log impression
    logAdImpression(slotName, slotId);
  }, [slotId, slotName]);

  // Don't render if AdSense is not enabled
  if (!isAdSenseEnabled() || !slotId) {
    return (
      <div className={`bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>
        [Ad Space - Enable Google AdSense]
      </div>
    );
  }

  // Calculate container dimensions
  const containerStyle: React.CSSProperties = {
    minHeight: height ? `${height}px` : 'auto',
    ...(width ? { width: `${width}px`, minWidth: `${width}px` } : { width: '100%' }),
  };

  return (
    <div className={`adsense-container ${className}`} style={containerStyle}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...(responsive ? {} : { width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }),
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
