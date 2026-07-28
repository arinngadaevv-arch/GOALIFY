import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";
import { generateDiagnosisDraft } from "@/lib/diagnosis/generate";
import { diagnosisErrorMessage } from "@/lib/ai/errors";
import { getClientIp, rateLimit, retryAfterSeconds } from "@/lib/rate-limit";

// A Gemini structured-output call can take a while; give it room past the default.
export const maxDuration = 60;

/** Upper bound on decisions pulled for the track record. buildTrackRecord
 * trims further for the prompt; this just keeps the query bounded. */
const HISTORY_LOOKBACK = 20;

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

  // Enforce "one decision at a time" at the API level, not just in the UI -
  // a business with a still-open decision (DRAFT, or SENT awaiting outcome)
  // must close that loop before a new check-in can start another.
  const [latest] = await db
    .select({
      status: decisions.status,
      followupAnsweredAt: outcomes.followupAnsweredAt,
    })
    .from(decisions)
    .leftJoin(outcomes, eq(outcomes.decisionId, decisions.id))
    .where(eq(decisions.businessId, business.id))
    .orderBy(desc(decisions.createdAt))
    .limit(1);

  const hasOpenDecision =
    latest && (latest.status !== "SENT" || !latest.followupAnsweredAt);

  if (hasOpenDecision) {
    return NextResponse.json(
      { error: "יש כבר החלטה פעילה לעסק הזה. סגרו אותה לפני שמתחילים חדשה." },
      { status: 409 }
    );
  }

  // The business's own closed loops, newest first - the only history the
  // diagnosis is allowed to reason from.
  const priorLoops = await db
    .select({
      sentAt: decisions.sentAt,
      createdAt: decisions.createdAt,
      diagnosis: decisions.diagnosis,
      moveChannel: decisions.moveChannel,
      moveDescription: decisions.moveDescription,
      falsificationCriteria: decisions.falsificationCriteria,
      didExecute: outcomes.didExecute,
      result: outcomes.result,
      resultNote: outcomes.resultNote,
    })
    .from(decisions)
    .leftJoin(outcomes, eq(outcomes.decisionId, decisions.id))
    .where(and(eq(decisions.businessId, business.id), eq(decisions.status, "SENT")))
    .orderBy(desc(decisions.createdAt))
    .limit(HISTORY_LOOKBACK);

  try {
    const draft = await generateDiagnosisDraft(
      parsed.data,
      {
        name: business.name,
        niche: business.niche,
        reachNotes: business.reachNotes,
      },
      priorLoops
    );

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
        executionAsset: draft.noMoveToday ? null : draft.executionAsset,
        estimatedMinutes: draft.estimatedMinutes,
        falsificationCriteria: draft.falsificationCriteria,
        learnedFromPrior: draft.learnedFromPrior,
      })
      .returning();

    return NextResponse.json({ decision }, { status: 201 });
  } catch (error) {
    console.error("[/api/businesses/[id]/checkin] failed", error);
    return NextResponse.json(
      { error: diagnosisErrorMessage(error) },
      { status: 502 }
    );
  }
}
