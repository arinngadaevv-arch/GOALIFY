import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAdminSession } from "@/lib/admin";

/**
 * Owner-only test-mode bypass so the paywall's post-payment screens can be
 * previewed without a real Lemon Squeezy charge. Gated on the exact same
 * `getAdminSession` owner check as /admin — an attacker can't make their
 * own account pass it, so unlike the real checkout flow (see
 * api/webhooks/lemonsqueezy, the ONLY place a paying customer's plan
 * activates), this is safe to leave wired up in production: nobody but the
 * site owner's own account can ever grant themselves a plan through it.
 *
 * TEMPORARY — remove this route (and the paywall's "Skip Payment" button)
 * once post-payment screens have been previewed; it has no purpose beyond
 * that.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await db.update(users).set({ plan: "PRO" }).where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
