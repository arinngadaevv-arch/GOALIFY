"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { Pill } from "@/components/goalify/ui/stat";
import { goalLabel, levelLabel } from "@/lib/goalify/plan";
import type { Goal, Level } from "@/lib/goalify/types";

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

export type CheckoutConfig = {
  storeId: boolean;
  apiKey: boolean;
  webhookSecret: boolean;
  variants: { tier: string; label: string; configured: boolean }[];
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
  users,
  checkoutConfig,
}: {
  stats: AdminStats;
  users: AdminUserRow[];
  checkoutConfig: CheckoutConfig;
}) {
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
          Lemon Squeezy&apos;s <code>order_created</code> webhook once a payment
          has actually settled — nothing here reflects a checkout that was
          started but not completed.
        </p>

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

        {/* --------------------------------------------------------- Users */}
        <section className="mt-10">
          <h2 className="gf-display text-xl font-extrabold text-ink">
            Users &amp; plans
          </h2>
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
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-mist">
                      No users yet.
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

  async function save(patch: Partial<{ name: string; plan: PlanTier }>) {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
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
        {saving && <span className="ml-2 text-[10px] text-mist">Saving…</span>}
        {error && <span className="ml-2 text-[10px] text-red-500">Failed</span>}
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
