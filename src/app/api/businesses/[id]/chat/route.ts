import { NextResponse } from "next/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, chatMessages, decisions, outcomes } from "@/lib/db/schema";
import { generateChatReply } from "@/lib/chat/generate";
import { diagnosisErrorMessage } from "@/lib/ai/errors";
import { getClientIp, rateLimit, retryAfterSeconds } from "@/lib/rate-limit";

// A Gemini call can take a while; give it room past the default.
export const maxDuration = 60;

const HISTORY_LIMIT = 30;
// How many past decisions to ground the assistant in - enough to answer
// "what worked" style questions without an unbounded prompt.
const DECISIONS_CONTEXT_LIMIT = 20;

async function loadBusinessForUser(businessId: string, userId: string) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.userId, userId)))
    .limit(1);
  return business ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const business = await loadBusinessForUser(id, session.user.id);
    if (!business) {
      return NextResponse.json({ error: "העסק לא נמצא" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.businessId, id))
      .orderBy(asc(chatMessages.createdAt))
      .limit(HISTORY_LIMIT);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[GET /api/businesses/[id]/chat] failed", error);
    return NextResponse.json(
      { error: "טעינת השיחה נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}

const bodySchema = z.object({
  message: z.string().min(1).max(1000),
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
      { error: "יותר מדי הודעות ברצף. המתינו רגע ונסו שוב." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(rl.reset)) } }
    );
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  try {
    const business = await loadBusinessForUser(id, session.user.id);
    if (!business) {
      return NextResponse.json({ error: "העסק לא נמצא" }, { status: 404 });
    }

    const [history, decisionRows] = await Promise.all([
      db
        .select({ role: chatMessages.role, content: chatMessages.content })
        .from(chatMessages)
        .where(eq(chatMessages.businessId, id))
        .orderBy(asc(chatMessages.createdAt))
        .limit(HISTORY_LIMIT),
      db
        .select()
        .from(decisions)
        .where(and(eq(decisions.businessId, id), eq(decisions.status, "SENT")))
        .orderBy(desc(decisions.createdAt))
        .limit(DECISIONS_CONTEXT_LIMIT),
    ]);

    const decisionIds = decisionRows.map((d) => d.id);
    const outcomeRows = decisionIds.length
      ? await db.select().from(outcomes).where(inArray(outcomes.decisionId, decisionIds))
      : [];
    const outcomeByDecisionId = new Map(outcomeRows.map((o) => [o.decisionId, o]));

    const decisionsContext = decisionRows.map((d) => ({
      createdAt: d.createdAt,
      status: d.status,
      diagnosis: d.diagnosis,
      confidence: d.confidence,
      confidenceReasoning: d.confidenceReasoning,
      moveDescription: d.moveDescription,
      moveChannel: d.moveChannel,
      falsificationCriteria: d.falsificationCriteria,
      outcome: outcomeByDecisionId.get(d.id) ?? null,
    }));

    const reply = await generateChatReply(
      { name: business.name, niche: business.niche },
      decisionsContext,
      history,
      parsed.data.message
    );

    const inserted = await db
      .insert(chatMessages)
      .values([
        { businessId: id, role: "USER", content: parsed.data.message },
        { businessId: id, role: "ASSISTANT", content: reply },
      ])
      .returning();

    const userMessage = inserted.find((m) => m.role === "USER");
    const assistantMessage = inserted.find((m) => m.role === "ASSISTANT");

    return NextResponse.json({ userMessage, assistantMessage }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/businesses/[id]/chat] failed", error);
    return NextResponse.json(
      {
        error: diagnosisErrorMessage(
          error,
          "שליחת ההודעה נכשלה. נסו שוב בעוד רגע."
        ),
      },
      { status: 502 }
    );
  }
}
