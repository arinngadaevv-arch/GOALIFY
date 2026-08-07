import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Fire-and-forget signal from the paywall itself (see paywall.tsx) — the
 * one-time record that this account's client actually rendered /plan, so
 * the admin funnel has a real "reached paywall" stage instead of
 * approximating it from signup. Never blocks or gates anything; a failed
 * write just means that row stays null.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  await db
    .update(users)
    .set({ paywallViewedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
