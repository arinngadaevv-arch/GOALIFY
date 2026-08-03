import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkoutEvents, users } from "@/lib/db/schema";

// The one place a Lemon Squeezy checkout becomes a real, credited order —
// nothing on the checkout/success side of the flow ever writes to
// checkoutEvents or touches users.plan directly, specifically so that a
// user can't grant themselves a paid plan just by hitting /success without
// actually paying (Lemon Squeezy only calls this webhook after the money
// has actually settled).
const webhookPayloadSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z
      .object({
        userId: z.string().optional(),
        tier: z.string().optional(),
      })
      .partial()
      .optional(),
  }),
  data: z.object({
    id: z.string(),
    attributes: z.object({
      status: z.string(),
      total: z.number(),
      first_order_item: z
        .object({
          variant_name: z.string().optional(),
        })
        .partial()
        .optional(),
    }),
  }),
});

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(signatureHeader, "hex");
  // timingSafeEqual throws on a length mismatch rather than just returning
  // false, and a forged/truncated signature is exactly the case this needs
  // to handle without leaking timing information.
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[lemonsqueezy webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set — rejecting.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");
  if (!isValidSignature(rawBody, signature, secret)) {
    console.error("[lemonsqueezy webhook] Signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const parsed = webhookPayloadSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    console.error("[lemonsqueezy webhook] Unexpected payload shape:", parsed.error.message);
    return NextResponse.json({ error: "Unexpected payload." }, { status: 400 });
  }

  const { meta, data } = parsed.data;
  if (meta.event_name !== "order_created") {
    // Only order_created activates a plan; everything else (e.g.
    // order_refunded) is acknowledged so Lemon Squeezy stops retrying it,
    // but there's nothing to do with it yet.
    return NextResponse.json({ ok: true, skipped: meta.event_name });
  }

  const userId = meta.custom_data?.userId;
  const tier = meta.custom_data?.tier;
  if (!userId || !tier) {
    console.error("[lemonsqueezy webhook] order_created with no custom_data.userId/tier.");
    return NextResponse.json({ error: "Missing custom_data." }, { status: 400 });
  }

  if (data.attributes.status !== "paid") {
    return NextResponse.json({ ok: true, skipped: `status=${data.attributes.status}` });
  }

  const [existing] = await db
    .select({ id: checkoutEvents.id })
    .from(checkoutEvents)
    .where(eq(checkoutEvents.lemonSqueezyOrderId, data.id))
    .limit(1);

  if (existing) {
    // A redelivery of an order we've already credited — Lemon Squeezy
    // retries webhooks that don't return 2xx, and can also just send the
    // same event twice. Reporting success without doing anything again is
    // the correct response, not an error.
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  await db.insert(checkoutEvents).values({
    userId,
    tier,
    tierLabel: data.attributes.first_order_item?.variant_name ?? tier,
    priceCents: data.attributes.total,
    lemonSqueezyOrderId: data.id,
  });

  await db.update(users).set({ plan: "PRO" }).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
