import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Quiz answers live client-side (see lib/goalify/store.tsx) — this endpoint
 * is the one-time, best-effort sync of just the summary fields an
 * authenticated session sends up once a local quiz completion exists (see
 * terms-gate.tsx), purely so the admin dashboard has real per-user quiz
 * data. Never blocks or gates anything client-side; a failed sync just
 * means that row stays null until the next successful attempt.
 */
const quizSyncSchema = z.object({
  goal: z.enum(["burn", "build", "tone", "athletic"]),
  level: z.enum(["beginner", "returning", "consistent", "advanced"]),
  daysPerWeek: z.number().int().min(1).max(7),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = quizSyncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await db
    .update(users)
    .set({
      quizGoal: parsed.data.goal,
      quizLevel: parsed.data.level,
      quizDaysPerWeek: parsed.data.daysPerWeek,
      quizCompletedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
