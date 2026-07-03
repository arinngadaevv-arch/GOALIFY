import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Plus, Sparkles, Image as ImageIcon, Video } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { PLATFORM_LABELS, TONE_LABELS } from "@/lib/ai/types";

export default async function DashboardPage() {
  const session = await auth();
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session!.user.id))
    .orderBy(desc(projects.createdAt));

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">הפרויקטים שלי</h1>
          <p className="mt-1 text-sm text-muted">
            כל חבילות התוכן שיצרתם, במקום אחד.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
        >
          <Plus className="size-4" />
          יצירת תוכן חדש
        </Link>
      </div>

      {userProjects.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="grid size-14 place-items-center rounded-2xl gradient-brand">
            <Sparkles className="size-6 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-bold">עדיין אין לכם פרויקטים</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            צרו את חבילת התוכן הראשונה שלכם - זה לוקח פחות מדקה.
          </p>
          <Link
            href="/dashboard/new"
            className="mt-6 flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
          >
            <Plus className="size-4" />
            יצירת התוכן הראשון שלי
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group hover-lift rounded-2xl border border-border bg-surface/60 p-5 hover:border-neon-purple/50"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                  {project.platform === "INSTAGRAM" ? (
                    <ImageIcon className="size-3.5" />
                  ) : (
                    <Video className="size-3.5" />
                  )}
                  {PLATFORM_LABELS[project.platform]}
                </span>
                <span className="text-xs text-muted">
                  {new Date(project.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>
              <h3 className="mt-3 font-bold group-hover:text-neon-purple transition-colors">
                {project.businessType}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                {project.description}
              </p>
              <span className="mt-3 inline-block rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                {TONE_LABELS[project.tone]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
