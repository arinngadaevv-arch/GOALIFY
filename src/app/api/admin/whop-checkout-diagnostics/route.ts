import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { CHECKOUT_TIERS, getWhopPlanId } from "@/lib/whop";
import { getPricingTier } from "@/lib/goalify/pricing";

/**
 * Owner-only: runs the exact same checkout_configurations call
 * api/checkout/whop/route.ts makes on a real purchase, for every tier, and
 * returns Whop's raw response/error instead of the generic message the
 * paywall shows — the fastest way to see *why* checkout is failing without
 * needing access to Vercel's function logs (which this app has no way to
 * read directly). Each call creates a real (but never visited/paid) Whop
 * checkout configuration, tagged `metadata.diagnostic: true` so it's
 * identifiable as a test if it ever shows up in the Whop dashboard — there
 * is no confirmed Whop equivalent of Lemon Squeezy's `preview: true`
 * dry-run mode.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "WHOP_API_KEY is not set." }, { status: 200 });
  }

  const results = await Promise.all(
    CHECKOUT_TIERS.map(async (tier) => {
      const label = getPricingTier(tier).label;
      const planId = getWhopPlanId(tier);
      if (!planId) {
        return {
          tier,
          label,
          planId: null,
          ok: false,
          error: "No plan id env var set for this tier (see lib/whop.ts).",
        };
      }

      try {
        const res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_id: planId,
            metadata: { diagnostic: true },
          }),
        });
        const body = await res.json().catch(() => null);

        if (!res.ok || !body?.purchase_url) {
          return {
            tier,
            label,
            planId,
            ok: false,
            statusCode: res.status,
            error:
              body?.error ?? body?.message ?? `Whop returned ${res.status} with no purchase_url.`,
            raw: body ? JSON.stringify(body) : undefined,
          };
        }

        return { tier, label, planId, ok: true, purchaseUrl: body.purchase_url as string };
      } catch (err) {
        return {
          tier,
          label,
          planId,
          ok: false,
          error: err instanceof Error ? err.message : "Request to Whop failed.",
        };
      }
    }),
  );

  return NextResponse.json({ results });
}
