import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkoutEvents } from "@/lib/db/schema";

// GOALIFY has no live payment processor wired up (see paywall.tsx) — this
// records the real moment a signed-in user claims a plan, tier + the price
// listed to them at that instant, so the admin dashboard has something
// honest to show instead of a fabricated revenue number.
const checkoutSchema = z.object({
  tier: z.string().min(1).max(40),
  tierLabel: z.string().min(1).max(80),
  priceCents: z.number().int().min(0).max(10_000_00),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await db.insert(checkoutEvents).values({
    userId: session.user.id,
    ...parsed.data,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
