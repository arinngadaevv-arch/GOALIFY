import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Lock, Plus, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { getUserPlan } from "@/lib/usage";
import { getPlanFeatures } from "@/lib/plan-features";
import { nicheLabel } from "@/lib/niche";

export default async function DashboardPage() {
  const session = await auth();
  const userBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session!.user.id))
    .orderBy(desc(businesses.createdAt));

  const features = getPlanFeatures(await getUserPlan(session!.user.id));
  const atBusinessLimit = userBusinesses.length >= features.maxBusinesses;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold">העסקים שלי</h1>
          <p className="mt-1 text-sm text-muted">
            אבחון והחלטה אחת בכל פעם - לא עוד מסכי תוכן.
          </p>
        </div>
        {userBusinesses.length > 0 &&
          (atBusinessLimit ? (
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-full border border-neon-purple/50 bg-neon-purple/10 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-neon-purple/20"
            >
              <Lock className="size-4 text-neon-purple" />
              נהלו עוד עסקים עם Pro
            </Link>
          ) : (
            <Link
              href="/dashboard/business/new"
              className="flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
            >
              <Plus className="size-4" />
              הוספת עסק
            </Link>
          ))}
      </div>

      {userBusinesses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="grid size-14 place-items-center rounded-2xl gradient-brand">
            <Sparkles className="size-6 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-bold">בואו נכיר את העסק שלך</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            כמה שאלות קצרות, ונתחיל לתת לך החלטה אחת ברורה בכל פעם.
          </p>
          <Link
            href="/dashboard/business/new"
            className="mt-6 flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
          >
            <Plus className="size-4" />
            הוספת העסק הראשון שלי
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userBusinesses.map((business) => (
            <Link
              key={business.id}
              href={`/dashboard/business/${business.id}`}
              className="group hover-lift rounded-2xl border border-border bg-surface/60 p-5 hover:border-neon-purple/50"
            >
              <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                {nicheLabel(business.niche)}
              </span>
              <h3 className="mt-3 font-bold group-hover:text-neon-purple transition-colors">
                {business.name}
              </h3>
              <p className="mt-1.5 text-xs text-muted">
                נוסף ב-{new Date(business.createdAt).toLocaleDateString("he-IL")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
