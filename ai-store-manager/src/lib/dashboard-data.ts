import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, recommendations, scans } from "@/db/schema";

export type RecommendationRow = typeof recommendations.$inferSelect;
export type ScanRow = typeof scans.$inferSelect;
export type ProductRow = typeof products.$inferSelect;

const SEVERITY_ORDER = sql`CASE ${recommendations.severity}
  WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`;

export async function getLatestScan(shopId: string): Promise<ScanRow | null> {
  const [scan] = await db
    .select()
    .from(scans)
    .where(and(eq(scans.shopId, shopId), eq(scans.target, "store")))
    .orderBy(desc(scans.startedAt))
    .limit(1);
  return scan ?? null;
}

export async function getPendingRecommendations(
  shopId: string
): Promise<RecommendationRow[]> {
  return db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.shopId, shopId), eq(recommendations.status, "pending")))
    .orderBy(SEVERITY_ORDER, desc(recommendations.createdAt));
}

export async function getAppliedRecommendations(
  shopId: string,
  limit = 8
): Promise<RecommendationRow[]> {
  return db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.shopId, shopId), eq(recommendations.status, "applied")))
    .orderBy(desc(recommendations.appliedAt))
    .limit(limit);
}

export async function getProducts(shopId: string): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.shopId, shopId))
    .orderBy(products.optimizationScore);
}

export async function getScanHistory(shopId: string, limit = 20): Promise<ScanRow[]> {
  return db
    .select()
    .from(scans)
    .where(and(eq(scans.shopId, shopId), eq(scans.target, "store")))
    .orderBy(desc(scans.startedAt))
    .limit(limit);
}

export function formatRevenueCents(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}
