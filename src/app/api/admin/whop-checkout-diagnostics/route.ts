import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { CHECKOUT_TIERS, getWhopCompanyId, getWhopPlanId } from "@/lib/whop";
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

  try {
    const results = await runDiagnostics(apiKey);
    return NextResponse.json({ results });
  } catch (err) {
    // Every per-tier failure is already caught inside runDiagnostics — this
    // is the outer safety net for anything else (a throw from
    // getPricingTier/getWhopPlanId, Promise.all itself, etc.). Without it,
    // an uncaught exception here means Next.js serves its own generic error
    // response instead of JSON, the client's res.json() fails to parse it,
    // and the diagnostic panel shows a flat "Diagnostic request failed."
    // with none of the actual detail this endpoint exists to surface.
    console.error("[whop-checkout-diagnostics] Unexpected failure:", err);
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

async function runDiagnostics(apiKey: string) {
  const companyId = getWhopCompanyId();

  return Promise.all(
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
            // See getWhopCompanyId's doc comment — omitted entirely (not
            // sent as null/empty) when WHOP_COMPANY_ID isn't set.
            ...(companyId ? { company_id: companyId } : {}),
            metadata: { diagnostic: true },
          }),
        });
        // Read as text first, not res.json() directly — Whop returning a
        // non-JSON error page (an HTML gateway error, a plain-text 401,
        // etc.) would otherwise make .json() throw/reject and lose the
        // body entirely instead of showing it.
        const rawText = await res.text();
        let body: Record<string, unknown> | null = null;
        try {
          body = JSON.parse(rawText);
        } catch {
          // rawText itself is still surfaced below via `raw`.
        }

        if (!res.ok || !body?.purchase_url) {
          return {
            tier,
            label,
            planId,
            ok: false,
            statusCode: res.status,
            error:
              (body?.error as string | undefined) ??
              (body?.message as string | undefined) ??
              `Whop returned ${res.status} with no purchase_url.`,
            raw: rawText ? rawText.slice(0, 2000) : undefined,
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
}
