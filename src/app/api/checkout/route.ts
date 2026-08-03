import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CHECKOUT_TIERS, configureLemonSqueezy, getVariantId } from "@/lib/lemonsqueezy";

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
  });

  if (result.error || !result.data) {
    console.error("[checkout] Lemon Squeezy createCheckout failed:", result.error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: result.data.data.attributes.url });
}
