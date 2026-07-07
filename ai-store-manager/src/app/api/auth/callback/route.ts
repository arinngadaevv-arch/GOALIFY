import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, shopSettings, subscriptions } from "@/db/schema";
import { isValidShopDomain, shopifyConfig } from "@/lib/shopify/config";
import { verifyHmac, exchangeCodeForToken, fetchShopInfo } from "@/lib/shopify/oauth";
import { consumeInstallState, createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !isValidShopDomain(shop) || !code || !state) {
    return NextResponse.json({ error: "Missing or invalid OAuth parameters" }, { status: 400 });
  }

  const expectedState = await consumeInstallState();
  if (!expectedState || expectedState !== state) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 403 });
  }

  if (!verifyHmac(searchParams)) {
    return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 403 });
  }

  const { access_token: accessToken, scope } = await exchangeCodeForToken(shop, code);
  const shopInfo = await fetchShopInfo(shop, accessToken);

  const [shopRow] = await db
    .insert(shops)
    .values({
      domain: shop,
      accessToken,
      scope,
      shopName: shopInfo.name,
      email: shopInfo.email,
      planName: shopInfo.plan_name,
      currency: shopInfo.currency,
      timezone: shopInfo.iana_timezone,
    })
    .onConflictDoUpdate({
      target: shops.domain,
      set: {
        accessToken,
        scope,
        shopName: shopInfo.name,
        email: shopInfo.email,
        planName: shopInfo.plan_name,
        currency: shopInfo.currency,
        timezone: shopInfo.iana_timezone,
        uninstalledAt: null,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db.insert(shopSettings).values({ shopId: shopRow.id }).onConflictDoNothing();
  await db.insert(subscriptions).values({ shopId: shopRow.id }).onConflictDoNothing();

  await createSession(shopRow.id);

  return NextResponse.redirect(`${shopifyConfig.appUrl()}/dashboard`);
}
