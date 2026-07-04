import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions } from "@/lib/db/schema";
import { isUserAdmin } from "@/lib/admin";
import { AdminDecisionCard } from "@/components/admin-decision-card";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !(await isUserAdmin(session.user.id))) {
    redirect("/dashboard");
  }

  const drafts = await db
    .select({
      decision: decisions,
      businessName: businesses.name,
    })
    .from(decisions)
    .innerJoin(businesses, eq(decisions.businessId, businesses.id))
    .where(eq(decisions.status, "DRAFT"))
    .orderBy(asc(decisions.createdAt));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold">תור אישורים</h1>
      <p className="mt-1 text-sm text-muted">
        טיוטות אבחון שממתינות לבדיקה לפני שהן נשלחות ללקוחה.
      </p>

      <div className="mt-8 space-y-5">
        {drafts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            אין כרגע טיוטות ממתינות.
          </p>
        )}

        {drafts.map(({ decision, businessName }) => (
          <AdminDecisionCard
            key={decision.id}
            businessName={businessName}
            draft={{
              id: decision.id,
              diagnosis: decision.diagnosis,
              confidence: decision.confidence,
              confidenceReasoning: decision.confidenceReasoning,
              evidence: decision.evidence as string[],
              alternativesConsidered: decision.alternativesConsidered as {
                hypothesis: string;
                whyRejected: string;
              }[],
              moveType: decision.moveType,
              moveChannel: decision.moveChannel,
              moveDescription: decision.moveDescription,
              estimatedMinutes: decision.estimatedMinutes,
              falsificationCriteria: decision.falsificationCriteria,
            }}
          />
        ))}
      </div>
    </div>
  );
}
