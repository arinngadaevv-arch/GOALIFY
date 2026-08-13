import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const MAX_QUOTE_LENGTH = 300;

/**
 * Real, user-submitted ratings — replaces the fabricated "4.9 · 1,250+
 * reviews" stat that used to be hardcoded in analyzing-screen.tsx. One
 * review per account: a second submission overwrites the first (and resets
 * `approved` to false, so an edited quote can't skip re-moderation) rather
 * than creating duplicates that would double-count in the average.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const rl = await rateLimit("reviewSubmit", ip);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5." }, { status: 400 });
  }

  const rawQuote = typeof body?.quote === "string" ? body.quote.trim() : "";
  const quote = rawQuote.slice(0, MAX_QUOTE_LENGTH) || null;

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.userId, session.user.id))
    .limit(1);

  if (existing) {
    await db
      .update(reviews)
      .set({ rating, quote, approved: false })
      .where(eq(reviews.id, existing.id));
  } else {
    await db.insert(reviews).values({ userId: session.user.id, rating, quote });
  }

  return NextResponse.json({ ok: true });
}
