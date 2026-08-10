import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CHECKOUT_TIERS, getWhopPlanId } from "@/lib/whop";

/**
 * Creates a real, hosted Whop checkout for the signed-in user and hands the
 * URL back to the client to redirect to — no local "purchase" is ever
 * recorded here. The only place a checkout becomes a real, credited plan is
 * the `payment.succeeded` webhook (see api/webhooks/whop), which is the one
 * thing that actually runs after money moves.
 *
 * Reuses the real Whop plan configured for whichever tier the paywall's
 * plan selector was set to (see lib/whop.ts) rather than creating a new one
 * on the fly, and attaches `metadata.userId` so the webhook can credit the
 * right GOALIFY account — Whop's payment events don't include an email,
 * only whatever metadata the checkout was created with.
 *
 * The exact request/response shape below (`POST
 * /api/v1/checkout_configurations` with `plan_id` + `metadata`, response
 * `purchase_url`) is based on Whop's public API docs, cross-checked against
 * two independent summaries of their reference pages — this sandbox's
 * network policy blocks fetching docs.whop.com directly to confirm byte-for
 * -byte. If Whop's real error message logged below doesn't match what's
 * expected here, that's the first place to look.
 */
const checkoutSchema = z.object({
  tier: z.enum(CHECKOUT_TIERS),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const apiKey = process.env.WHOP_API_KEY;
  const planId = getWhopPlanId(parsed.data.tier);
  if (!apiKey || !planId) {
    console.error(
      `[whop checkout] Not configured for tier "${parsed.data.tier}" — missing ` +
        `WHOP_API_KEY or its plan id env var (see lib/whop.ts).`,
    );
    return NextResponse.json(
      { error: "This plan isn't available right now. Please try again shortly." },
      { status: 503 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  let res: Response;
  try {
    res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        redirect_url: `${appUrl}/success`,
        // Payments/memberships created from this checkout inherit this
        // metadata — the webhook reads metadata.userId back out of them.
        metadata: { userId: session.user.id, tier: parsed.data.tier },
      }),
    });
  } catch (err) {
    console.error("[whop checkout] Request to Whop failed:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  const responseBody = await res.json().catch(() => null);
  if (!res.ok || !responseBody?.purchase_url) {
    console.error(
      `[whop checkout] Whop API error for tier "${parsed.data.tier}" (plan ${planId}):`,
      res.status,
      responseBody,
    );
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: responseBody.purchase_url });
}
