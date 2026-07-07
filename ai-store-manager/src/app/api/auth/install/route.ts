import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isValidShopDomain } from "@/lib/shopify/config";
import { buildAuthorizeUrl } from "@/lib/shopify/oauth";
import { setInstallState } from "@/lib/session";

export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get("shop");

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json(
      { error: "A valid `shop` query param (e.g. my-store.myshopify.com) is required" },
      { status: 400 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  await setInstallState(state);

  return NextResponse.redirect(buildAuthorizeUrl(shop, state));
}
