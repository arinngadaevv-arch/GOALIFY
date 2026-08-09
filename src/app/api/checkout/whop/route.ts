import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Creates a real, hosted Whop checkout for the signed-in user and hands the
 * URL back to the client to redirect to — no local "purchase" is ever
 * recorded here. The only place a checkout becomes a real, credited plan is
 * the `payment.succeeded` webhook (see api/webhooks/whop), which is the one
 * thing that actually runs after money moves.
 *
 * Reuses the existing Whop plan (the same `plan_gMVdfDFjDAdqL` the paywall
 * used to link to as a static URL) rather than creating a new one on the
 * fly, and attaches `metadata.userId` so the webhook can credit the right
 * GOALIFY account — Whop's payment events don't include an email, only
 * whatever metadata the checkout was created with.
 *
 * The exact request/response shape below (`POST
 * /api/v1/checkout_configurations` with `plan_id` + `metadata`, response
 * `purchase_url`) is based on Whop's public API docs, cross-checked against
 * two independent summaries of their reference pages — this sandbox's
 * network policy blocks fetching docs.whop.com directly to confirm byte-for
 * -byte. If Whop's real error message logged below doesn't match what's
 * expected here, that's the first place to look.
 */
const WHOP_PLAN_ID = "plan_gMVdfDFjDAdqL";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    console.error("[whop checkout] WHOP_API_KEY is not set.");
    return NextResponse.json(
      { error: "Checkout isn't available right now. Please try again shortly." },
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
        plan_id: WHOP_PLAN_ID,
        redirect_url: `${appUrl}/success`,
        // Payments/memberships created from this checkout inherit this
        // metadata — the webhook reads metadata.userId back out of them.
        metadata: { userId: session.user.id },
      }),
    });
  } catch (err) {
    console.error("[whop checkout] Request to Whop failed:", err);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.purchase_url) {
    console.error("[whop checkout] Whop API error:", res.status, body);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: body.purchase_url });
}
