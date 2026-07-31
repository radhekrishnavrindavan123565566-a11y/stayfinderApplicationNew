'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface WebVitals {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Track and report Core Web Vitals to Google Analytics
 */
export function useWebVitals(callback?: (vitals: WebVitals) => void) {
  useEffect(() => {
    const handleVitals = (metric: WebVitals) => {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Call custom callback if provided
      if (callback) {
        callback(metric);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
        });
      }
    };

    // Track all Core Web Vitals
    getCLS(handleVitals);
    getFID(handleVitals);
    getFCP(handleVitals);
    getLCP(handleVitals);
    getTTFB(handleVitals);
  }, [callback]);
}
