import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions } from "@/lib/db/schema";
import { generateDiagnosisDraft } from "@/lib/diagnosis/generate";
import { getClientIp, rateLimit, retryAfterSeconds } from "@/lib/rate-limit";

const signalsSchema = z.object({
  exposureThisWeek: z.string().min(1).max(300),
  inquiriesThisWeek: z.string().min(1).max(300),
  closingsThisWeek: z.string().min(1).max(300),
  emptySlotsThisWeek: z.string().min(1).max(300),
  returningVsNewCustomers: z.string().min(1).max(300),
  recentAnomaly: z.string().min(1).max(300),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  // Reuses the "generate" burst-protection rule - same class of user-triggered AI call.
  const rl = await rateLimit("generate", getClientIp(req));
  if (!rl.success) {
    return NextResponse.json(
      { error: "יותר מדי בקשות ברצף. המתינו רגע ונסו שוב." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = signalsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.userId, session.user.id)))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "העסק לא נמצא" }, { status: 404 });
  }

  try {
    const draft = await generateDiagnosisDraft(parsed.data, {
      name: business.name,
      niche: business.niche,
      reachNotes: business.reachNotes,
    });

    const [decision] = await db
      .insert(decisions)
      .values({
        businessId: business.id,
        status: "DRAFT",
        signals: parsed.data,
        diagnosis: draft.diagnosis,
        confidence: draft.confidence,
        confidenceReasoning: draft.confidenceReasoning,
        evidence: draft.evidence,
        alternativesConsidered: draft.alternativesConsidered,
        moveType: draft.moveType,
        moveChannel: draft.noMoveToday ? "NONE" : draft.moveChannel,
        moveDescription: draft.moveDescription,
        estimatedMinutes: draft.estimatedMinutes,
        falsificationCriteria: draft.falsificationCriteria,
      })
      .returning();

    return NextResponse.json({ decision }, { status: 201 });
  } catch (error) {
    console.error("[/api/businesses/[id]/checkin] failed", error);
    return NextResponse.json(
      { error: "יצירת האבחון נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
