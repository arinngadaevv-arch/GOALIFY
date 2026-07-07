import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { getSessionShop } from "@/lib/session";
import { applyFix, markApplied, markFailed } from "@/lib/fixes";
import { isAiConfigured } from "@/lib/ai";

export const maxDuration = 120;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const shop = await getSessionShop();
  if (!shop) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const [recommendation] = await db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.id, id), eq(recommendations.shopId, shop.id)))
    .limit(1);

  if (!recommendation) {
    return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  }
  if (recommendation.status === "applied") {
    return NextResponse.json({ error: "This fix was already applied" }, { status: 409 });
  }
  if (recommendation.proposedChange?.kind !== "automated") {
    return NextResponse.json(
      { error: "This recommendation requires a manual change in Shopify admin" },
      { status: 400 }
    );
  }
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI content generation is not configured (ANTHROPIC_API_KEY missing)" },
      { status: 503 }
    );
  }

  try {
    const result = await applyFix(shop, recommendation);
    await markApplied(recommendation.id, result);
    return NextResponse.json({ applied: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fix failed";
    await markFailed(recommendation.id, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
