import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generatedContent,
  planDays,
  projects,
  weeklyPlans,
} from "@/lib/db/schema";
import type { GeneratedContentResult } from "@/lib/ai/types";
import { PLATFORM_LABELS, TONE_LABELS } from "@/lib/ai/types";
import { ViralityBadge } from "@/components/virality-badge";
import { ProjectActions } from "@/components/project-actions";
import { WeeklyPlanSection } from "@/components/weekly-plan-section";
import { Hash, Camera, MicVocal, Target } from "lucide-react";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session!.user.id)))
    .limit(1);

  if (!project) notFound();

  const [contentRow] = await db
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

  const content = contentRow?.ideas as GeneratedContentResult | undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">{project.businessType}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            {project.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {PLATFORM_LABELS[project.platform]}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {TONE_LABELS[project.tone]}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              קהל: {project.targetAudience}
            </span>
          </div>
        </div>
        {content && (
          <ProjectActions project={project} content={content} days={days} />
        )}
      </div>

      {!content ? (
        <p className="mt-10 text-muted">לא נמצא תוכן עבור פרויקט זה.</p>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-lg font-bold">5 רעיונות לסרטונים ויראליים</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {content.ideas.map((idea, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-surface/60 p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{idea.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted">{idea.concept}</p>
                  <div className="mt-3">
                    <ViralityBadge score={idea.viralityScore} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {idea.viralityReason}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-lg font-bold">3 תסריטים מלאים</h2>
            <div className="mt-4 space-y-5">
              {content.scripts.map((script, i) => (
                <article
                  key={i}
                  id={`script-${i}`}
                  className="gradient-border rounded-2xl bg-surface p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold">{script.title}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {script.durationSeconds} שניות
                      </p>
                    </div>
                    <ViralityBadge score={script.viralityScore} />
                  </div>

                  <div className="mt-4 rounded-xl bg-surface-2 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-neon-pink">
                      <MicVocal className="size-3.5" /> Hook - 3 השניות הראשונות
                    </p>
                    <p className="mt-1.5 text-sm">{script.hook}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold text-muted">
                      תסריט מלא
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
                      {script.scriptBody}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-muted">
                      <Camera className="size-3.5" /> פירוק צילום שלב-אחר-שלב
                    </p>
                    <ol className="mt-2 space-y-1.5">
                      {script.shotBreakdown.map((shot, si) => (
                        <li key={si} className="flex gap-2 text-sm">
                          <span className="shrink-0 text-neon-blue">
                            {si + 1}.
                          </span>
                          <span>{shot}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold text-muted">כיתוב לפוסט</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm">
                      {script.caption}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                    <Hash className="size-3.5 text-muted" />
                    {script.hashtags.map((tag) => (
                      <span
                        key={tag}
                        dir="ltr"
                        className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-neon-blue"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-neon-purple/30 bg-neon-purple/5 px-4 py-3">
                    <Target className="size-4 shrink-0 text-neon-purple" />
                    <p className="text-sm font-medium">{script.cta}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 mb-16">
            <WeeklyPlanSection
              projectId={project.id}
              initialDays={days.map((d) => ({
                dayIndex: d.dayIndex,
                idea: d.idea,
                contentType: d.contentType,
                goal: d.goal,
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}
