import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decisions } from "@/lib/db/schema";
import { isUserAdmin } from "@/lib/admin";

const alternativeSchema = z.object({
  hypothesis: z.string(),
  whyRejected: z.string(),
});

// All fields optional - the admin can send the draft as-is, or edit any subset
// before sending. Editing here is the "correct" step of Draft -> Approved ->
// Sent; once sent, this route refuses to touch the decision again.
const approveSchema = z.object({
  diagnosis: z.string().min(1).optional(),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  confidenceReasoning: z.string().min(1).optional(),
  evidence: z.array(z.string()).optional(),
  alternativesConsidered: z.array(alternativeSchema).optional(),
  moveType: z.enum(["EXPLOIT", "EXPLORE"]).optional(),
  moveChannel: z
    .enum([
      "REEL",
      "STORY",
      "DM_OUTREACH",
      "CALL",
      "PRICE_CHANGE",
      "REPLY_TO_COMMENTS",
      "NONE",
      "OTHER",
    ])
    .optional(),
  moveDescription: z.string().min(1).optional(),
  executionAsset: z.string().nullable().optional(),
  estimatedMinutes: z.number().nullable().optional(),
  falsificationCriteria: z.string().min(1).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }
  if (!(await isUserAdmin(session.user.id))) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" },
      { status: 400 }
    );
  }

  try {
    const now = new Date();

    // Atomic check-and-set: the WHERE clause requires status still DRAFT, so
    // two concurrent approve clicks (or two admins) can't both succeed - only
    // the first UPDATE actually matches a row.
    const [decision] = await db
      .update(decisions)
      .set({
        ...parsed.data,
        status: "SENT",
        approvedAt: now,
        approvedByUserId: session.user.id,
        sentAt: now,
      })
      .where(and(eq(decisions.id, id), eq(decisions.status, "DRAFT")))
      .returning();

    if (!decision) {
      const [existing] = await db
        .select({ status: decisions.status })
        .from(decisions)
        .where(eq(decisions.id, id))
        .limit(1);

      return NextResponse.json(
        {
          error: existing
            ? "ההחלטה כבר אושרה ונשלחה - לא ניתן לערוך אותה שוב"
            : "ההחלטה לא נמצאה",
        },
        { status: existing ? 409 : 404 }
      );
    }

    return NextResponse.json({ decision });
  } catch (error) {
    console.error("[POST /api/admin/decisions/[id]/approve] failed", error);
    return NextResponse.json(
      { error: "אישור ההחלטה נכשל. נסו שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
