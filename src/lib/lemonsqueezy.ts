import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import type { CheckoutTier } from "@/lib/goalify/pricing";

export { CHECKOUT_TIERS } from "@/lib/goalify/pricing";
export type { CheckoutTier } from "@/lib/goalify/pricing";

/** One real Lemon Squeezy variant per pricing tier — see paywall.tsx for
 * the matching price copy shown to the user before checkout. */
const VARIANT_ENV_KEYS: Record<CheckoutTier, string> = {
  monthly: "LEMONSQUEEZY_VARIANT_ID_MONTHLY",
  quarterly: "LEMONSQUEEZY_VARIANT_ID_QUARTERLY",
  annual: "LEMONSQUEEZY_VARIANT_ID_ANNUAL",
};

/**
 * Falls back to one shared `LEMONSQUEEZY_VARIANT_ID` when a tier doesn't
 * have its own dedicated variant env var set — lets checkout go live off a
 * single configured Lemon Squeezy variant before the other two exist.
 * A variant has exactly one real price, though: the checkout route's
 * price-match check (see api/checkout/route.ts) still compares that price
 * against each tier's advertised price, so only the tier whose price
 * actually equals the shared variant's real price will clear checkout —
 * the other two correctly keep failing closed rather than charging a
 * customer something other than what the paywall showed them.
 */
export function getVariantId(tier: CheckoutTier): string | undefined {
  return process.env[VARIANT_ENV_KEYS[tier]] || process.env.LEMONSQUEEZY_VARIANT_ID;
}

let configured = false;

/** Idempotent — safe to call at the top of every request handler that
 * needs the SDK. `lemonSqueezySetup` itself just stores the API key in a
 * module-level singleton inside the SDK, so repeating the call is cheap. */
export function configureLemonSqueezy() {
  if (configured) return;
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => console.error("[lemonsqueezy]", error.message),
  });
  configured = true;
}
