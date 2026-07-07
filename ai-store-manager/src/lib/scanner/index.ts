import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, recommendations, scans, shops } from "@/db/schema";
import {
  ShopifyAdminClient,
  fetchCollections,
  fetchHomepage,
  fetchMenus,
  fetchPages,
  fetchPolicies,
  fetchProducts,
  type ScannedProduct,
} from "@/lib/shopify/admin";
import { checkProduct, checkProductSet } from "./product-checks";
import {
  checkCollections,
  checkHomepage,
  checkNavigation,
  checkPolicies,
  checkTrustPages,
} from "./store-checks";
import { SEVERITY_WEIGHT, type Category, type Finding } from "./types";

const CATEGORIES: Category[] = [
  "conversion",
  "seo",
  "design",
  "accessibility",
  "copywriting",
  "trust",
  "pricing",
  "performance",
];

function scoreFor(findings: Finding[], category: Category): number {
  const deduction = findings
    .filter((f) => f.category === category)
    .reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.max(0, 100 - deduction);
}

// Rough dollar framing so the dashboard can total a "recoverable revenue"
// figure. Deliberately conservative and clearly labeled an estimate in the UI.
const SEVERITY_REVENUE_CENTS: Record<Finding["severity"], number> = {
  low: 1500,
  medium: 4500,
  high: 12000,
  critical: 30000,
};

export interface ScanSummary {
  scanId: string;
  findingsCount: number;
  productsScanned: number;
  scores: Record<string, number>;
}

export async function runStoreScan(shop: typeof shops.$inferSelect): Promise<ScanSummary> {
  const client = new ShopifyAdminClient(shop.domain, shop.accessToken);

  // Products are required — if this fails the scan fails loudly.
  const scannedProducts = await fetchProducts(client);

  // Everything else degrades gracefully (missing scope, API drift, storefront
  // password page, etc.) and simply contributes no findings.
  const [collections, policies, menus, pages, homepage] = await Promise.all([
    fetchCollections(client),
    fetchPolicies(client),
    fetchMenus(client),
    fetchPages(client),
    fetchHomepage(shop.domain),
  ]);

  const findings: Finding[] = [
    ...scannedProducts.flatMap(checkProduct),
    ...checkProductSet(scannedProducts),
    ...(collections ? checkCollections(collections) : []),
    ...(policies ? checkPolicies(policies) : []),
    ...(menus ? checkNavigation(menus) : []),
    ...(pages ? checkTrustPages(pages) : []),
    ...(homepage ? checkHomepage(homepage) : []),
  ];

  const categoryScores = Object.fromEntries(
    CATEGORIES.map((c) => [c, scoreFor(findings, c)])
  ) as Record<Category, number>;

  const healthScore = Math.round(
    CATEGORIES.reduce((sum, c) => sum + categoryScores[c], 0) / CATEGORIES.length
  );

  const [scan] = await db
    .insert(scans)
    .values({
      shopId: shop.id,
      target: "store",
      storeHealthScore: healthScore,
      conversionScore: categoryScores.conversion,
      seoScore: categoryScores.seo,
      designScore: categoryScores.design,
      trustScore: categoryScores.trust,
      performanceScore: categoryScores.performance,
      accessibilityScore: categoryScores.accessibility,
      rawFindings: findings,
      completedAt: new Date(),
    })
    .returning();

  await syncProductCache(shop.id, scannedProducts, findings);

  // A fresh scan supersedes previous *pending* recommendations. Applied and
  // dismissed ones are kept as history.
  await db
    .delete(recommendations)
    .where(and(eq(recommendations.shopId, shop.id), eq(recommendations.status, "pending")));

  if (findings.length > 0) {
    const productRows = await db
      .select({ id: products.id, shopifyProductId: products.shopifyProductId })
      .from(products)
      .where(eq(products.shopId, shop.id));
    const productIdMap = new Map(productRows.map((p) => [p.shopifyProductId, p.id]));

    await db.insert(recommendations).values(
      findings.map((f) => ({
        shopId: shop.id,
        scanId: scan.id,
        productId: f.shopifyProductId ? productIdMap.get(f.shopifyProductId) : undefined,
        category: f.category,
        severity: f.severity,
        title: f.title,
        problem: f.explanation,
        reason: f.whyItMatters,
        estimatedImpact: f.expectedImpact,
        estimatedRevenueCents: SEVERITY_REVENUE_CENTS[f.severity],
        aiRecommendation: f.aiRecommendation,
        difficulty: f.fix.kind === "automated" ? ("easy" as const) : ("medium" as const),
        estimatedTimeSavedMinutes: f.fix.kind === "automated" ? 15 : undefined,
        proposedChange: f.fix,
      }))
    );
  }

  return {
    scanId: scan.id,
    findingsCount: findings.length,
    productsScanned: scannedProducts.length,
    scores: { health: healthScore, ...categoryScores },
  };
}

async function syncProductCache(
  shopId: string,
  scanned: ScannedProduct[],
  findings: Finding[]
): Promise<void> {
  // Per-product optimization score: 100 minus its findings' severity weights.
  const deductions = new Map<string, number>();
  for (const f of findings) {
    if (!f.shopifyProductId) continue;
    deductions.set(
      f.shopifyProductId,
      (deductions.get(f.shopifyProductId) ?? 0) + SEVERITY_WEIGHT[f.severity]
    );
  }

  const now = new Date();
  for (const p of scanned) {
    const score = Math.max(0, 100 - (deductions.get(p.id) ?? 0));
    const values = {
      shopId,
      shopifyProductId: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      price: p.minPrice,
      imageCount: p.images.length,
      variantCount: p.variantCount,
      optimizationScore: score,
      lastSyncedAt: now,
      updatedAt: now,
    };

    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.shopId, shopId), eq(products.shopifyProductId, p.id)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(products).set(values).where(eq(products.id, existing[0].id));
    } else {
      await db.insert(products).values(values);
    }
  }

  // Drop cached products that no longer exist in the store.
  const liveIds = scanned.map((p) => p.id);
  if (liveIds.length > 0) {
    const stale = await db
      .select({ id: products.id, shopifyProductId: products.shopifyProductId })
      .from(products)
      .where(eq(products.shopId, shopId));
    const staleIds = stale.filter((p) => !liveIds.includes(p.shopifyProductId)).map((p) => p.id);
    if (staleIds.length > 0) {
      await db.delete(products).where(inArray(products.id, staleIds));
    }
  }
}
