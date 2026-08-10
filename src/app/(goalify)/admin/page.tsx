import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { checkoutEvents, users } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/goalify/admin/admin-dashboard";
import type { Goal, Level } from "@/lib/goalify/types";
import { CHECKOUT_TIERS, getVariantId } from "@/lib/lemonsqueezy";
import { getWhopCompanyId, getWhopPlanId } from "@/lib/whop";
import { getPricingTier } from "@/lib/goalify/pricing";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
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
          // postgres.js can't parameterize a raw `Date` object inside a
          // tagged `sql` template (throws `ERR_INVALID_ARG_TYPE` at query
          // time, not at build time) — an ISO string serializes cleanly and
          // Postgres casts it against the timestamp column itself.
          activeUsers: sql<number>`count(*) filter (where ${users.lastActiveAt} >= ${activeSince.toISOString()})`.mapWith(
            Number,
          ),
          // The three funnel stages between "signed up" and "paying" — each
          // a real, independently-written signal (quiz sync, the paywall's
          // own fire-and-forget view ping, and users.plan set only by the
          // Lemon Squeezy webhook), not derived/estimated from one another.
          completedQuiz: sql<number>`count(*) filter (where ${users.quizCompletedAt} is not null)`.mapWith(
            Number,
          ),
          reachedPaywall: sql<number>`count(*) filter (where ${users.paywallViewedAt} is not null)`.mapWith(
            Number,
          ),
          activeSubscribers: sql<number>`count(*) filter (where ${users.plan} != 'FREE')`.mapWith(
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
          quizGoal: users.quizGoal,
          quizLevel: users.quizLevel,
          quizDaysPerWeek: users.quizDaysPerWeek,
          quizCompletedAt: users.quizCompletedAt,
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
      // quizGoal/quizLevel are plain `text` columns (not DB enums) — the API
      // route that writes them (api/user/quiz/route.ts) validates against
      // this same Goal/Level union before ever setting them, so the cast
      // here just reflects that already-enforced invariant.
      quiz: user.quizCompletedAt
        ? {
            goal: user.quizGoal as Goal | null,
            level: user.quizLevel as Level | null,
            daysPerWeek: user.quizDaysPerWeek,
            completedAt: user.quizCompletedAt.toISOString(),
          }
        : null,
      latestOrder: latest
        ? {
            tierLabel: latest.tierLabel,
            priceCents: latest.priceCents,
            createdAt: latest.createdAt.toISOString(),
          }
        : null,
    };
  });

  // Reads the exact same env vars, through the exact same helper
  // (getVariantId), that api/checkout/route.ts reads on every request — so
  // this panel can never drift from what actually decides the 503. Booleans
  // only; no secret value is ever passed to the client.
  const checkoutConfig = {
    storeId: Boolean(process.env.LEMONSQUEEZY_STORE_ID),
    apiKey: Boolean(process.env.LEMONSQUEEZY_API_KEY),
    webhookSecret: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET),
    variants: CHECKOUT_TIERS.map((tier) => ({
      tier,
      label: getPricingTier(tier).label,
      configured: Boolean(getVariantId(tier)),
    })),
  };

  // Same pattern as checkoutConfig above, read through the exact same
  // helper (getWhopPlanId) api/checkout/whop/route.ts uses on every request.
  const whopCheckoutConfig = {
    apiKey: Boolean(process.env.WHOP_API_KEY),
    webhookSecret: Boolean(process.env.WHOP_WEBHOOK_SECRET),
    companyId: Boolean(getWhopCompanyId()),
    plans: CHECKOUT_TIERS.map((tier) => ({
      tier,
      label: getPricingTier(tier).label,
      configured: Boolean(getWhopPlanId(tier)),
    })),
  };

  return (
    <AdminDashboard
      stats={{
        totalUsers: userTotals?.totalUsers ?? 0,
        activeUsers: userTotals?.activeUsers ?? 0,
        totalCheckouts: checkoutTotals?.totalCheckouts ?? 0,
        projectedRevenueCents: checkoutTotals?.projectedRevenueCents ?? 0,
      }}
      funnel={{
        signedUp: userTotals?.totalUsers ?? 0,
        completedQuiz: userTotals?.completedQuiz ?? 0,
        reachedPaywall: userTotals?.reachedPaywall ?? 0,
        activeSubscribers: userTotals?.activeSubscribers ?? 0,
      }}
      users={tableUsers}
      checkoutConfig={checkoutConfig}
      whopCheckoutConfig={whopCheckoutConfig}
    />
  );
}
