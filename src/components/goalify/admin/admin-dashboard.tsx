"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Crown,
  Loader2,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { Pill } from "@/components/goalify/ui/stat";
import { goalLabel, levelLabel } from "@/lib/goalify/plan";
import type { Goal, Level } from "@/lib/goalify/types";
import { allKnownClips, diagnoseSupabaseUrl } from "@/lib/goalify/video";

type PlanTier = "FREE" | "PRO" | "BUSINESS";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  plan: PlanTier;
  isAdmin: boolean;
  hasAcceptedTerms: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  quiz: { goal: Goal | null; level: Level | null; daysPerWeek: number | null; completedAt: string } | null;
  latestOrder: { tierLabel: string; priceCents: number; createdAt: string } | null;
};

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalCheckouts: number;
  projectedRevenueCents: number;
};

export type FunnelStats = {
  signedUp: number;
  completedQuiz: number;
  reachedPaywall: number;
  activeSubscribers: number;
};

export type CheckoutConfig = {
  storeId: boolean;
  apiKey: boolean;
  webhookSecret: boolean;
  variants: { tier: string; label: string; configured: boolean }[];
};

export type WhopCheckoutConfig = {
  apiKey: boolean;
  webhookSecret: boolean;
  plans: { tier: string; label: string; configured: boolean }[];
};

type DiagnosticResult = {
  tier: string;
  label: string;
  variantId: string | null;
  ok: boolean;
  expectedCents: number;
  actualCents?: number | null;
  statusCode?: number | null;
  error?: string;
  cause?: string;
};

type WhopDiagnosticResult = {
  tier: string;
  label: string;
  planId: string | null;
  ok: boolean;
  statusCode?: number;
  error?: string;
  raw?: string;
  purchaseUrl?: string;
};

