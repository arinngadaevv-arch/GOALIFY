import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CHECKOUT_TIERS, configureLemonSqueezy, getVariantId } from "@/lib/lemonsqueezy";
import { getPricingTier } from "@/lib/goalify/pricing";

// Creates a real, hosted Lemon Squeezy checkout for the signed-in user and
// hands the URL back to the client to redirect to — no local "purchase" is
// ever recorded here. The only place a checkout becomes a real, credited
// order is the `order_created` webhook (see api/webhooks/lemonsqueezy),
// which is the one thing that actually runs after money moves.
const checkoutSchema = z.object({
  tier: z.enum(CHECKOUT_TIERS),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = getVariantId(parsed.data.tier);
  if (!storeId || !variantId) {
    console.error(
      `[checkout] Lemon Squeezy isn't configured for tier "${parsed.data.tier}" — missing LEMONSQUEEZY_STORE_ID or its variant id env var.`
    );
    return NextResponse.json(
      { error: "Checkout isn't available right now. Please try again shortly." },
      { status: 503 }
    );
  }

  configureLemonSqueezy();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const result = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: session.user.email,
      name: session.user.name ?? undefined,
      // Echoed back verbatim in the webhook's meta.custom_data — this is
      // how the webhook knows which GOALIFY account to credit, since
      // Lemon Squeezy's own customer record is keyed by email, not our id.
      custom: { userId: session.user.id, tier: parsed.data.tier },
    },
    productOptions: {
      redirectUrl: `${appUrl}/success`,
    },
    // Pulls back a `preview` block (subtotal/tax/total for this exact
    // variant) without requiring a billing address — this is what makes the
    // price-match check below possible at all.
    preview: true,
  });

  if (result.error || !result.data) {
    console.error("[checkout] Lemon Squeezy createCheckout failed:", result.error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  // The one guarantee this whole flow depends on: the price the paywall
  // advertised for this tier and the price the configured Lemon Squeezy
  // variant will actually charge must be the exact same number. Comparing
  // `preview.subtotal` (pre-tax, matches what we advertise) rather than
  // `preview.total` (which folds in tax) avoids a false mismatch for a
  // customer whose region adds tax at checkout. A real mismatch here means
  // the variant's price was changed or misconfigured in the Lemon Squeezy
  // dashboard without updating PRICING_TIERS (or vice versa) — refusing to
  // send the user to checkout is the only acceptable response, since
  // showing $19.99 and silently charging something else is exactly the
  // failure this check exists to catch.
  const expectedCents = getPricingTier(parsed.data.tier).priceCents;
  const actualCents = result.data.data.attributes.preview?.subtotal;
  if (actualCents !== expectedCents) {
    console.error(
      `[checkout] Price mismatch for tier "${parsed.data.tier}": PRICING_TIERS ` +
        `expects ${expectedCents}¢ but the Lemon Squeezy variant (${variantId}) ` +
        `is configured to charge ${actualCents ?? "unknown"}¢. Refusing to start ` +
        `checkout — fix the variant's price in the Lemon Squeezy dashboard (or ` +
        `update src/lib/goalify/pricing.ts if the variant is actually correct) ` +
        `before this tier can be purchased again.`
    );
    return NextResponse.json(
      { error: "This plan isn't available right now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: result.data.data.attributes.url });
}
