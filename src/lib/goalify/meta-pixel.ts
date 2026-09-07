/**
 * Thin wrapper around the Meta Pixel's global `fbq`, loaded by the base
 * snippet in the root layout (see app/(goalify)/layout.tsx) — that snippet
 * only renders when NEXT_PUBLIC_META_PIXEL_ID is set, so every call here
 * is a no-op (not an error) in any environment without a pixel configured,
 * including local dev and preview deploys that don't set the env var.
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, string | number>,
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}
