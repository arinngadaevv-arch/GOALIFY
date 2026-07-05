import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";
import { CheckinForm } from "@/components/checkin-form";
import { TodaysMoveCard } from "@/components/todays-move-card";
import { FollowupPrompt } from "@/components/followup-prompt";
import { BusinessHeader } from "@/components/business-header";
import { InsightsCard } from "@/components/insights-card";
import { BusinessChat } from "@/components/business-chat";
import { computeInsights } from "@/lib/diagnosis/insights";
import { getUserPlan } from "@/lib/usage";
import { getPlanFeatures } from "@/lib/plan-features";
import { MOVE_CHANNEL_LABELS } from "@/lib/diagnosis/types";

const FOLLOWUP_WINDOW_HOURS = 48;

const RESULT_LABELS: Record<string, string> = {
  MORE_VIEWS: "יותר צפיות",
  MORE_MESSAGES: "יותר הודעות",
  MORE_COMMENTS: "יותר תגובות",
  NOTHING: "כלום מיוחד",
  OTHER: "משהו אחר",
};

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [business] = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.userId, session!.user.id)))
    .limit(1);

  if (!business) notFound();

  const allDecisions = await db
    .select()
    .from(decisions)
    .where(eq(decisions.businessId, business.id))
    .orderBy(desc(decisions.createdAt));

  const decisionIds = allDecisions.map((d) => d.id);
  const allOutcomes = decisionIds.length
    ? await db.select().from(outcomes).where(inArray(outcomes.decisionId, decisionIds))
    : [];
  const outcomeByDecisionId = new Map(allOutcomes.map((o) => [o.decisionId, o]));

  const current = allDecisions[0] ?? null;
  const currentOutcome = current ? (outcomeByDecisionId.get(current.id) ?? null) : null;

  const hoursSinceSent = hoursSince(current?.sentAt ?? null);

  const readyForFollowup =
    !!currentOutcome &&
    !currentOutcome.followupAnsweredAt &&
    hoursSinceSent !== null &&
    hoursSinceSent >= FOLLOWUP_WINDOW_HOURS;

  const cycleClosed = currentOutcome?.followupAnsweredAt != null;
  const noActiveDecision = !current || cycleClosed;

  // History: fully-closed loops only (SENT + follow-up answered), never the
  // still-open current cycle even if it happens to also qualify structurally.
  const historyDecisions = allDecisions.filter((d) => {
    if (d.status !== "SENT") return false;
    if (current && d.id === current.id && !cycleClosed) return false;
    const outcome = outcomeByDecisionId.get(d.id);
    return !!outcome?.followupAnsweredAt;
  });

  const movesSent = allDecisions.filter((d) => d.status === "SENT").length;
  const executed = allOutcomes.filter((o) => o.didExecute === true).length;

  const planFeatures = getPlanFeatures(await getUserPlan(session!.user.id));
  const insights = computeInsights(allDecisions, allOutcomes);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="animate-fade-in-up">
        <BusinessHeader
          name={business.name}
          niche={business.niche}
          ownerName={session?.user?.name ?? null}
          stats={{
            movesSent,
            executed,
            loopsClosed: historyDecisions.length,
          }}
        />
      </div>

      <div className="mt-8 animate-fade-in-up delay-1">
        {noActiveDecision && (
          <div className="rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
            <h2 className="text-lg font-bold">מה קורה השבוע?</h2>
            <p className="mt-1 text-sm text-muted">
              כמה שאלות קצרות, ונחזור עם אבחון ומהלך אחד.
            </p>
            <div className="mt-6">
              <CheckinForm businessId={business.id} />
            </div>
          </div>
        )}

        {current && current.status === "DRAFT" && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon-purple opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-neon-purple" />
              </span>
              קיבלנו את הנתונים - האבחון נמצא כרגע בבדיקה
            </p>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5" />
              נחזור אליך בקרוב עם מהלך ברור.
            </p>
          </div>
        )}

        {current && current.status === "SENT" && !cycleClosed && (
          <div className="space-y-6">
            <TodaysMoveCard
              decision={{
                id: current.id,
                diagnosis: current.diagnosis,
                confidence: current.confidence,
                confidenceReasoning: current.confidenceReasoning,
                evidence: current.evidence as string[],
                alternativesConsidered: current.alternativesConsidered as {
                  hypothesis: string;
                  whyRejected: string;
                }[],
                moveType: current.moveType,
                moveChannel: current.moveChannel,
                moveDescription: current.moveDescription,
                executionAsset: current.executionAsset,
                estimatedMinutes: current.estimatedMinutes,
                falsificationCriteria: current.falsificationCriteria,
              }}
              initialAnswered={!!currentOutcome}
            />

            {currentOutcome && !readyForFollowup && (
              <p className="text-center text-xs text-muted">
                נשאל אותך מה קרה בעוד כ-48 שעות.
              </p>
            )}

            {readyForFollowup && (
              <FollowupPrompt
                decisionId={current.id}
                moveDescription={current.moveDescription}
              />
            )}
          </div>
        )}
      </div>

      <section className="mt-10 animate-fade-in-up delay-2">
        <InsightsCard unlocked={planFeatures.insights} insights={insights} />
      </section>

      <section className="mt-6 animate-fade-in-up delay-3">
        <BusinessChat businessId={business.id} />
      </section>

      {historyDecisions.length > 0 && (
        <section className="mt-10 animate-fade-in-up delay-3">
          <h2 className="text-lg font-bold">ההיסטוריה שלך</h2>
          <div className="mt-4 space-y-3">
            {historyDecisions.map((d) => {
              const outcome = outcomeByDecisionId.get(d.id);
              return (
                <div
                  key={d.id}
                  className="rounded-2xl border border-border bg-surface/60 p-4"
                >
                  <p className="text-xs text-muted">
                    {d.sentAt && new Date(d.sentAt).toLocaleDateString("he-IL")} ·{" "}
                    {MOVE_CHANNEL_LABELS[d.moveChannel]}
                  </p>
                  <p className="mt-1.5 text-sm">{d.diagnosis}</p>
                  <p className="mt-1 text-sm font-medium">{d.moveDescription}</p>
                  {outcome && (
                    <p className="mt-2 text-xs text-muted">
                      {outcome.didExecute ? "בוצע" : "לא בוצע"}
                      {outcome.result && ` · ${RESULT_LABELS[outcome.result]}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
