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
  /** Same price, divided out to a per-week figure for the card's headline
   * number — derived, not a separate source of truth. */
  perWeek: number;
  /** Strikethrough anchor price, in cents — the cost of paying the monthly
   * rate for this tier's period, used only to compute the "SAVE %" badge. */
  wasCents: number;
  billedLabel: string;
  badge?: string;
  popular?: boolean;
};

const WEEKS_PER_MONTH = 52 / 12;
const WEEKS_PER_QUARTER = 52 / 4;
const WEEKS_PER_YEAR = 52;

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "monthly",
    label: "1 Month",
    priceCents: 1999,
    perWeek: 19.99 / WEEKS_PER_MONTH,
    wasCents: 2499,
    billedLabel: "billed monthly",
  },
  {
    id: "quarterly",
    label: "3 Months",
    // $29.99 flat for 3 months — the total Lemon Squeezy must actually charge
    // (matches the real configured price of variant 1989656).
    priceCents: 2999,
    perWeek: 29.99 / WEEKS_PER_QUARTER,
    wasCents: 5999,
    billedLabel: "billed every 3 months",
    badge: "MOST POPULAR",
    popular: true,
  },
  {
    id: "annual",
    label: "12 Months",
    priceCents: 3999,
    perWeek: 39.99 / WEEKS_PER_YEAR,
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
