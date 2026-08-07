/**
 * Single source of truth for what each plan actually costs — both the
 * paywall's display copy and the checkout route's price-match safety check
 * (see api/checkout/route.ts) read from here, so the number a user sees can
 * never drift out of sync with the number this app expects Lemon Squeezy to
 * charge. Whether Lemon Squeezy's own variant is actually *configured* to
 * that price is a separate, real-world step — see .env.example.
 */
export const CHECKOUT_TIERS = ["monthly", "quarterly", "annual"] as const;
export type CheckoutTier = (typeof CHECKOUT_TIERS)[number];

export type PricingTier = {
  id: CheckoutTier;
  label: string;
  /** What Lemon Squeezy must actually charge, in whole cents. */
  priceCents: number;
  /** Strikethrough anchor price, in cents — the cost of paying the monthly
   * rate for this tier's period, used only to compute the "SAVE %" badge. */
  wasCents: number;
  billedLabel: string;
  badge?: string;
  popular?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "monthly",
    label: "1 Month",
    priceCents: 1999,
    wasCents: 2499,
    billedLabel: "billed monthly",
  },
  {
    id: "quarterly",
    label: "3 Months",
    // $29.99 flat for 3 months — the total Lemon Squeezy must actually charge
    // (matches the real configured price of variant 1989656).
    priceCents: 2999,
    wasCents: 5999,
    billedLabel: "billed every 3 months",
    badge: "MOST POPULAR",
    popular: true,
  },
  {
    id: "annual",
    label: "12 Months",
    priceCents: 3999,
    wasCents: 23999,
    billedLabel: "billed annually",
    badge: "BEST VALUE",
  },
];

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function getPricingTier(tier: CheckoutTier): PricingTier {
  const found = PRICING_TIERS.find((t) => t.id === tier);
  if (!found) throw new Error(`Unknown checkout tier "${tier}".`);
  return found;
}
