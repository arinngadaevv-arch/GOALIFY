function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const shopifyConfig = {
  apiKey: () => requireEnv("SHOPIFY_API_KEY"),
  apiSecret: () => requireEnv("SHOPIFY_API_SECRET"),
  appUrl: () => requireEnv("SHOPIFY_APP_URL").replace(/\/$/, ""),
  apiVersion: "2025-01",
  scopes: (process.env.SHOPIFY_SCOPES ?? "read_products,read_orders,read_customers")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

// Shopify shop domains are always `<name>.myshopify.com`.
const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export function isValidShopDomain(shop: string): boolean {
  return SHOP_DOMAIN_PATTERN.test(shop);
}
