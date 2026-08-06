import { NextResponse } from "next/server";
import { listProducts, listVariants } from "@lemonsqueezy/lemonsqueezy.js";
import { getAdminSession } from "@/lib/admin";
import { CHECKOUT_TIERS, configureLemonSqueezy, getVariantId } from "@/lib/lemonsqueezy";
import { getPricingTier } from "@/lib/goalify/pricing";

// Owner-only: lists every real variant Lemon Squeezy actually has for this
// store, and cross-checks each of our CHECKOUT_TIERS env vars against that
// list — a 404 from createCheckout (see api/checkout/route.ts) means the
// configured variant id simply doesn't exist / doesn't belong to this store
// anymore (recreated, deleted, or copy-pasted from the wrong store), and the
// fastest way to fix that is seeing the real ids side by side with what's
// configured, rather than guessing.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    return NextResponse.json({ error: "LEMONSQUEEZY_STORE_ID is not set." }, { status: 200 });
  }

  configureLemonSqueezy();

  const productsResult = await listProducts({ filter: { storeId } });
  if (productsResult.error || !productsResult.data) {
    return NextResponse.json(
      { error: productsResult.error?.message || "Could not list products." },
      { status: 200 },
    );
  }

  const products = productsResult.data.data;
  const variantLists = await Promise.all(
    products.map((product) => listVariants({ filter: { productId: product.id } })),
  );

  const variants = products.flatMap((product, index) => {
    const result = variantLists[index];
    if (result.error || !result.data) return [];
    return result.data.data.map((variant) => ({
      variantId: variant.id,
      variantName: variant.attributes.name,
      productName: product.attributes.name,
      status: variant.attributes.status,
      priceCents: variant.attributes.price,
      interval: variant.attributes.interval,
      intervalCount: variant.attributes.interval_count,
    }));
  });

  // For each tier, does the currently configured env var point at a variant
  // that actually exists in this list? And if not, is there a published
  // variant whose price matches what pricing.ts expects — a likely intended
  // match, offered as a hint only (the checkout route's own preview-based
  // price check is still what actually gates checkout, not this guess).
  const tierChecks = CHECKOUT_TIERS.map((tier) => {
    const configuredId = getVariantId(tier);
    const expectedCents = getPricingTier(tier).priceCents;
    const foundConfigured = variants.find((v) => v.variantId === configuredId);
    const suggestion = variants.find(
      (v) => v.status === "published" && v.priceCents === expectedCents,
    );
    return {
      tier,
      label: getPricingTier(tier).label,
      configuredId: configuredId ?? null,
      expectedCents,
      existsInStore: Boolean(foundConfigured),
      suggestion:
        !foundConfigured && suggestion
          ? { variantId: suggestion.variantId, variantName: suggestion.variantName }
          : null,
    };
  });

  return NextResponse.json({ variants, tierChecks });
}
