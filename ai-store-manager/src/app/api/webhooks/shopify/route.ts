import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shops, webhookEvents } from "@/db/schema";
import { verifyWebhookHmac } from "@/lib/shopify/oauth";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhookHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const webhookId = request.headers.get("x-shopify-webhook-id");
  const payload = JSON.parse(rawBody);

  const shopRow = shopDomain
    ? (await db.select().from(shops).where(eq(shops.domain, shopDomain)).limit(1))[0]
    : undefined;

  await db.insert(webhookEvents).values({
    shopId: shopRow?.id,
    topic,
    shopifyWebhookId: webhookId,
    payload,
    processedAt: new Date(),
  }).onConflictDoNothing();

  if (topic === "app/uninstalled" && shopRow) {
    await db.update(shops).set({ uninstalledAt: new Date() }).where(eq(shops.id, shopRow.id));
  }

  return NextResponse.json({ received: true });
}
