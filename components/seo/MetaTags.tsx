'use client';

/**
 * Dynamic meta tags component for client-side rendered content
 * This helps with social sharing and dynamic pages
 */
export function updateMetaTags(props: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  // Update title
  if (props.title) {
    document.title = props.title;
  }

  // Update meta description
  if (props.description) {
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', props.description);
    }
  }

  // Update OG tags
  if (props.image) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', props.image);
    }
  }

  if (props.url) {
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', props.url);
    }
  }
}

/**
 * Get current page meta information
 */
export function getPageMetaTags(): {
  title: string;
  description: string;
  image: string;
  url: string;
} {
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    url: window.location.href,
  };
}
