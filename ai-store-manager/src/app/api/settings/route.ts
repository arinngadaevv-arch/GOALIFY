import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { shopSettings } from "@/db/schema";
import { getSessionShop } from "@/lib/session";

const settingsSchema = z.object({
  automationMode: z.enum(["suggest_only", "approve", "auto"]),
});

export async function POST(request: NextRequest) {
  const shop = await getSessionShop();
  if (!shop) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  await db
    .insert(shopSettings)
    .values({ shopId: shop.id, automationMode: parsed.data.automationMode })
    .onConflictDoUpdate({
      target: shopSettings.shopId,
      set: { automationMode: parsed.data.automationMode, updatedAt: new Date() },
    });

  return NextResponse.json({ saved: true });
}
