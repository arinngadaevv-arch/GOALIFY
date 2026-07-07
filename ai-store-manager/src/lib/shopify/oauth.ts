import crypto from "crypto";
import { shopifyConfig } from "./config";

export function buildAuthorizeUrl(shop: string, state: string): string {
  const params = new URLSearchParams({
    client_id: shopifyConfig.apiKey(),
    scope: shopifyConfig.scopes.join(","),
    redirect_uri: `${shopifyConfig.appUrl()}/api/auth/callback`,
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

// Shopify signs every OAuth redirect and webhook with an HMAC over the
// request using the app's client secret. Timing-safe comparison is required
// since this guards against forged installs/webhooks.
export function verifyHmac(searchParams: URLSearchParams): boolean {
  const params = new URLSearchParams(searchParams);
  const hmac = params.get("hmac");
  if (!hmac) return false;
  params.delete("hmac");
  params.delete("signature");

  const message = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const digest = crypto
    .createHmac("sha256", shopifyConfig.apiSecret())
    .update(message)
    .digest("hex");

  const digestBuffer = Buffer.from(digest, "utf8");
  const hmacBuffer = Buffer.from(hmac, "utf8");
  if (digestBuffer.length !== hmacBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, hmacBuffer);
}

export function verifyWebhookHmac(rawBody: string, hmacHeader: string | null): boolean {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", shopifyConfig.apiSecret())
    .update(rawBody, "utf8")
    .digest("base64");

  const digestBuffer = Buffer.from(digest, "utf8");
  const hmacBuffer = Buffer.from(hmacHeader, "utf8");
  if (digestBuffer.length !== hmacBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, hmacBuffer);
}

interface AccessTokenResponse {
  access_token: string;
  scope: string;
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<AccessTokenResponse> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: shopifyConfig.apiKey(),
      client_secret: shopifyConfig.apiSecret(),
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

interface ShopInfo {
  name: string;
  email: string;
  plan_name: string;
  currency: string;
  iana_timezone: string;
}

export async function fetchShopInfo(shop: string, accessToken: string): Promise<ShopInfo> {
  const response = await fetch(
    `https://${shop}/admin/api/${shopifyConfig.apiVersion}/shop.json`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch shop info: ${response.status}`);
  }

  const { shop: shopInfo } = await response.json();
  return shopInfo;
}
