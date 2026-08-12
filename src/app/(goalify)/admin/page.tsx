import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { analyticsEvents, checkoutEvents, users } from "@/lib/db/schema";
import { AdminDashboard } from "@/components/goalify/admin/admin-dashboard";
import type { Goal, Level } from "@/lib/goalify/types";
import { CHECKOUT_TIERS, getVariantId } from "@/lib/lemonsqueezy";
import { getWhopApiKey, getWhopCompanyId, getWhopPlanId } from "@/lib/whop";
import { getPricingTier } from "@/lib/goalify/pricing";
import { QUIZ_STEPS } from "@/lib/goalify/quiz";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

const ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const VISITOR_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Kept outside the page component — a server component still counts as a
 * "render" to the purity lint rule, which flags `Date.now()` called
 * directly in one (see react-hooks/purity). */
function activeSinceDate() {
  return new Date(Date.now() - ACTIVE_WINDOW_MS);
}

function visitorSinceDate() {
  return new Date(Date.now() - VISITOR_WINDOW_MS);
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** One row per bucket with at least one visitor — VisitorTrendChart fills
 * in the zero-visitor buckets client-side, since a `GROUP BY` naturally
 * omits empty groups. `unit` is interpolated directly into `date_trunc(...)`,
 * never from request input — always one of the four literal strings this
 * file calls it with below, so there's no injection surface. */
function visitTrendQuery(unit: "hour" | "day" | "week" | "month", since: Date) {
  // `unit` is inlined as a raw SQL literal, not a bound parameter — passing
  // it as `${unit}` instead left Postgres unable to resolve date_trunc's
  // overload at prepare time ("could not determine polymorphic type") since
  // a bound parameter carries no type info there. Safe here regardless:
  // this function is only ever called from the four hardcoded call sites
  // below, never with request input.
  const truncated = sql.raw(`date_trunc('${unit}', "analytics_event"."created_at")`);
  return db
    .select({
      // postgres.js parses a `timestamp`-typed result (which date_trunc
      // returns here) into a JS Date regardless of this query's declared
      // TS type, so mapWith normalizes it to a real ISO string either way
      // rather than trusting the type annotation alone.
      bucket: sql<string>`${truncated}`.mapWith((value) => new Date(value as string | Date).toISOString()),
      visitors: sql<number>`count(distinct ${analyticsEvents.visitorId})`.mapWith(Number),
    })
    .from(analyticsEvents)
    .where(
      sql`${analyticsEvents.kind} = 'LANDING_VIEW' and ${analyticsEvents.createdAt} >= ${since.toISOString()}`,
    )
    .groupBy(truncated)
    .orderBy(truncated);
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/home");
  }

  const activeSince = activeSinceDate();
  const visitorSince = visitorSinceDate();

  const [
    [userTotals],
    [checkoutTotals],
    userRows,
    latestCheckouts,
    [visitorTotals],
    deviceRows,
    countryRows,
    stepReachRows,
    hourlyVisitorRows,
    dailyVisitorRows,
    weeklyVisitorRows,
    monthlyVisitorRows,
  ] = await Promise.all([
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
      // Pre-signup visitor counts — see db/schema.ts's analyticsEvents.
      // "Visitors" here means distinct anonymous cookies, not raw pageview
      // events (someone refreshing the landing page ten times is one
      // visitor, not ten).
      db
        .select({
          allTime: sql<number>`count(distinct ${analyticsEvents.visitorId}) filter (where ${analyticsEvents.kind} = 'LANDING_VIEW')`.mapWith(
            Number,
          ),
          last30d: sql<number>`count(distinct ${analyticsEvents.visitorId}) filter (where ${analyticsEvents.kind} = 'LANDING_VIEW' and ${analyticsEvents.createdAt} >= ${visitorSince.toISOString()})`.mapWith(
            Number,
          ),
          quizCompleters: sql<number>`count(distinct ${analyticsEvents.visitorId}) filter (where ${analyticsEvents.kind} = 'QUIZ_COMPLETE')`.mapWith(
            Number,
          ),
        })
        .from(analyticsEvents),
      db
        .select({
          device: analyticsEvents.device,
          visitors: sql<number>`count(distinct ${analyticsEvents.visitorId})`.mapWith(Number),
        })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.device} is not null`)
        .groupBy(analyticsEvents.device),
      // Distinct visitors per country — see analyticsEvents.country. Only
      // populated on Vercel (local dev/other hosts never send the header),
      // so this stays empty outside production.
      db
        .select({
          country: analyticsEvents.country,
          visitors: sql<number>`count(distinct ${analyticsEvents.visitorId})`.mapWith(Number),
        })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.country} is not null`)
        .groupBy(analyticsEvents.country)
        .orderBy(desc(sql`count(distinct ${analyticsEvents.visitorId})`)),
      // One row per visitor who reached at least one quiz question, with
      // the furthest step they got to — the funnel below turns this into
      // "N distinct people reached question K" per question by counting,
      // for each K, how many of these rows have maxStep >= K. Computed in
      // JS rather than a SQL window function since the row count here
      // (one per visitor, not per event) stays small at any realistic
      // scale and this is far easier to read and verify.
      db
        .select({
          visitorId: analyticsEvents.visitorId,
          maxStep: sql<number>`max(${analyticsEvents.stepIndex})`.mapWith(Number),
        })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.kind, "QUIZ_STEP"))
        .groupBy(analyticsEvents.visitorId),
      // Visitor trend chart — see VisitorTrendChart. Four separate
      // date_trunc granularities rather than one fine-grained query
      // resummed client-side, because summing daily unique-visitor counts
      // into a week double-counts anyone who visited on more than one day
      // that week. date_trunc('week'/'month', ...) gives the *true*
      // distinct count for that bucket straight from Postgres, no
      // approximation.
      visitTrendQuery("hour", hoursAgo(48)),
      visitTrendQuery("day", daysAgo(30)),
      visitTrendQuery("week", daysAgo(91)),
      visitTrendQuery("month", daysAgo(365)),
    ]);

  const quizStepFunnel = QUIZ_STEPS.map((quizStep, index) => ({
    id: quizStep.id,
    title: quizStep.title,
    reached: stepReachRows.filter((row) => row.maxStep >= index).length,
  }));

  const deviceSplit = {
    mobile: deviceRows.find((row) => row.device === "MOBILE")?.visitors ?? 0,
    desktop: deviceRows.find((row) => row.device === "DESKTOP")?.visitors ?? 0,
  };

  const visitorTrend = {
    hourly: hourlyVisitorRows,
    daily: dailyVisitorRows,
    weekly: weeklyVisitorRows,
    monthly: monthlyVisitorRows,
  };

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
    apiKey: Boolean(getWhopApiKey()),
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
      visitors={{
        allTime: visitorTotals?.allTime ?? 0,
        last30d: visitorTotals?.last30d ?? 0,
        quizCompleters: visitorTotals?.quizCompleters ?? 0,
      }}
      deviceSplit={deviceSplit}
      countrySplit={countryRows}
      quizStepFunnel={quizStepFunnel}
      visitorTrend={visitorTrend}
      users={tableUsers}
      checkoutConfig={checkoutConfig}
      whopCheckoutConfig={whopCheckoutConfig}
    />
  );
}
