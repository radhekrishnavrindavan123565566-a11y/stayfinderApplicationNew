'use client';

/**
 * SafeImage — a drop-in wrapper around next/image that:
 *  1. Shows an inline SVG fallback instead of a broken image when the URL
 *     is from an un-allowed hostname (the error Next.js throws in the console).
 *  2. Falls back gracefully when `src` is empty / null / undefined.
 *  3. Renders a plain <img> tag for data-URIs and relative /public paths
 *     (next/image doesn't optimise those anyway).
 *
 * Use exactly like next/image — same props are supported.
 *
 * <SafeImage src={user.avatar} alt="avatar" width={48} height={48} className="rounded-full object-cover" />
 */

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { AVATAR_FALLBACK, PROPERTY_FALLBACK, safeImgSrc } from '@/lib/imageFallbacks';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  /** Which built-in fallback to use when src is empty or errors. Default: 'property' */
  fallbackType?: 'avatar' | 'property' | 'banner';
  /** Override the fallback with any custom src string. */
  fallbackSrc?: string;
};

// Hosts that ARE allowed in next.config.js remotePatterns
const ALLOWED_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'res.cloudinary.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'avatars.githubusercontent.com',
  'ssthomesolutions.com',
  'www.ssthomesolutions.com',
]);

function isAllowedRemote(src: string): boolean {
  try {
    const url = new URL(src);
    // Allow wildcards: **.cloudinary.com, **.amazonaws.com, **.supabase.co
    if (url.hostname.endsWith('.cloudinary.com')) return true;
    if (url.hostname.endsWith('.amazonaws.com'))  return true;
    if (url.hostname.endsWith('.supabase.co'))    return true;
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false; // relative path or data-URI — handled separately
  }
}

export default function SafeImage({
  src,
  alt,
  fallbackType = 'property',
  fallbackSrc,
  ...props
}: SafeImageProps) {
  const builtInFallback =
    fallbackSrc ??
    (fallbackType === 'avatar' ? AVATAR_FALLBACK : PROPERTY_FALLBACK);

  // Resolve actual src
  const resolvedSrc = safeImgSrc(src, builtInFallback);

  const [errored, setErrored] = useState(false);
  const displaySrc = errored ? builtInFallback : resolvedSrc;

  // Data URIs and relative paths: use plain <img> — next/image can't optimise them
  if (
    displaySrc.startsWith('data:') ||
    displaySrc.startsWith('/') ||
    displaySrc.startsWith('./')
  ) {
    const { fill, width, height, sizes, priority, quality, ...rest } = props as any;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt as string}
        style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : { width, height }}
        onError={() => setErrored(true)}
        {...rest}
      />
    );
  }

  // External URL not in allowlist → use plain <img> with onError fallback
  if (!isAllowedRemote(displaySrc)) {
    const { fill, width, height, sizes, priority, quality, ...rest } = props as any;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displaySrc}
        alt={alt as string}
        style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : { width, height }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = builtInFallback;
        }}
        {...rest}
      />
    );
  }

  // Allowed external URL → next/image with onError fallback
  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      onError={() => setErrored(true)}
    />
  );
}
