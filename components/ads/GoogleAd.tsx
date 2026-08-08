'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  slot: string;                          // Ad unit slot ID from AdSense
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const PUBLISHER_ID = 'ca-pub-6171735174915662';

export default function GoogleAd({
  slot,
  format = 'auto',
  responsive = true,
  style,
  className = '',
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only run once per mount
    if (initialized.current) return;
    initialized.current = true;

    try {
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch (e) {
      // AdSense not loaded yet — silently fail
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ minHeight: 90, ...style }}
      >
        📢 Ad placeholder (slot: {slot})
      </div>
    );
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// ─── Pre-built ad sizes for common placements ───────────────────────────────

/** Banner ad — top/bottom of page */
export function BannerAd({ slot, className }: { slot: string; className?: string }) {
  return (
    <GoogleAd
      slot={slot}
      format="horizontal"
      responsive
      className={className}
      style={{ minHeight: 90 }}
    />
  );
}

/** Rectangle ad — sidebar or in-content */
export function RectangleAd({ slot, className }: { slot: string; className?: string }) {
  return (
    <GoogleAd
      slot={slot}
      format="rectangle"
      responsive
      className={className}
      style={{ minHeight: 250 }}
    />
  );
}

/** In-feed / in-article ad */
export function InArticleAd({ slot, className }: { slot: string; className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <p className="text-[10px] text-gray-400 text-center mb-1">Advertisement</p>
      <GoogleAd
        slot={slot}
        format="auto"
        responsive
        style={{ minHeight: 100 }}
      />
    </div>
  );
}

/** Sticky bottom ad — mobile friendly */
export function StickyBottomAd({ slot }: { slot: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="max-w-screen-sm mx-auto px-2 py-1">
        <p className="text-[9px] text-gray-400 text-center">Advertisement</p>
        <GoogleAd slot={slot} format="horizontal" responsive style={{ minHeight: 50 }} />
      </div>
    </div>
  );
}
