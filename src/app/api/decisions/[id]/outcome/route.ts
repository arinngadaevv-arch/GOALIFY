import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";
import { isUniqueViolation } from "@/lib/db/errors";

const bodySchema = z.object({
  didExecute: z.boolean(),
  executionTime: z.enum(["UNDER_10", "TEN_TO_30", "OVER_30"]).nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  try {
    const [row] = await db
      .select({ decisionId: decisions.id, status: decisions.status })
      .from(decisions)
      .innerJoin(businesses, eq(decisions.businessId, businesses.id))
      .where(
        and(
          eq(decisions.id, id),
          eq(businesses.userId, session.user.id),
          eq(decisions.status, "SENT")
        )
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "ההחלטה לא נמצאה" }, { status: 404 });
    }

    const [existingOutcome] = await db
      .select({ id: outcomes.id })
      .from(outcomes)
      .where(eq(outcomes.decisionId, id))
      .limit(1);

    if (existingOutcome) {
      return NextResponse.json(
        { error: "כבר ענית על השאלה הזו" },
        { status: 409 }
      );
    }

    const [outcome] = await db
      .insert(outcomes)
      .values({
        decisionId: id,
        didExecute: parsed.data.didExecute,
        executionTime: parsed.data.didExecute ? parsed.data.executionTime : null,
        immediateAnsweredAt: new Date(),
      })
      .returning();

    return NextResponse.json({ outcome }, { status: 201 });
  } catch (error) {
    // Two near-simultaneous submits (double click, two tabs) can both pass the
    // existence check before either INSERT commits - the DB's unique
    // constraint on decisionId is the real guard; surface it as a normal 409.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "כבר ענית על השאלה הזו" },
        { status: 409 }
      );
    }
    console.error("[POST /api/decisions/[id]/outcome] failed", error);
    return NextResponse.json(
      { error: "שמירת התשובה נכשלה. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
