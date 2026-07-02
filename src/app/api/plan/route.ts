import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { planDays, projects, weeklyPlans } from "@/lib/db/schema";
import { generateWeeklyPlan } from "@/lib/ai/generate";
import type { BusinessInput } from "@/lib/ai/types";

const bodySchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, parsed.data.projectId),
        eq(projects.userId, session.user.id)
      )
    )
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "הפרויקט לא נמצא" }, { status: 404 });
  }

  try {
    const input: BusinessInput = {
      businessType: project.businessType,
      description: project.description,
      targetAudience: project.targetAudience,
      tone: project.tone,
      platform: project.platform,
    };

    const plan = await generateWeeklyPlan(input);

    const [existing] = await db
      .select({ id: weeklyPlans.id })
      .from(weeklyPlans)
      .where(eq(weeklyPlans.projectId, project.id))
      .limit(1);

    if (existing) {
      await db.delete(weeklyPlans).where(eq(weeklyPlans.id, existing.id));
    }

    const [weeklyPlan] = await db
      .insert(weeklyPlans)
      .values({ projectId: project.id })
      .returning();

    const days = await db
      .insert(planDays)
      .values(
        plan.days.map((day) => ({
          weeklyPlanId: weeklyPlan.id,
          dayIndex: day.dayIndex,
          idea: day.idea,
          contentType: day.contentType,
          goal: day.goal,
        }))
      )
      .returning();

    return NextResponse.json({ weeklyPlan, days }, { status: 201 });
  } catch (error) {
    console.error("[/api/plan] failed", error);
    return NextResponse.json(
      { error: "יצירת התוכנית השבועית נכשלה. נסה שוב בעוד רגע." },
      { status: 500 }
    );
  }
}
