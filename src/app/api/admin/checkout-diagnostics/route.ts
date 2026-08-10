import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { getAdminSession } from "@/lib/admin";
import { CHECKOUT_TIERS, configureLemonSqueezy, getVariantId } from "@/lib/lemonsqueezy";
import { getPricingTier } from "@/lib/goalify/pricing";

// Owner-only: runs the exact same createCheckout() call api/checkout/route.ts
// makes on a real purchase, for every tier, and returns Lemon Squeezy's raw
// error detail instead of the generic message the paywall shows — the
// fastest way to see *why* checkout is failing without needing access to
// hosting logs. preview:true means this never requires anyone to actually
// pay; an unused Lemon Squeezy checkout object just expires on its own.
export async function GET() {
  const session = await getAdminSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const email = session.user.email;

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    return NextResponse.json({ error: "LEMONSQUEEZY_STORE_ID is not set." }, { status: 200 });
  }

  configureLemonSqueezy();

  // createCheckout() normally returns { error } rather than throwing for
  // ordinary API failures (bad variant, auth, etc. — handled per-tier
  // below), but this whole handler has no guarantee against something
  // throwing for real (a network-level failure, or the SDK itself hitting
  // an unexpected condition). Without this, an uncaught exception here
  // means Next.js serves its own generic error response instead of JSON —
  // the client's res.json() then fails to parse it, and the diagnostic
  // panel shows a flat "Diagnostic request failed." with none of the
  // actual detail this endpoint exists to surface.
  try {
    const results = await Promise.all(
      CHECKOUT_TIERS.map(async (tier) => {
        const label = getPricingTier(tier).label;
        const expectedCents = getPricingTier(tier).priceCents;
        const variantId = getVariantId(tier);
        if (!variantId) {
          return {
            tier,
            label,
            variantId: null,
            ok: false,
            expectedCents,
            error: "No variant id env var set for this tier.",
          };
        }

        try {
          const result = await createCheckout(storeId, variantId, {
            checkoutData: { email },
            preview: true,
          });

          if (result.error || !result.data) {
            return {
              tier,
              label,
              variantId,
              ok: false,
              expectedCents,
              statusCode: result.statusCode,
              error: result.error?.message || "Unknown error.",
              cause: result.error?.cause ? JSON.stringify(result.error.cause) : undefined,
            };
          }

          const actualCents = result.data.data.attributes.preview?.subtotal ?? null;
          return {
            tier,
            label,
            variantId,
            ok: actualCents === expectedCents,
            expectedCents,
            actualCents,
          };
        } catch (err) {
          // A per-tier throw (rather than an SDK-returned error) — caught
          // here so one bad tier doesn't take down the whole Promise.all
          // and hide the other two tiers' results.
          return {
            tier,
            label,
            variantId,
            ok: false,
            expectedCents,
            error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
          };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[checkout-diagnostics] Unexpected failure:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `${err.name}: ${err.message}`
            : "Unexpected error running diagnostics.",
      },
      { status: 500 },
    );
  }
}
