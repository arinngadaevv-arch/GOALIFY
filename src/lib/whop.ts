import type { CheckoutTier } from "@/lib/goalify/pricing";

export { CHECKOUT_TIERS } from "@/lib/goalify/pricing";
export type { CheckoutTier } from "@/lib/goalify/pricing";

/** One real Whop plan per pricing tier — see paywall.tsx for the matching
 * price copy shown to the user before checkout. Mirrors getVariantId in
 * lib/lemonsqueezy.ts exactly. */
const PLAN_ENV_KEYS: Record<CheckoutTier, string> = {
  monthly: "WHOP_PLAN_ID_MONTHLY",
  quarterly: "WHOP_PLAN_ID_QUARTERLY",
  annual: "WHOP_PLAN_ID_ANNUAL",
};

/**
 * Falls back to one shared `WHOP_PLAN_ID` when a tier doesn't have its own
 * dedicated plan env var set — lets checkout go live off a single
 * configured Whop plan before the other two exist. Unlike
 * lib/lemonsqueezy.ts's getVariantId, there's no price-match safety check
 * here: this app can read a Lemon Squeezy variant's real configured price
 * back via its checkout preview API and refuse to proceed on a mismatch,
 * but no equivalent "retrieve this plan's real price" call is wired in for
 * Whop (see api/checkout/whop/route.ts) — so a shared fallback plan id
 * silently charges whatever that ONE plan is actually configured to charge
 * for all three tiers, not just the one whose advertised price happens to
 * match. Set all three tier-specific env vars before relying on this in
 * production; the shared fallback is only meant to get one tier working
 * first, the same way it does for Lemon Squeezy.
 */
export function getWhopPlanId(tier: CheckoutTier): string | undefined {
  return (process.env[PLAN_ENV_KEYS[tier]] || process.env.WHOP_PLAN_ID)?.trim() || undefined;
}

/**
 * Trimmed for the same reason getWhopCompanyId is — a copy-paste from the
 * Whop dashboard picking up a trailing newline or leading space is
 * invisible in Vercel's env var UI but makes the literal header value
 * "Bearer sk_abc123\n", which Whop's API correctly rejects with 401
 * unauthorized ("Authentication failed") even though the key looks
 * completely correct on screen. If /admin's diagnostic ever shows exactly
 * that 401 with all pills green, re-copying the key fresh — select-and-copy
 * only the key itself, no surrounding whitespace or the newline a
 * triple-click sometimes grabs — is the fix; this trim only guards against
 * the whitespace half of that, not a genuinely wrong or revoked key.
 */
export function getWhopApiKey(): string | undefined {
  return process.env.WHOP_API_KEY?.trim() || undefined;
}

/**
 * Optional — multiple independent sources on Whop's checkout_configurations
 * endpoint describe `company_id` as required, even when reusing an existing
 * plan via `plan_id` rather than creating one inline, but this couldn't be
 * confirmed against Whop's own docs (blocked from this sandbox's network).
 * Included in the request body when set (see api/checkout/whop/route.ts)
 * without being required to start checkout — a 422 naming a missing
 * company_id despite everything else being configured is the signal this
 * needs to actually be set. Whop dashboard: the "biz_..." segment of your
 * dashboard URL.
 */
export function getWhopCompanyId(): string | undefined {
  return process.env.WHOP_COMPANY_ID?.trim() || undefined;
}

/**
 * Whop runs entirely separate hosts and credentials for sandbox vs.
 * production (per Whop's own docs, referenced from multiple independent
 * sources — this sandbox's network can't reach docs.whop.com to confirm
 * byte-for-byte): `api.whop.com` for live "Company API keys", a distinct
 * `sandbox-api.whop.com` for keys created in Whop's test/sandbox
 * environment. A key from one host is simply invalid on the other — that
 * failure looks identical to a bad/revoked key (401 "Authentication
 * failed") from the caller's side, and unlike a whitespace or header-format
 * bug, it fails every single tier identically, since the host mismatch
 * has nothing to do with which plan is being requested.
 *
 * Defaults to the production host, matching this route's behavior before
 * this existed. Set WHOP_SANDBOX=true only if WHOP_API_KEY was actually
 * created in Whop's sandbox environment.
 */
export function getWhopApiBaseUrl(): string {
  return process.env.WHOP_SANDBOX?.trim().toLowerCase() === "true"
    ? "https://sandbox-api.whop.com/api/v1"
    : "https://api.whop.com/api/v1";
}
