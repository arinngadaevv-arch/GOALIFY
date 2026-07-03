import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";

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
    const [business] = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, id), eq(businesses.userId, session.user.id)))
      .limit(1);

    if (!business) {
      return NextResponse.json({ error: "העסק לא נמצא" }, { status: 404 });
    }

    // Only SENT decisions are visible to the business owner - drafts are internal.
    const decisionRows = await db
      .select()
      .from(decisions)
      .where(
        and(eq(decisions.businessId, business.id), eq(decisions.status, "SENT"))
      )
      .orderBy(asc(decisions.sentAt));

    const decisionIds = decisionRows.map((d) => d.id);
    const outcomeRows = decisionIds.length
      ? await db
          .select()
          .from(outcomes)
          .where(inArray(outcomes.decisionId, decisionIds))
      : [];
    const outcomeByDecisionId = new Map(
      outcomeRows.map((o) => [o.decisionId, o])
    );

    const track = decisionRows.map((d) => ({
      decision: d,
      outcome: outcomeByDecisionId.get(d.id) ?? null,
    }));

    return NextResponse.json({ business, track });
  } catch (error) {
    console.error("[GET /api/businesses/[id]] failed", error);
    return NextResponse.json(
      { error: "טעינת נתוני העסק נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
