import Stripe from "stripe";
import type { Plan } from "@/lib/usage";

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (client) return client;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env (see .env.example)."
    );
  }
  client = new Stripe(apiKey);
  return client;
}

export const STRIPE_PRICE_IDS: Partial<Record<"PRO" | "BUSINESS", string>> = {
  PRO: process.env.STRIPE_PRICE_ID_PRO,
  BUSINESS: process.env.STRIPE_PRICE_ID_BUSINESS,
};

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (priceId && priceId === STRIPE_PRICE_IDS.PRO) return "PRO";
  if (priceId && priceId === STRIPE_PRICE_IDS.BUSINESS) return "BUSINESS";
  return "FREE";
}

export function getAppUrl(requestUrl: string): string {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(requestUrl).origin;
}

/** Subscription item's `current_period_end` (Stripe moved this off the subscription root). */
export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Date | null {
  const seconds = subscription.items.data[0]?.current_period_end;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}
