/**
 * Inline SVG data-URI fallbacks.
 * Use these instead of any external placeholder service (via.placeholder.com, etc.)
 * They are always available, never blocked by CSP, and have zero latency.
 *
 * Usage:
 *   import { AVATAR_FALLBACK, PROPERTY_FALLBACK, BANNER_FALLBACK } from '@/lib/imageFallbacks';
 *   <Image src={user.avatar || AVATAR_FALLBACK} ... />
 */

/** Generic user avatar — initials-style grey circle */
export const AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' rx='75' fill='%23e4e4e7'/%3E%3Ctext x='75' y='95' text-anchor='middle' font-size='60' font-family='system-ui' fill='%2371717a'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

/** Property / listing image placeholder */
export const PROPERTY_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23f4f4f5'/%3E%3Ctext x='400' y='260' text-anchor='middle' font-size='64' font-family='system-ui' fill='%23a1a1aa'%3E%F0%9F%8F%A0%3C/text%3E%3Ctext x='400' y='320' text-anchor='middle' font-size='18' font-family='system-ui' fill='%23a1a1aa'%3ENo image%3C/text%3E%3C/svg%3E";

/** Banner / hero image placeholder */
export const BANNER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400' viewBox='0 0 1200 400'%3E%3Crect width='1200' height='400' fill='%23e4e4e7'/%3E%3Ctext x='600' y='210' text-anchor='middle' font-size='24' font-family='system-ui' fill='%2371717a'%3EBanner Image%3C/text%3E%3C/svg%3E";

/**
 * Returns a safe img src — uses the provided url if non-empty,
 * otherwise returns the given fallback data-URI.
 */
export function safeImgSrc(url: string | null | undefined, fallback: string): string {
  if (!url || url.trim() === "") return fallback;
  // Block known external placeholder services — replace with inline fallback
  if (
    url.includes("via.placeholder.com") ||
    url.includes("placehold.co") ||
    url.includes("dummyimage.com") ||
    url.includes("picsum.photos") ||
    url.includes("placeholder.com")
  ) {
    return fallback;
  }
  return url;
}
