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
function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
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
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  // Matching Meta does server-side against its own user records — hashed
  // per Meta's spec (lowercased + trimmed before SHA-256). `external_id`
  // (the app's own userId) always goes out; the hashed email is added on
  // top when we have one, since email match quality is generally better
  // than external_id alone.
  const userData: Record<string, string[]> = {
    external_id: [sha256(userId)],
  };
  if (email) userData.em = [sha256(email)];

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              // No request/browser context available in a payment
              // webhook (this runs server-to-server, not on a page the
              // buyer is looking at) — "system_generated" is Meta's own
              // action_source value for exactly that case, rather than
              // mis-claiming "website".
              action_source: "system_generated",
              user_data: userData,
              custom_data: {
                value: valueCents / 100,
                currency,
              },
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error(
        `[meta-capi] Purchase event rejected: ${res.status} ${await res.text()}`,
      );
    }
  } catch (err) {
    // Never let a Meta API hiccup fail the payment webhook itself — the
    // checkoutEvents row and plan grant already happened above; this is
    // best-effort ad-platform reporting on top of a payment that's
    // already been credited, not a precondition for crediting it.
    console.error("[meta-capi] Purchase event failed:", err);
  }
}
