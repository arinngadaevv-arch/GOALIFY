import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Lock, Plus, Sparkles, Target, Clock, CircleDot } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";
import { getUserPlan } from "@/lib/usage";
import { getPlanFeatures } from "@/lib/plan-features";
import { nicheLabel } from "@/lib/niche";

type CardStatus =
  | { kind: "move-waiting" }
  | { kind: "in-review" }
  | { kind: "ready" };

function statusBadge(status: CardStatus) {
  switch (status.kind) {
    case "move-waiting":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-2.5 py-1 text-xs font-bold text-neon-pink">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon-pink opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-neon-pink" />
          </span>
          מהלך חדש מחכה לך
        </span>
      );
    case "in-review":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
          <Clock className="size-3" />
          האבחון בבדיקה
        </span>
      );
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
          <CircleDot className="size-3" />
          מוכן לצ׳ק-אין הבא
        </span>
      );
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const userBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session!.user.id))
    .orderBy(desc(businesses.createdAt));

  const features = getPlanFeatures(await getUserPlan(session!.user.id));
  const atBusinessLimit = userBusinesses.length >= features.maxBusinesses;

  // One query for every business's decisions/outcomes, reduced in JS to each
  // business's latest cycle - avoids N+1 round trips for the status badges.
  const businessIds = userBusinesses.map((b) => b.id);
  const allDecisions = businessIds.length
    ? await db
        .select()
        .from(decisions)
        .where(inArray(decisions.businessId, businessIds))
        .orderBy(desc(decisions.createdAt))
    : [];
  const decisionIds = allDecisions.map((d) => d.id);
  const allOutcomes = decisionIds.length
    ? await db.select().from(outcomes).where(inArray(outcomes.decisionId, decisionIds))
    : [];
  const outcomeByDecisionId = new Map(allOutcomes.map((o) => [o.decisionId, o]));

  function statusFor(businessId: string): CardStatus {
    const latest = allDecisions.find((d) => d.businessId === businessId);
    if (!latest) return { kind: "ready" };
    if (latest.status === "DRAFT") return { kind: "in-review" };
    const outcome = outcomeByDecisionId.get(latest.id);
    if (latest.status === "SENT" && !outcome?.followupAnsweredAt) {
      return { kind: "move-waiting" };
    }
    return { kind: "ready" };
  }

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">העסקים שלי</h1>
          <p className="mt-1 text-sm text-muted">
            אבחון והחלטה אחת בכל פעם - לא עוד מסכי תוכן.
          </p>
        </div>
        {userBusinesses.length > 0 &&
          (atBusinessLimit ? (
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-full border border-neon-purple/50 bg-neon-purple/10 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-neon-purple/20"
            >
              <Lock className="size-4 text-neon-purple" />
              נהלו עוד עסקים עם Pro
            </Link>
          ) : (
            <Link
              href="/dashboard/business/new"
              className="flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
            >
              <Plus className="size-4" />
              הוספת עסק
            </Link>
          ))}
      </div>

      {userBusinesses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="grid size-14 place-items-center rounded-2xl gradient-brand">
            <Sparkles className="size-6 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-bold">בואו נכיר את העסק שלך</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            כמה שאלות קצרות, ונתחיל לתת לך החלטה אחת ברורה בכל פעם.
          </p>
          <Link
            href="/dashboard/business/new"
            className="mt-6 flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
          >
            <Plus className="size-4" />
            הוספת העסק הראשון שלי
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBusinesses.map((business) => {
            const status = statusFor(business.id);
            const waiting = status.kind === "move-waiting";
            return (
              <Link
                key={business.id}
                href={`/dashboard/business/${business.id}`}
                className={`group hover-lift relative overflow-hidden rounded-2xl border p-5 transition-colors ${
                  waiting
                    ? "gradient-border glow-pink animate-glow-pulse bg-surface"
                    : "border-border bg-surface/60 hover:border-neon-purple/50"
                }`}
              >
                {waiting && (
                  <Target className="pointer-events-none absolute -left-3 -top-3 size-20 rotate-12 text-neon-pink/10" />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                    {nicheLabel(business.niche)}
                  </span>
                  {statusBadge(status)}
                </div>
                <h3 className="relative mt-3 font-bold group-hover:text-neon-purple transition-colors">
                  {business.name}
                </h3>
                <p className="relative mt-1.5 text-xs text-muted">
                  נוסף ב-{new Date(business.createdAt).toLocaleDateString("he-IL")}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
