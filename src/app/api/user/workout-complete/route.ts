import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workoutCompletions } from "@/lib/db/schema";

/**
 * Mirrors a `completeWorkout()` call (see lib/goalify/store.tsx) into
 * Postgres — the one server-side fact needed for api/cron/streak-reminder
 * to know who's already trained today. `completedOn` is the exact
 * "YYYY-MM-DD" the client's own `todayKey()` computed (its local calendar
 * day, not a server-side UTC one), sent up as-is so this table can never
 * disagree with what the app itself shows the user as "today". The
 * unique(userId, completedOn) constraint makes a duplicate POST for the
 * same day a no-op rather than a second row.
 */
const completeSchema = z.object({
  completedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await db
    .insert(workoutCompletions)
    .values({ userId: session.user.id, completedOn: parsed.data.completedOn })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}
