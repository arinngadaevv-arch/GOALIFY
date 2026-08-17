/**
 * Turns a browser `Referer` header + a landing URL's query string into a
 * short, human-readable "how did they find us" label — Instagram, TikTok,
 * a Google search, a paid campaign someone tagged with `?utm_source=...`,
 * or a direct/typed visit. Runs at the very edge (proxy.ts) on a visitor's
 * first-ever request, so it has to be plain string logic — no DOM, no
 * Node-only APIs.
 */

const KNOWN_HOSTS: Record<string, string> = {
  "instagram.com": "instagram",
  "l.instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "vt.tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
  "facebook.com": "facebook",
  "m.facebook.com": "facebook",
  "l.facebook.com": "facebook",
  "lm.facebook.com": "facebook",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "twitter.com": "twitter_x",
  "x.com": "x",
  "t.co": "twitter_x",
  "reddit.com": "reddit",
  "linkedin.com": "linkedin",
  "whatsapp.com": "whatsapp",
  "wa.me": "whatsapp",
  "bing.com": "bing_search",
  "duckduckgo.com": "duckduckgo_search",
  "yahoo.com": "yahoo_search",
};

/** Sanitized to a short, safe slug — this ends up stored and rendered
 * verbatim in the admin table, so it's never trusted as-is even though it
 * only ever comes from a URL param a visitor's own link controls. */
function sanitize(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

function hostLabel(hostname: string): string {
  const bare = hostname.replace(/^(www|m|l)\./, "");
  if (KNOWN_HOSTS[bare]) return KNOWN_HOSTS[bare];
  if (bare.startsWith("google.")) return "google_search";
  return sanitize(bare) || "other";
}

export function resolveTrafficSource(
  referrer: string | null,
  searchParams: URLSearchParams,
): string {
  const utmSource = searchParams.get("utm_source");
  if (utmSource) {
    const clean = sanitize(utmSource);
    if (clean) return clean;
  }

  if (!referrer) return "direct";

  try {
    const referrerUrl = new URL(referrer);
    return hostLabel(referrerUrl.hostname);
  } catch {
    return "direct";
  }
}
