'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string; // Make alt required for SEO
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

/**
 * SEO-optimized Image component with:
 * - Proper alt text (required)
 * - Lazy loading by default
 * - Error handling with fallback
 * - Responsive sizes
 * - WebP support
 */
export default function OptimizedImage({
  alt,
  fallbackSrc,
  loading = 'lazy',
  className,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(props.src);
  const [hasError, setHasError] = useState(false);

  const handleError = (error: any) => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    if (onError) {
      onError(error);
    }
  };

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt} // SEO: Always include meaningful alt text
      loading={loading}
      onError={handleError}
      className={clsx('object-cover', className)}
      // Set default responsive sizes if not provided
      sizes={props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      // Improved quality
      quality={85}
    />
  );
}

/**
 * Hero Image component optimized for SEO and performance
 */
export function HeroImage({
  src,
  alt,
  title,
  description,
}: {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}) {
  return (
    <figure className="relative w-full h-auto">
      <OptimizedImage
        src={src}
        alt={alt}
        width={1200}
        height={630}
        priority // Hero images should be eager loaded
        className="w-full h-auto"
      />
      {(title || description) && (
        <figcaption className="sr-only">
          {title && <strong>{title}</strong>}
          {description && <p>{description}</p>}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Product/Listing Image with schema data
 */
export function ListingImage({
  src,
  alt,
  productName,
  productPrice,
}: {
  src: string;
  alt: string;
  productName?: string;
  productPrice?: number;
}) {
  return (
    <figure className="relative">
      <OptimizedImage
        src={src}
        alt={alt}
        width={400}
        height={300}
        className="rounded-lg"
      />
      {productName && (
        <figcaption className="text-sm text-gray-600 mt-2">
          {productName}
          {productPrice && <span className="ml-2 font-semibold">₹{productPrice}</span>}
        </figcaption>
      )}
    </figure>
  );
}
