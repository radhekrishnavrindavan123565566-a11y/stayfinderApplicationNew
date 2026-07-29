/**
 * Google AdSense Configuration & Helper Functions
 */

export const ADSENSE_CONFIG = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
  enabled: !!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
};

// Ad slot configurations
export const AD_SLOTS = {
  // Homepage banner ads
  homeHorizontal: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_HORIZONTAL || '',
    format: 'auto',
    responsive: true,
  },
  
  // Property listing sidebar ads
  propertyListSidebar: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PROPERTY_SIDEBAR || '',
    format: 'vertical',
    width: 300,
    height: 600,
  },
  
  // Property detail page ads
  propertyDetailTop: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PROPERTY_DETAIL_TOP || '',
    format: 'auto',
    responsive: true,
  },
  
  propertyDetailBottom: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PROPERTY_DETAIL_BOTTOM || '',
    format: 'auto',
    responsive: true,
  },
  
  // Dashboard ads
  dashboardSidebar: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD_SIDEBAR || '',
    format: 'vertical',
    width: 300,
    height: 600,
  },
  
  // Search results page ads
  searchResults: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SEARCH_RESULTS || '',
    format: 'horizontal',
    width: 728,
    height: 90,
  },
  
  // In-article ads
  inArticle: {
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE || '',
    format: 'in-article',
    responsive: true,
  },
};

/**
 * Check if AdSense is configured and enabled
 */
export function isAdSenseEnabled(): boolean {
  return ADSENSE_CONFIG.enabled;
}

/**
 * Get AdSense script initialization
 */
export function getAdSenseScript(): string {
  if (!isAdSenseEnabled()) {
    return '';
  }
  
  return `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}"
      crossorigin="anonymous"></script>
  `;
}

/**
 * Initialize AdSense ads (call after ads are rendered)
 */
export function initializeAds(): void {
  if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense initialization error:', e);
    }
  }
}

/**
 * Log ad impressions for analytics
 */
export function logAdImpression(slotName: string, slotId: string): void {
  if (typeof window !== 'undefined') {
    console.log(`[AdSense] Ad impression: ${slotName} (${slotId})`);
    
    // You can send this to your analytics service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'ad_impression', {
        ad_slot: slotName,
        ad_slot_id: slotId,
      });
    }
  }
}
