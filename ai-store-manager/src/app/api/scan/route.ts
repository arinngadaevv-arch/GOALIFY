import { NextResponse } from "next/server";
import { getSessionShop } from "@/lib/session";
import { runStoreScan } from "@/lib/scanner";

export const maxDuration = 300; // full-store scans can take a while

export async function POST() {
  const shop = await getSessionShop();
  if (!shop) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const summary = await runStoreScan(shop);
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
