import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { getUserPlan, PLAN_LIMITS, getTodayGenerationCount } from "@/lib/usage";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [plan, used] = await Promise.all([
    getUserPlan(session.user.id),
    getTodayGenerationCount(session.user.id),
  ]);
  const limit = PLAN_LIMITS[plan].dailyGenerations;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" />
            <nav className="hidden items-center gap-1 text-sm md:flex">
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                הפרויקטים שלי
              </Link>
              <Link
                href="/dashboard/account"
                className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                החשבון שלי
              </Link>
              <Link
                href="/pricing"
                className="rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                מחירים
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/account"
              className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground sm:inline-block"
            >
              {PLAN_LIMITS[plan].label}
              {limit !== Infinity ? ` · ${used}/${limit} יצירות היום` : " · ללא הגבלה"}
            </Link>
            <Link
              href="/dashboard/new"
              className="flex items-center gap-1.5 rounded-full gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md shadow-pink-500/20 transition-transform hover:scale-105"
            >
              <Plus className="size-4" />
              יצירה
            </Link>
            <UserMenu name={session.user.name} email={session.user.email} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
