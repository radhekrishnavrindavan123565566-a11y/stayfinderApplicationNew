/**
 * Returns the correct app base URL for both dev and production.
 * On Vercel, VERCEL_URL is automatically set to the deployment URL.
 * NEXT_PUBLIC_APP_URL takes priority if explicitly set.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8080";
}
