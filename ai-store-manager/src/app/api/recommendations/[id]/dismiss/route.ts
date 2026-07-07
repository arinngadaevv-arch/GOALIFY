import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { getSessionShop } from "@/lib/session";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const shop = await getSessionShop();
  if (!shop) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const updated = await db
    .update(recommendations)
    .set({ status: "dismissed", updatedAt: new Date() })
    .where(and(eq(recommendations.id, id), eq(recommendations.shopId, shop.id)))
    .returning({ id: recommendations.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  }
  return NextResponse.json({ dismissed: true });
}
