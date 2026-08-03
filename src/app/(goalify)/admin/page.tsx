import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { checkoutEvents, users } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/goalify/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Kept outside the page component — a server component still counts as a
 * "render" to the purity lint rule, which flags `Date.now()` called
 * directly in one (see react-hooks/purity). */
function activeSinceDate() {
  return new Date(Date.now() - ACTIVE_WINDOW_MS);
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/home");
  }

  const activeSince = activeSinceDate();

  const [[userTotals], [checkoutTotals], userRows, latestCheckouts] =
    await Promise.all([
      db
        .select({
          totalUsers: sql<number>`count(*)`.mapWith(Number),
          activeUsers: sql<number>`count(*) filter (where ${users.lastActiveAt} >= ${activeSince})`.mapWith(
            Number,
          ),
        })
        .from(users),
      db
        .select({
          totalCheckouts: sql<number>`count(*)`.mapWith(Number),
          projectedRevenueCents: sql<number>`coalesce(sum(${checkoutEvents.priceCents}), 0)`.mapWith(
            Number,
          ),
        })
        .from(checkoutEvents),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          plan: users.plan,
          isAdmin: users.isAdmin,
          hasAcceptedTerms: users.hasAcceptedTerms,
          createdAt: users.createdAt,
          lastActiveAt: users.lastActiveAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(200),
      db
        .select({
          userId: checkoutEvents.userId,
          tierLabel: checkoutEvents.tierLabel,
          priceCents: checkoutEvents.priceCents,
          createdAt: checkoutEvents.createdAt,
        })
        .from(checkoutEvents)
        .orderBy(desc(checkoutEvents.createdAt)),
    ]);

  // One pass to keep only the most recent checkout per user — rows arrive
  // newest-first, so the first hit for a given userId wins.
  const latestCheckoutByUser = new Map<
    string,
    { tierLabel: string; priceCents: number; createdAt: Date }
  >();
  for (const row of latestCheckouts) {
    if (!latestCheckoutByUser.has(row.userId)) {
      latestCheckoutByUser.set(row.userId, row);
    }
  }

  const tableUsers = userRows.map((user) => {
    const latest = latestCheckoutByUser.get(user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isAdmin: user.isAdmin,
      hasAcceptedTerms: user.hasAcceptedTerms,
      createdAt: user.createdAt.toISOString(),
      lastActiveAt: user.lastActiveAt ? user.lastActiveAt.toISOString() : null,
      latestOrder: latest
        ? {
            tierLabel: latest.tierLabel,
            priceCents: latest.priceCents,
            createdAt: latest.createdAt.toISOString(),
          }
        : null,
    };
  });

  return (
    <AdminDashboard
      stats={{
        totalUsers: userTotals?.totalUsers ?? 0,
        activeUsers: userTotals?.activeUsers ?? 0,
        totalCheckouts: checkoutTotals?.totalCheckouts ?? 0,
        projectedRevenueCents: checkoutTotals?.projectedRevenueCents ?? 0,
      }}
      users={tableUsers}
    />
  );
}
