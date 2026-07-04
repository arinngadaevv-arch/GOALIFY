import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generatedContent,
  planDays,
  projects,
  weeklyPlans,
} from "@/lib/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const { id } = await params;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "הפרויקט לא נמצא" }, { status: 404 });
  }

  const [content] = await db
    .select()
    .from(generatedContent)
    .where(eq(generatedContent.projectId, project.id))
    .limit(1);

  const [weeklyPlan] = await db
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.projectId, project.id))
    .limit(1);

  const days = weeklyPlan
    ? await db
        .select()
        .from(planDays)
        .where(eq(planDays.weeklyPlanId, weeklyPlan.id))
        .orderBy(asc(planDays.dayIndex))
    : [];

  return NextResponse.json({
    project,
    content: content?.ideas ?? null,
    weeklyPlan: weeklyPlan ? { ...weeklyPlan, days } : null,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר תחילה" }, { status: 401 });
  }

  const { id } = await params;

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "הפרויקט לא נמצא" }, { status: 404 });
  }

  await db.delete(projects).where(eq(projects.id, project.id));

  return NextResponse.json({ ok: true });
}
