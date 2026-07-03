import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

  const [existing] = await db
    .select({ status: decisions.status })
    .from(decisions)
    .where(eq(decisions.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "ההחלטה לא נמצאה" }, { status: 404 });
  }
  if (existing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "ההחלטה כבר אושרה ונשלחה - לא ניתן לערוך אותה שוב" },
      { status: 409 }
    );
  }

  const now = new Date();

  const [decision] = await db
    .update(decisions)
    .set({
      ...parsed.data,
      status: "SENT",
      approvedAt: now,
      approvedByUserId: session.user.id,
      sentAt: now,
    })
    .where(eq(decisions.id, id))
    .returning();

  return NextResponse.json({ decision });
}