const PLAN_OPTIONS: PlanTier[] = ["FREE", "PRO", "BUSINESS"];

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminDashboard({
  stats,
  funnel,
  users,
  checkoutConfig,
  whopCheckoutConfig,
}: {
  stats: AdminStats;
  funnel: FunnelStats;
  users: AdminUserRow[];
  checkoutConfig: CheckoutConfig;
  whopCheckoutConfig: WhopCheckoutConfig;
}) {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanTier | "ALL">("ALL");

  const filteredUsers = users.filter((user) => {
    if (planFilter !== "ALL" && user.plan !== planFilter) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      user.email.toLowerCase().includes(needle) ||
      (user.name ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <div className="gf-cyber-scope min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/home"
              className="flex items-center gap-1.5 text-xs font-bold text-mist hover:text-electric"
            >
              <ArrowLeft className="size-3.5" /> Back to app
            </Link>
            <h1 className="gf-display mt-2 text-3xl font-black text-ink sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-mist">
              Owner-only view — high-level stats and account management.
            </p>
          </div>
        </div>

        {/* --------------------------------------------------------- Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total users"
            value={stats.totalUsers.toLocaleString("en-US")}
          />
          <StatCard
            icon={ShieldCheck}
            label="Active (7d)"
            value={stats.activeUsers.toLocaleString("en-US")}
          />
          <StatCard
            icon={CheckCircle2}
            label="Orders"
            value={stats.totalCheckouts.toLocaleString("en-US")}
          />
          <StatCard
            icon={CircleDollarSign}
            label="Revenue"
            value={formatMoney(stats.projectedRevenueCents)}
          />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-haze">
          &ldquo;Orders&rdquo; and &ldquo;Revenue&rdquo; are written only by
          Lemon Squeezy&apos;s <code>order_created</code> webhook or Whop&apos;s{" "}
          <code>payment.succeeded</code> webhook once a payment has actually
          settled — nothing here reflects a checkout that was started but not
          completed.
        </p>

        {/* --------------------------------------------------------- Funnel */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Analytics
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-haze">
            Total signups plus each real stage in between: quiz completion is
            synced once the client posts a summary, &ldquo;reached
            paywall&rdquo; is a fire-and-forget ping the paywall itself sends
            on load, and &ldquo;active subscribers&rdquo; reads{" "}
            <code>users.plan</code> — the same field the app itself gates
            real routes on. None of these are estimated from each other.
          </p>
          <FunnelChart funnel={funnel} />
        </section>

        {/* ---------------------------------------------- Checkout config */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Checkout config
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-haze">
            Live read of the server&apos;s env vars — the exact same check
            api/checkout runs before it will start a checkout. A red{" "}
            &ldquo;Missing&rdquo; here is why the paywall shows &ldquo;Checkout
            isn&apos;t available right now&rdquo; (503), and it means the var
            below isn&apos;t set for this deployment. If you just added it in
            the hosting dashboard, that host still needs a fresh
            deploy/redeploy to pick it up — saving the value alone doesn&apos;t
            reach an already-running server.
          </p>
          <GlassCard deep className="mt-3 flex flex-wrap gap-2 p-4">
            <ConfigPill label="Store ID" ok={checkoutConfig.storeId} />
            <ConfigPill label="API key" ok={checkoutConfig.apiKey} />
            <ConfigPill label="Webhook secret" ok={checkoutConfig.webhookSecret} />
            {checkoutConfig.variants.map((variant) => (
              <ConfigPill
                key={variant.tier}
                label={`${variant.label} variant`}
                ok={variant.configured}
              />
            ))}
          </GlassCard>
          <CheckoutDiagnosticsPanel />
        </section>

        {/* --------------------------------------------------- Whop checkout */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Whop checkout
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-haze">
            API key and plan pills are the exact same check api/checkout/whop
            runs before it will start a checkout — a red &ldquo;Missing&rdquo;
            on any of those is why the paywall shows &ldquo;Could not start
            checkout&rdquo;. The webhook secret pill is separate: it&apos;s
            read by api/webhooks/whop, not api/checkout/whop, so it has no
            effect on whether checkout starts — it only controls whether a
            completed payment can be auto-credited (see the note under Users
            &amp; plans below). If you just added a var in Vercel, it still
            needs a fresh redeploy to actually reach this already-running
            server — saving the value alone doesn&apos;t do it.
          </p>
          <GlassCard deep className="mt-3 flex flex-wrap gap-2 p-4">
            <ConfigPill label="API key" ok={whopCheckoutConfig.apiKey} />
            {whopCheckoutConfig.plans.map((plan) => (
              <ConfigPill
                key={plan.tier}
                label={`${plan.label} plan`}
                ok={plan.configured}
              />
            ))}
          </GlassCard>
          <WhopCheckoutDiagnosticsPanel />

          <GlassCard deep className="mt-3 flex items-start gap-2.5 p-4">
            <ConfigPill label="Webhook secret (auto-credit only, not checkout)" ok={whopCheckoutConfig.webhookSecret} />
          </GlassCard>
        </section>

        {/* ------------------------------------------ Lemon Squeezy variants */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Lemon Squeezy variants
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-haze">
            Pulls the real, live list of variants Lemon Squeezy has for this
            store — a 404 from checkout means the configured variant id
            below simply doesn&apos;t exist on this list (recreated, deleted,
            or copied from the wrong store). Compare the configured id
            against the real ones here and fix it directly in Vercel&apos;s
            env vars.
          </p>
          <LemonSqueezyVariantsPanel />
        </section>

        {/* -------------------------------------------------- Workout videos */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Workout videos
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-haze">
            If the live workout player is only showing the stick-figure
            placeholder instead of real clips, it&apos;s always one of three
            things: <code>NEXT_PUBLIC_SUPABASE_URL</code> isn&apos;t set (or
            redeployed after being set — it&apos;s baked into the JS bundle
            at build time), the Storage bucket named &ldquo;videos&rdquo;
            isn&apos;t actually public, or an uploaded filename doesn&apos;t
            exactly match what&apos;s expected below. This checks all three
            directly in your browser — nothing here touches the server.
          </p>
          <VideoDiagnosticsPanel />
        </section>

        {/* --------------------------------------------------------- Users */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Users &amp; plans
          </h2>
          <GlassCard deep tone="electric" className="mt-3 flex items-start gap-2.5 p-4">
            <Zap className="mt-0.5 size-4 shrink-0 text-electric" />
            <p className="text-[11px] leading-relaxed text-ink-soft">
              <span className="font-bold text-ink">
                Whop payments now activate accounts automatically
              </span>{" "}
              — no manual step needed for a normal purchase. The table below
              is for the exceptions: comping someone free access, fixing a
              payment Whop&apos;s webhook couldn&apos;t match to an account,
              or a downgrade/refund. Find the person by name or email and use
              the <span className="font-mono">Plan status</span> dropdown (or
              the quick &ldquo;Grant PRO&rdquo; button) — it takes effect
              immediately, no redeploy needed.
            </p>
          </GlassCard>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-haze" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border border-ink/10 bg-transparent py-2 pr-3 pl-8 text-sm text-ink outline-none placeholder:text-haze focus:border-electric/40"
              />
            </div>
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value as PlanTier | "ALL")}
              className="rounded-xl border border-ink/10 bg-transparent px-3 py-2 text-xs font-bold text-ink outline-none focus:border-electric/40"
            >
              <option value="ALL">All plans</option>
              {PLAN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <GlassCard deep className="mt-3 overflow-x-auto p-0">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-left text-[11px] font-bold tracking-[0.08em] text-mist uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan status</th>
                  <th className="px-4 py-3">Terms</th>
                  <th className="px-4 py-3">Quiz</th>
                  <th className="px-4 py-3">Latest order</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-mist">
                      {users.length === 0
                        ? "No users yet."
                        : "No users match this search/filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}

function FunnelChart({ funnel }: { funnel: FunnelStats }) {
  const stages = [
    { icon: UserPlus, label: "Signed up", value: funnel.signedUp },
    { icon: ClipboardCheck, label: "Completed questionnaire", value: funnel.completedQuiz },
    { icon: CreditCard, label: "Reached paywall", value: funnel.reachedPaywall },
    { icon: Crown, label: "Active subscribers", value: funnel.activeSubscribers },
  ];
  const base = funnel.signedUp || 1;

  return (
    <GlassCard deep className="mt-3 flex flex-col gap-4 p-4">
      {stages.map((stage) => {
        const pct = Math.round((stage.value / base) * 100);
        return (
          <div key={stage.label}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-ink">
                <stage.icon className="size-3.5 text-electric" />
                {stage.label}
              </span>
              <span className="gf-numeric font-extrabold text-ink">
                {stage.value.toLocaleString("en-US")}
                <span className="ml-1.5 font-semibold text-mist">{pct}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-electric to-lime-neon"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>
          </div>
        );
      })}
    </GlassCard>
  );
}

function ConfigPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Pill tone={ok ? "lime" : "neutral"}>
      {ok ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
      {label} · {ok ? "Configured" : "Missing"}
    </Pill>
  );
}

type LemonSqueezyVariant = {
  variantId: string;
  variantName: string;
  productName: string;
  status: string;
  priceCents: number;
  interval: string | null;
  intervalCount: number | null;
};

type TierCheck = {
  tier: string;
  label: string;
  configuredId: string | null;
  expectedCents: number;
  existsInStore: boolean;
  suggestion: { variantId: string; variantName: string } | null;
};

function billingSummary(variant: LemonSqueezyVariant) {
  if (!variant.interval) return "one-time";
  const count = variant.intervalCount ?? 1;
  return count === 1 ? `every ${variant.interval}` : `every ${count} ${variant.interval}s`;
}

type ClipCheck = {
  label: string;
  fileName: string;
  url: string | null;
  status: "unconfigured" | "checking" | "ok" | "error";
  httpStatus?: number;
  detail?: string;
};

/**
 * Checks every workout clip's real URL directly from the browser — no
 * server round trip needed, since NEXT_PUBLIC_SUPABASE_URL is already
 * inlined into this client bundle at build time, same as what
 * AIFormGuide/video.ts use to build these URLs in the first place. A HEAD
 * request per clip distinguishes "bucket not public" (403), "wrong
 * filename" (404), and "works fine" (200) instead of every failure
 * collapsing into the same silent placeholder.
 */
function VideoDiagnosticsPanel() {
  const urlProblem = diagnoseSupabaseUrl();
  const [checks, setChecks] = useState<ClipCheck[] | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const clips = allKnownClips();
    const initial: ClipCheck[] = clips.map((clip) => ({
      ...clip,
      status: clip.url ? "checking" : "unconfigured",
    }));
    setChecks(initial);

    await Promise.all(
      clips.map(async (clip, i) => {
        if (!clip.url) return;
        try {
          const res = await fetch(clip.url, { method: "HEAD", cache: "no-store" });
          setChecks((prev) => {
            if (!prev) return prev;
            const next = [...prev];
            next[i] = {
              ...next[i],
              status: res.ok ? "ok" : "error",
              httpStatus: res.status,
              detail: res.ok
                ? undefined
                : res.status === 404
                  ? "Not found — filename doesn't match what's uploaded."
                  : res.status === 403 || res.status === 400
                    ? "Forbidden — the bucket or file likely isn't public yet."
                    : `Unexpected status ${res.status}.`,
            };
            return next;
          });
        } catch {
          setChecks((prev) => {
            if (!prev) return prev;
            const next = [...prev];
            next[i] = {
              ...next[i],
              status: "error",
              detail:
                "Request failed (network error or CORS) — open the URL directly in a new tab to check manually.",
            };
            return next;
          });
        }
      }),
    );
    setRunning(false);
  }

  return (
    <div className="mt-3">
      <GlassCard deep className="flex flex-wrap items-center gap-2 p-4">
        <Pill tone={urlProblem ? "neutral" : "lime"}>
          {urlProblem ? <XCircle className="size-3" /> : <CheckCircle2 className="size-3" />}
          NEXT_PUBLIC_SUPABASE_URL · {urlProblem ?? "looks valid"}
        </Pill>
      </GlassCard>

      <button
        type="button"
        onClick={run}
        disabled={running}
        className="gf-press mt-3 flex items-center gap-2 rounded-xl border border-electric/30 bg-electric/8 px-4 py-2 text-xs font-bold text-electric transition-colors hover:bg-electric/14 disabled:opacity-60"
      >
        {running && <Loader2 className="size-3.5 animate-spin" />}
        Check video files
      </button>

      {checks && (
        <GlassCard deep className="mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[560px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-ink/8 text-left font-bold tracking-[0.06em] text-mist uppercase">
                <th className="px-3 py-2">Clip</th>
                <th className="px-3 py-2">Filename</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.fileName} className="border-b border-ink/6 last:border-0">
                  <td className="px-3 py-2 text-ink">{check.label}</td>
                  <td className="px-3 py-2 font-mono text-mist">{check.fileName}</td>
                  <td className="px-3 py-2">
                    {check.status === "unconfigured" && (
                      <span className="text-mist">No base URL configured</span>
                    )}
                    {check.status === "checking" && (
                      <span className="flex items-center gap-1.5 text-mist">
                        <Loader2 className="size-3 animate-spin" /> checking…
                      </span>
                    )}
                    {check.status === "ok" && (
                      <span className="flex items-center gap-1.5 text-lime-neon">
                        <CheckCircle2 className="size-3.5" /> 200 OK
                      </span>
                    )}
                    {check.status === "error" && (
                      <span className="flex flex-col gap-0.5 text-red-400">
                        <span className="flex items-center gap-1.5">
                          <XCircle className="size-3.5" />
                          {check.httpStatus ?? "Failed"}
                        </span>
                        {check.detail && <span className="text-[11px] text-red-300">{check.detail}</span>}
                        {check.url && (
                          <a
                            href={check.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] break-all text-electric underline"
                          >
                            {check.url}
                          </a>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}

/**
 * Pulls the real, live variant list for the store straight from Lemon
 * Squeezy and cross-checks it against each tier's configured env var — a
 * 404 on checkout means the id below simply isn't in this list anymore.
 */
function LemonSqueezyVariantsPanel() {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<LemonSqueezyVariant[] | null>(null);
  const [tierChecks, setTierChecks] = useState<TierCheck[] | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setTopLevelError(null);
    try {
      const res = await fetch("/api/admin/lemonsqueezy-variants");
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.error) {
        setTopLevelError(body?.error ?? "Request failed.");
        setVariants(null);
        setTierChecks(null);
        return;
      }
      setVariants(body.variants ?? []);
      setTierChecks(body.tierChecks ?? []);
    } catch {
      setTopLevelError("Request failed.");
      setVariants(null);
      setTierChecks(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="gf-press flex items-center gap-2 rounded-xl border border-electric/30 bg-electric/8 px-4 py-2 text-xs font-bold text-electric transition-colors hover:bg-electric/14 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        Fetch live variants from Lemon Squeezy
      </button>

      {topLevelError && (
        <p className="mt-2 text-xs font-semibold text-red-400">{topLevelError}</p>
      )}

      {tierChecks && (
        <div className="mt-3 flex flex-col gap-2">
          {tierChecks.map((check) => (
            <GlassCard
              key={check.tier}
              deep
              className={clsx(
                "p-3 text-xs",
                check.existsInStore ? "border border-lime-neon/25" : "border border-red-500/30",
              )}
            >
              <div className="flex items-center gap-2 font-bold text-ink">
                {check.existsInStore ? (
                  <CheckCircle2 className="size-3.5 text-lime-neon" />
                ) : (
                  <XCircle className="size-3.5 text-red-400" />
                )}
                {check.label}
                <span className="font-normal text-haze">
                  · configured: {check.configuredId ?? "not set"}
                </span>
              </div>
              {!check.existsInStore && (
                <p className="mt-1 text-red-300">
                  This id doesn&apos;t exist in the store&apos;s variant list below —
                  that&apos;s the 404.
                </p>
              )}
              {!check.existsInStore && check.suggestion && (
                <p className="mt-1 text-mist">
                  Likely match by price ({formatMoney(check.expectedCents)}):{" "}
                  <span className="font-bold text-ink">{check.suggestion.variantName}</span> — id{" "}
                  <span className="font-mono">{check.suggestion.variantId}</span>
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {variants && (
        <GlassCard deep className="mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-ink/8 text-left font-bold tracking-[0.06em] text-mist uppercase">
                <th className="px-3 py-2">Variant id</th>
                <th className="px-3 py-2">Product / variant</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Billing</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.variantId} className="border-b border-ink/6 last:border-0">
                  <td className="px-3 py-2 font-mono text-ink">{variant.variantId}</td>
                  <td className="px-3 py-2 text-ink">
                    {variant.productName} — {variant.variantName}
                  </td>
                  <td className="px-3 py-2 text-mist">{variant.status}</td>
                  <td className="px-3 py-2 text-mist">{formatMoney(variant.priceCents)}</td>
                  <td className="px-3 py-2 text-mist">{billingSummary(variant)}</td>
                </tr>
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-mist">
                    No variants found for this store.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}

/**
 * Fires the same createCheckout() call the paywall triggers, for all three
 * tiers, and surfaces Lemon Squeezy's actual error back in the UI — the
 * config pills above only prove an env var is *set*, not that Lemon
 * Squeezy accepts it (wrong store/variant, unpublished variant, a
 * store/API-key mismatch, etc. all still 502 with just "Could not start
 * checkout" on the paywall itself).
 */
function CheckoutDiagnosticsPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setTopLevelError(null);
    try {
      const res = await fetch("/api/admin/checkout-diagnostics");
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.results) {
        setTopLevelError(body?.error ?? "Diagnostic request failed.");
        setResults(null);
        return;
      }
      setResults(body.results);
    } catch {
      setTopLevelError("Diagnostic request failed.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="gf-press flex items-center gap-2 rounded-xl border border-electric/30 bg-electric/8 px-4 py-2 text-xs font-bold text-electric transition-colors hover:bg-electric/14 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        Run live checkout test
      </button>

      {topLevelError && (
        <p className="mt-2 text-xs font-semibold text-red-400">{topLevelError}</p>
      )}

      {results && (
        <div className="mt-3 flex flex-col gap-2">
          {results.map((result) => (
            <GlassCard
              key={result.tier}
              deep
              className={clsx(
                "p-3 text-xs",
                result.ok ? "border border-lime-neon/25" : "border border-red-500/30",
              )}
            >
              <div className="flex items-center gap-2 font-bold text-ink">
                {result.ok ? (
                  <CheckCircle2 className="size-3.5 text-lime-neon" />
                ) : (
                  <XCircle className="size-3.5 text-red-400" />
                )}
                {result.label}
                {result.variantId && (
                  <span className="font-normal text-haze">· variant {result.variantId}</span>
                )}
              </div>
              {!result.ok && result.error && (
                <p className="mt-1 text-red-300">
                  {result.statusCode && (
                    <span className="mr-1 font-mono font-black">{result.statusCode}</span>
                  )}
                  {result.error}
                </p>
              )}
              {!result.ok && result.cause && (
                <p className="mt-1 break-all text-haze">{result.cause}</p>
              )}
              {result.actualCents !== undefined && result.actualCents !== null && (
                <p className="mt-1 text-mist">
                  Expected {formatMoney(result.expectedCents)}, Lemon Squeezy charges{" "}
                  {formatMoney(result.actualCents)}
                  {!result.ok && " — mismatch"}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Fires the same checkout_configurations call api/checkout/whop triggers,
 * for all three tiers, and surfaces Whop's actual response/error back in
 * the UI — this is the only way to see *why* checkout is failing without
 * access to Vercel's function logs (this app has no way to read those
 * directly). Each run creates a real (but never visited) Whop checkout
 * configuration tagged metadata.diagnostic — nobody pays anything.
 */
function WhopCheckoutDiagnosticsPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WhopDiagnosticResult[] | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setTopLevelError(null);
    try {
      const res = await fetch("/api/admin/whop-checkout-diagnostics");
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.results) {
        setTopLevelError(body?.error ?? "Diagnostic request failed.");
        setResults(null);
        return;
      }
      setResults(body.results);
    } catch {
      setTopLevelError("Diagnostic request failed.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="gf-press flex items-center gap-2 rounded-xl border border-electric/30 bg-electric/8 px-4 py-2 text-xs font-bold text-electric transition-colors hover:bg-electric/14 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        Run live Whop checkout test
      </button>

      {topLevelError && (
        <p className="mt-2 text-xs font-semibold text-red-400">{topLevelError}</p>
      )}

      {results && (
        <div className="mt-3 flex flex-col gap-2">
          {results.map((result) => (
            <GlassCard
              key={result.tier}
              deep
              className={clsx(
                "p-3 text-xs",
                result.ok ? "border border-lime-neon/25" : "border border-red-500/30",
              )}
            >
              <div className="flex items-center gap-2 font-bold text-ink">
                {result.ok ? (
                  <CheckCircle2 className="size-3.5 text-lime-neon" />
                ) : (
                  <XCircle className="size-3.5 text-red-400" />
                )}
                {result.label}
                {result.planId && (
                  <span className="font-normal text-haze">· plan {result.planId}</span>
                )}
              </div>
              {!result.ok && result.error && (
                <p className="mt-1 text-red-300">
                  {result.statusCode && (
                    <span className="mr-1 font-mono font-black">{result.statusCode}</span>
                  )}
                  {result.error}
                </p>
              )}
              {!result.ok && result.raw && (
                <p className="mt-1 break-all text-haze">{result.raw}</p>
              )}
              {result.ok && (
                <p className="mt-1 text-mist">Whop accepted this plan and returned a checkout URL.</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <GlassCard deep className="flex flex-col gap-2 p-4">
      <Icon className="size-4.5 text-electric" />
      <p className="gf-numeric text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-[11px] font-semibold tracking-[0.08em] text-mist uppercase">
        {label}
      </p>
    </GlassCard>
  );
}

function UserRow({ user }: { user: AdminUserRow }) {
  const [name, setName] = useState(user.name ?? "");
  const [plan, setPlan] = useState<PlanTier>(user.plan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function save(patch: Partial<{ name: string; plan: PlanTier }>) {
    setSaving(true);
    setError(false);
    setJustSaved(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2000);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-ink/6 align-middle last:border-0">
      <td className="px-4 py-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => {
            const trimmed = name.trim();
            if (trimmed && trimmed !== (user.name ?? "")) save({ name: trimmed });
          }}
          className="w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink outline-none hover:border-ink/10 focus:border-electric/40 focus:bg-ink/4"
        />
      </td>
      <td className="px-4 py-3 text-mist">{user.email}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={plan}
            onChange={(event) => {
              const next = event.target.value as PlanTier;
              setPlan(next);
              save({ plan: next });
            }}
            className="rounded-lg border border-ink/10 bg-transparent px-2 py-1 text-xs font-bold text-ink outline-none focus:border-electric/40"
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {plan === "FREE" && !saving && (
            <button
              type="button"
              onClick={() => {
                setPlan("PRO");
                save({ plan: "PRO" });
              }}
              className="gf-press whitespace-nowrap rounded-lg border border-lime-neon/40 bg-lime-neon/10 px-2 py-1 text-[10px] font-bold text-lime-deep transition-colors hover:bg-lime-neon/18"
            >
              Grant PRO
            </button>
          )}
        </div>
        {saving && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-mist">
            <Loader2 className="size-2.5 animate-spin" /> Saving…
          </span>
        )}
        {justSaved && !saving && (
          <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-lime-deep">
            <CheckCircle2 className="size-2.5" /> Saved
          </span>
        )}
        {error && <span className="mt-1 block text-[10px] text-red-500">Failed — try again</span>}
      </td>
      <td className="px-4 py-3">
        {user.hasAcceptedTerms ? (
          <Pill tone="lime">
            <CheckCircle2 className="size-3" /> Accepted
          </Pill>
        ) : (
          <Pill tone="neutral">
            <XCircle className="size-3" /> Pending
          </Pill>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-mist">
        {user.quiz
          ? `${user.quiz.goal ? goalLabel(user.quiz.goal) : "—"} · ${user.quiz.level ? levelLabel(user.quiz.level) : "—"}${user.quiz.daysPerWeek ? ` · ${user.quiz.daysPerWeek}d/wk` : ""}`
          : "Not taken"}
      </td>
      <td className="px-4 py-3 text-xs text-mist">
        {user.latestOrder
          ? `${user.latestOrder.tierLabel} · ${formatMoney(user.latestOrder.priceCents)} · ${formatDate(user.latestOrder.createdAt)}`
          : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-mist">{formatDate(user.createdAt)}</td>
    </tr>
  );
}
