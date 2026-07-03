import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, decisions, outcomes } from "@/lib/db/schema";

const bodySchema = z.object({
  result: z.enum([
    "MORE_VIEWS",
    "MORE_MESSAGES",
    "MORE_COMMENTS",
    "NOTHING",
    "OTHER",
  ]),
  resultNote: z.string().max(500).optional(),
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

  const [row] = await db
    .select({ businessUserId: businesses.userId })
    .from(decisions)
    .innerJoin(businesses, eq(decisions.businessId, businesses.id))
    .where(eq(decisions.id, id))
    .limit(1);

  if (!row || row.businessUserId !== session.user.id) {
    return NextResponse.json({ error: "ההחלטה לא נמצאה" }, { status: 404 });
  }

  const [existingOutcome] = await db
    .select()
    .from(outcomes)
    .where(eq(outcomes.decisionId, id))
    .limit(1);

  if (!existingOutcome) {
    return NextResponse.json(
      { error: "יש לענות קודם על השאלות המיידיות" },
      { status: 409 }
    );
  }
  if (existingOutcome.followupAnsweredAt) {
    return NextResponse.json(
      { error: "כבר ענית על השאלה הזו" },
      { status: 409 }
    );
  }

  const [outcome] = await db
    .update(outcomes)
    .set({
      result: parsed.data.result,
      resultNote: parsed.data.resultNote ?? null,
      followupAnsweredAt: new Date(),
    })
    .where(and(eq(outcomes.decisionId, id)))
    .returning();

  return NextResponse.json({ outcome });
}
