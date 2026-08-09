import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkoutEvents, users } from "@/lib/db/schema";

/**
 * The one place a Whop payment becomes a real, credited plan — mirrors
 * api/webhooks/lemonsqueezy exactly on purpose: nothing on the checkout
 * side ever writes to checkoutEvents or touches users.plan directly, so a
 * user can't grant themselves a paid plan just by hitting a redirect URL.
 *
 * Whop's `payment.succeeded` event identifies the buyer via `data.member.id`
 * and whatever `data.metadata` the checkout was created with — it does NOT
 * include an email directly. api/checkout/whop creates a per-user Whop
 * checkout configuration with `metadata: { userId }` (the same role
 * `custom_data.userId` plays in the Lemon Squeezy flow), so `resolveUserId`
 * below reads it straight back out of the payment event.
 */
const whopEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string().optional(),
    amount_after_fees: z.number().optional(),
    currency: z.string().optional(),
    member: z.object({ id: z.string() }).partial().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

const REPLAY_TOLERANCE_SECONDS = 5 * 60;

/**
 * Whop signs webhooks per the open Standard Webhooks spec (the same one
 * Svix/Resend/Clerk use): `webhook-id`, `webhook-timestamp`, and
 * `webhook-signature` headers, where `webhook-signature` is one or more
 * space-separated `v1,<base64 hmac>` entries (multiple only during secret
 * rotation) and the signed content is `{id}.{timestamp}.{raw body}`. The
 * secret is given as `whsec_<base64>`; the part after `whsec_` is the
 * base64-encoded HMAC key.
 */
function isValidSignature(
  rawBody: string,
  webhookId: string | null,
  timestamp: string | null,
  signatureHeader: string | null,
  secret: string,
) {
  if (!webhookId || !timestamp || !signatureHeader) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > REPLAY_TOLERANCE_SECONDS) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent, "utf8").digest();

  return signatureHeader.split(" ").some((entry) => {
    const [version, providedB64] = entry.split(",");
    if (version !== "v1" || !providedB64) return false;
    const provided = Buffer.from(providedB64, "base64");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(expected, provided);
  });
}

/**
 * Reads the userId api/checkout/whop attached as checkout metadata back out
 * of the payment event. Returns null for any payment that didn't originate
 * from that route (e.g. one made directly against the plan outside the
 * app) — callers must treat null as "can't credit this automatically"
 * rather than guessing.
 */
function resolveUserId(metadata: Record<string, unknown> | undefined): string | null {
  const userId = metadata?.userId;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}

export async function POST(req: Request) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[whop webhook] WHOP_WEBHOOK_SECRET is not set — rejecting.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const isValid = isValidSignature(
    rawBody,
    req.headers.get("webhook-id"),
    req.headers.get("webhook-timestamp"),
    req.headers.get("webhook-signature"),
    secret,
  );
  if (!isValid) {
    console.error("[whop webhook] Signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const parsed = whopEventSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    console.error("[whop webhook] Unexpected payload shape:", parsed.error.message);
    return NextResponse.json({ error: "Unexpected payload." }, { status: 400 });
  }

  const { type, data } = parsed.data;
  if (type !== "payment.succeeded") {
    return NextResponse.json({ ok: true, skipped: type });
  }
  if (data.status && data.status !== "succeeded") {
    return NextResponse.json({ ok: true, skipped: `status=${data.status}` });
  }

  const [existing] = await db
    .select({ id: checkoutEvents.id })
    .from(checkoutEvents)
    .where(eq(checkoutEvents.whopPaymentId, data.id))
    .limit(1);
  if (existing) {
    // A redelivery of an event already credited — Whop retries webhooks
    // that don't return 2xx, so this must stay idempotent.
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const userId = resolveUserId(data.metadata);
  if (!userId) {
    console.error(
      `[whop webhook] payment.succeeded (${data.id}) has no resolvable userId — can't auto-credit. ` +
        "Activate this account manually via /admin until checkout carries metadata.userId.",
    );
    // Acknowledged with 200 so Whop stops retrying — this isn't a
    // transient failure, it's a permanent "can't identify the buyer" until
    // the checkout-side gap above is fixed.
    return NextResponse.json({ ok: true, unresolved: data.id });
  }

  await db.insert(checkoutEvents).values({
    userId,
    tier: "whop",
    tierLabel: "Whop checkout",
    priceCents: data.amount_after_fees ? Math.round(data.amount_after_fees * 100) : 0,
    whopPaymentId: data.id,
  });

  await db.update(users).set({ plan: "PRO" }).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
