import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/** Persists the mandatory Terms of Service + health liability waiver
 * checkbox (see terms-gate.tsx) — the one gate every account, Google or
 * email, must clear once before reaching any workout/plan content. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  await db
    .update(users)
    .set({ hasAcceptedTerms: true })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
