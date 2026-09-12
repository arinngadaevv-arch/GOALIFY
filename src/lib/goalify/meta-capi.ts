import { createHash } from "node:crypto";

/**
 * Server-side Meta Conversions API — the one place a real Purchase becomes
 * a signal Meta's ad algorithm can actually learn from. The client-side
 * Pixel (see meta-pixel.ts) only ever fires CompleteRegistration and
 * InitiateCheckout, both from a page in the buyer's own browser, which
 * might have an ad blocker, might get closed before the event fires, or
 * might just never load fbq at all. A payment webhook is the one moment
 * that's both authoritative (money has actually moved) and guaranteed to
 * run — so Purchase goes out from here instead of from any client page.
 *
 * No-op (logs and returns, never throws) whenever the two required env
 * vars aren't set — same "safe to leave unset" contract
 * NEXT_PUBLIC_META_PIXEL_ID already has in meta-pixel.ts, so a deploy with
 * no Meta ads configured still credits real payments exactly the same.
 */
const META_GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Booleans only, read from the same two env vars every call below reads —
 * see admin/meta-capi-diagnostics/route.ts, which surfaces this in the
 * admin dashboard the same way checkoutConfig/whopCheckoutConfig already
 * do for the other two payment providers. */
export function metaCapiConfig(): { pixelId: boolean; accessToken: boolean } {
  return {
    pixelId: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    accessToken: Boolean(process.env.META_CONVERSIONS_API_ACCESS_TOKEN),
  };
}

type PostResult =
  | { ok: true; status: number; body: unknown }
  | { ok: false; status: number; body: unknown }
  | { ok: false; error: string };

/**
 * The one place that actually calls graph.facebook.com — both
 * `sendMetaPurchaseEvent` (fired from the two payment webhooks, swallows
 * its own errors) and the admin diagnostics route (which needs the raw
 * response to show the admin what actually happened) go through this.
 */
async function postMetaEvent(params: {
  eventName: string;
  userId: string;
  email: string | null;
  valueCents: number;
  currency?: string;
  testEventCode?: string;
}): Promise<PostResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    return {
      ok: false,
      error:
        "NEXT_PUBLIC_META_PIXEL_ID or META_CONVERSIONS_API_ACCESS_TOKEN is not set.",
    };
  }

  // Matching Meta does server-side against its own user records — hashed
  // per Meta's spec (lowercased + trimmed before SHA-256). `external_id`
  // always goes out; the hashed email is added on top when we have one,
  // since email match quality is generally better than external_id alone.
  const userData: Record<string, string[]> = {
    external_id: [sha256(params.userId)],
  };
  if (params.email) userData.em = [sha256(params.email)];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        // No request/browser context available here (this runs
        // server-to-server, never on a page the buyer is looking at) —
        // "system_generated" is Meta's own action_source value for
        // exactly that case, rather than mis-claiming "website".
        action_source: "system_generated",
        user_data: userData,
        custom_data: {
          value: params.valueCents / 100,
          currency: params.currency ?? "USD",
        },
      },
    ],
  };
  // Routes the event into Meta's real-time "Test Events" viewer instead
  // of the normal (delayed) events pipeline — see the admin diagnostics
  // route, which is the only caller that ever passes this.
  if (params.testEventCode) body.test_event_code = params.testEventCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const responseBody = await res.json().catch(() => null);
    return res.ok
      ? { ok: true, status: res.status, body: responseBody }
      : { ok: false, status: res.status, body: responseBody };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    };
  }
}

export async function sendMetaPurchaseEvent({
  userId,
  email,
  valueCents,
  currency = "USD",
}: {
  userId: string;
  email: string | null;
  valueCents: number;
  currency?: string;
}): Promise<void> {
  const result = await postMetaEvent({
    eventName: "Purchase",
    userId,
    email,
    valueCents,
    currency,
  });
  if (!result.ok) {
    // Never let a Meta API hiccup fail the payment webhook itself — the
    // checkoutEvents row and plan grant already happened above; this is
    // best-effort ad-platform reporting on top of a payment that's
    // already been credited, not a precondition for crediting it.
    console.error(
      "[meta-capi] Purchase event failed:",
      "error" in result ? result.error : result.body,
    );
  }
}

/** Fires a small synthetic Purchase event — owner-only, from
 * admin/meta-capi-diagnostics/route.ts — so the admin can confirm the
 * Conversions API is actually wired up without waiting for (or faking) a
 * real payment. Pass the Test Event Code from Meta's Events Manager >
 * Test Events tab to see it show up there in real time; without one, the
 * event still posts, just into the normal (delayed) events pipeline. */
export function sendMetaTestEvent(testEventCode?: string): Promise<PostResult> {
  return postMetaEvent({
    eventName: "Purchase",
    userId: "admin-diagnostic-test",
    email: null,
    valueCents: 100,
    testEventCode,
  });
}
